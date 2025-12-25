"use client";
import React, { useState } from "react";
import { Authmodel } from "./Authmodels";
import { Button } from "./button";
import { LogIn } from "lucide-react";
import { signInOut} from "@/app/action";

export const Authbutton = ({ user }) => {
  const [showauthmodel, setshowauthmodel] = useState(false);

    if (user) {
    const name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email;

    return (
      <div className="flex items-center gap-3">

        <span className="text-sm font-medium">
          Hi, {name}
        </span>

        <form action={signInOut}>
          <Button
            type="submit"                
            size="sm"
            className="bg-orange-500 hover:bg-orange-600"
          >
            Sign out
          </Button>
        </form>
      </div>
    );
  }
return(
  <>
  <Button
        className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
        size="sm"
        variant="default"
        onClick={() => setshowauthmodel(true)}
      >
        <LogIn className="w-4 h-4" /> Sign in
      </Button>

      <Authmodel
        isOpen={showauthmodel}
        onClose={() => setshowauthmodel(false)}
      />

  </>
)
};
