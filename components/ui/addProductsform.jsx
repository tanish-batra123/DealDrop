"use client";

import React,{ useState } from "react";
import { Button } from "./button";
import { Addproducts } from "@/app/action";
import { toast } from "sonner";
import { Authmodel } from "./Authmodels";
import { Loader } from "lucide-react";

export const AddProductsform = ({ user }) => {
  const[url,seturl]=useState("")
  const[loading,setloading]=useState(false)
   const [showauthmodel, setshowauthmodel] = useState(false);
   
  const handlesumit=async(e)=>{
    e.preventDefault()
    if(!user){
      setshowauthmodel(true);
      return;
    }
    setloading(true)
     const formData=new FormData();
     formData.append("url",url)
     const result=await Addproducts(formData)

     if(result.error){
      toast.error(result.error)
     }else{
      toast.success(result.message||"product track successfully")
      seturl("")
     }
     setloading(false)
  }
  return (
    <>
    <form onSubmit={handlesumit}>
      
      <input
        type="text"
        placeholder="Paste product URL (Amazon, Flipkart etc.)"
        value={url}
        onChange={(e)=>{seturl(e.target.value)}}
        required
        disabled={loading}
      />
      <Button className="bg-orange-500 hover:bg-orange-600 h-10 m-2" type="submit" disabled={loading}>
        {loading ? (
          <>
          <Loader className="mr-2 h-4 w-4 animate-spin"/>
          Adding...
          </>
        ):(
          "Track Price"
        )
        }
      </Button>
    </form>

    <Authmodel
            isOpen={showauthmodel}
            onClose={() => setshowauthmodel(false)}
          />
    </>
     

    
  );
};
{
  /*<input
              type="text"
              placeholder="Paste product URL (Amazon, Flipkart etc.)"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 h-11">
              Track Price
            </Button>*/
}
