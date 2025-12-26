import { SendPriceDropAlert } from "@/lib/email";
import { ScrapProducts } from "@/lib/firecrawl";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "price check endpoint is working",
  });
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY 
    );

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*");

    if (productError) throw productError;

    console.log(`Found ${products.length} products to check`);

    const result = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
    };

    for (const product of products) {
      try {
        const productData = await ScrapProducts(product.url);

        if (!productData) {
          result.failed++;
          continue;
        }

        const newPrice = parseFloat(productData.currentPrice);
        const oldPrice = parseFloat(product.current_price);

        await supabase
          .from("products")
          .update({
            current_price: newPrice,
            currency: productData.currencyCode || product.currency,
            name: productData.productName || product.name,
            image_url: productData.productImageUrl || product.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (oldPrice !== newPrice) {
          await supabase.from("priceHistory").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          result.priceChanges++;

          if (newPrice < oldPrice) {
            const { data, error } = await supabase.auth.admin.getUserById(
              product.user_id
            );

            if (!error && data?.user?.email) {
              const userEmail = data.user.email;

              const emailResult = await SendPriceDropAlert(
                userEmail,
                product,
                oldPrice,
                newPrice
              );

              if (emailResult.success) result.alertsSent++;
            }
          }
        }

        result.updated++;
      } catch (err) {
        console.error(`Failed to update product ${product.id}`, err);
        result.failed++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cron job executed",
        summary: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job failed", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message ?? error,
      },
      { status: 500 }
    );
  }
}
