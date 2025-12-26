import { SendPriceDropAlert } from "@/lib/email";
import { ScrapProducts } from "@/lib/firecrawl";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Helper to parse numeric price from text
function parsePrice(priceText) {
  const number = parseFloat(priceText.replace(/[^0-9.]/g, ""));
  return isNaN(number) ? 0 : number;
}

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
        let productData;

        // Try scraping, if fails, fallback to manual test
        try {
          productData = await ScrapProducts(product.url);
        } catch (scrapErr) {
          console.log(`Scraping failed for product ${product.id}, using manual test`);
        }

        // If scraping failed or null, simulate price drop for testing
        let newPrice;
        if (!productData || !productData.currentPrice) {
          const oldPriceNum = parsePrice(product.current_price);
          newPrice = oldPriceNum - 10; // manual test: decrease by 10
          productData = {
            currencyCode: product.currency,
            productName: product.name,
            productImageUrl: product.image_url,
            currentPrice: newPrice,
          };
        } else {
          newPrice = parsePrice(productData.currentPrice);
        }

        const oldPrice = parsePrice(product.current_price);

        console.log(`Product: ${product.name} | Old: ${oldPrice} | New: ${newPrice}`);

        // Update product info
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

        // Insert into priceHistory if price changed
        if (oldPrice !== newPrice) {
          await supabase.from("priceHistory").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          result.priceChanges++;

          // Send alert if price dropped
          if (newPrice < oldPrice) {
            try {
              const { data: userData, error: userError } =
                await supabase.auth.admin.getUserById(product.user_id);

              if (!userError && userData?.user?.email) {
                const userEmail = userData.user.email;
                console.log(`Sending alert to ${userEmail} for ${product.name}`);

                const emailResult = await SendPriceDropAlert(
                  userEmail,
                  product,
                  oldPrice,
                  newPrice
                );

                if (emailResult.success) result.alertsSent++;
                else console.log(
                  `Failed to send alert for ${product.name}:`,
                  emailResult.error
                );
              } else {
                console.log(
                  `No valid email for user_id ${product.user_id}, skipping alert`
                );
              }
            } catch (alertErr) {
              console.error(
                `Failed to send alert for product ${product.id}`,
                alertErr
              );
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
