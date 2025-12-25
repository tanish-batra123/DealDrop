"use client ";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/client";
import { FcGoogle } from "react-icons/fc";

export function Authmodel({ isOpen, onClose }) {
  const supabase=createClient();
  const handleGoogleLogin=async()=>{
    const{origin}=window.location;
    await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{
      redirectTo:`${origin}/auth/callback`
      }
    })
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to DealDrop</DialogTitle>
          <DialogDescription>
            Track product prices and get instant alerts when prices drop.
          </DialogDescription>
        </DialogHeader>

        {/*  BODY */}
        <div className="mt-4 space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer">Terms</span> and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
