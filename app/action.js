"use server";

import { ScrapProducts } from "@/lib/firecrawl";
import { createClient } from "@/utils/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function Addproducts(formData) {
  const url = formData.get("url");
  if (!url) return { error: "URL is required" };

  try {
    const supabase = await createClient();

    // get logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // scrape data
    const scraped = await ScrapProducts(url);
    const productData = scraped?.json; // <-- IMPORTANT

    if (!productData?.productName || !productData?.currentPrice) {
      console.log(scraped, "scraped product data");
      return { error: "Could not extract product info" };
    }

    // convert ₹ price -> number
    const newPrice = parseFloat(
      productData.currentPrice.replace(/[^\d.]/g, "")
    );

    const currency = productData.currencyCode || "INR";

    // check if product already exists
    const { data: existing } = await supabase
      .from("products")
      .select("id,current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .single();

    const isUpdate = !!existing;

    // UPSERT product
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: productData.productName,
          image_url: productData.productImageUrl,
          current_price: newPrice,
          currency,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url", // requires unique constraint
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw error;

    // add price history if first time / price changed
    const shouldAddHistory = !isUpdate || existing?.current_price !== newPrice;

    // ADD PRICE HISTORY
if (shouldAddHistory) {
  const { error: historyError } = await supabase
    .from("priceHistory")
    .insert({
      product_id: product.id,
      user_id: user.id,
      price: newPrice,
     currency: currency || "INR",
      checked_at: new Date().toISOString(),
    });

  if (historyError)
    console.error("Price history insert error:", historyError);
}


    revalidatePath("/");

    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated with latest price!"
        : "Product added successfully!",
    };

  } catch (err) {
    console.error("Add product error:", err);
    return { error: err.message || "Something went wrong" };
  }
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}


export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("priceHistory")
      .select("*")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}
