
import { Button } from "@/components/ui/button";
import "../pages/page.css";
import { LogIn } from "lucide-react";
import { TrendingDown, Shield, Bell, Rabbit } from "lucide-react";
import { AddProductsform } from "@/components/ui/addProductsform";
import { Authbutton } from "@/components/ui/Authbutton";
import { createClient } from "@/utils/server";
 import { IoTrendingDownOutline } from "react-icons/io5";
import { getProducts } from "./action";
import { ProductCard } from "@/components/ui/ProductCard";

export default async function Home() {
  const FEATURES = [
    {
      icon: Rabbit,
      title: "Lightning Fast",
      description:
        "Deal Drop extracts prices in seconds, handling JavaScript and dynamic content",
    },
    {
      icon: Shield,
      title: "Always Reliable",
      description:
        "Works across all major e-commerce sites with built-in anti-bot protection",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified instantly when prices drop below your target",
    },

    
  ];
   const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user;
  
  const products = user?await getProducts():[];
  return (
    <>
      <header>
        <div className="nav-div">
          <div className="logo">
            <img src="/deal-drop-logo.png" alt="dealdrop-logo" />
          </div>
          <div className="sigin">
           <Authbutton user={user}/>
          </div>
        </div>
      </header>

      <section className="herosection">
        <div className="hero-container">
          <p className="madeby">Made with 🧡 by Tanish</p>

          <h1>Never Miss a Price Drop</h1>

          <p className="subtitle">
            Track prices from e-commerce sites. Get instant alerts when prices
            drop and save money effortlessly.
          </p>

          <div className="track-box">
            <AddProductsform user={user}/>
          </div>

          <div className="hero-sectioncard">
            {user&& products.length==0&&FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div className="feature-card" key={idx}>
                  <Icon className="feature-icon" />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {user&& products.length>0&&(
          <section className="max-w 7xl mx-auto px-4 pb-20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mt-4 pl-8">Your Tracked Products</h3>
              <span className="text-sm text-gray-500 pr-8">
                {products.length}{products.length===1?"product":"products"}
              </span>
            </div>
            <div className="grid gap-6 grid-cols-2 items-start">
            {products.map((item)=>{
              return(
               <ProductCard key={item.id} product={item}/>
              )
            })}
            </div>

          </section>
        )}

       
      {/*product list*/}
      {user&& products.length==0 &&(
        <section>
          <div className="Trending-down">
            <TrendingDown color="gray" size={80}/>
             <div className="trending-details">
              <h4>No Product Yet</h4>
              <p>Add Your First Products  to start tracking prices</p>
             </div>
          </div>
        </section>
      )}
      </section>
    </>
  );
}
