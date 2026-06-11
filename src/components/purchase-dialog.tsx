"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { downloadPurchaseFile } from "@/lib/download-client";

interface PurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    price: number;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

type DialogState = "purchase" | "loading" | "success" | "error" | "processing";
type PurchaseStep = "auth" | "otp";

const OTP_RESEND_COOLDOWN_SEC = 30;

export function PurchaseDialog({ isOpen, onClose, book }: PurchaseDialogProps) {
  const router = useRouter();
  const paymentHandledRef = useRef(false);
  const razorpayRef = useRef<InstanceType<typeof window.Razorpay> | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("auth");
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>("purchase");
  const [processingStep, setProcessingStep] = useState("Verifying payment...");
  const [isRazorpayActive, setIsRazorpayActive] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!isRazorpayActive || !razorpayRef.current) return;

    const razorpay = razorpayRef.current;
    razorpayRef.current = null;
    razorpay.open();
  }, [isRazorpayActive]);

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => {
        if (data.user) {
          setSession(data.user);
          setEmail(data.user.email);
          setName(data.user.name ?? "");
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const isAuthenticated = Boolean(session?.email);
  const googleHref = `/api/auth/google?returnTo=${encodeURIComponent("/#audiobook")}`;

  const resetState = () => {
    paymentHandledRef.current = false;
    setDialogState("purchase");
    setIsRazorpayActive(false);
    setOtp("");
    setPurchaseStep("auth");
    setResendCooldown(0);
    if (!session) {
      setEmail("");
      setName("");
    }
  };

  const sendOtp = async () => {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send verification code");
    }

    setPurchaseStep("otp");
    setResendCooldown(OTP_RESEND_COOLDOWN_SEC);
    toast.success("Check your email for the verification code");
  };

  const verifyOtp = async () => {
    const verifyResponse = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      throw new Error(error.error || "Invalid verification code");
    }

    const sessionResponse = await fetch("/api/auth/session", {
      credentials: "include",
    });
    const data = await sessionResponse.json();
    const user = data.user ?? {
      email: email.toLowerCase(),
      provider: "email" as const,
    };
    setSession(user);
    setEmail(user.email);
    return user;
  };

  const startRazorpay = async (userEmail: string, userName?: string) => {
    paymentHandledRef.current = false;

    const orderResponse = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: book.id,
        email: userEmail,
        price: book.price,
      }),
    });

    if (!orderResponse.ok) {
      throw new Error("Failed to create order");
    }

    const order = await orderResponse.json();

    const handleSuccess = async (response: {
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      if (paymentHandledRef.current) return;
      paymentHandledRef.current = true;

      setIsRazorpayActive(false);
      setDialogState("processing");
      setProcessingStep("Confirming payment...");

      try {
        const verifyPaymentResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookId: book.id,
            email: userEmail,
          }),
        });

        const data = await verifyPaymentResponse.json();

        if (!verifyPaymentResponse.ok) {
          throw new Error(data.error || "Payment verification failed");
        }

        setProcessingStep("Starting download...");

        if (data.purchaseId) {
          await downloadPurchaseFile(data.purchaseId, book.title);
        }

        toast.success("Payment successful! Download started.");
        resetState();
        onClose();
        router.push("/purchases");
      } catch (error) {
        console.error("Payment verification error:", error);
        paymentHandledRef.current = false;
        toast.error(
          error instanceof Error
            ? error.message
            : "Payment verification failed",
        );
        setIsRazorpayActive(false);
        setDialogState("error");
      }
    };

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: book.price * 100,
      currency: "INR",
      name: "Audiobook Seller",
      description: `Purchase: ${book.title}`,
      order_id: order.id,
      handler: handleSuccess,
      prefill: {
        email: userEmail,
        name: userName,
      },
      theme: { color: "#22c55e" },
      modal: {
        ondismiss: () => {
          if (paymentHandledRef.current) return;
          setIsRazorpayActive(false);
          setDialogState("purchase");
        },
        escape: true,
        backdropclose: false,
      },
    };

    razorpayRef.current = new window.Razorpay(options);
    setDialogState("processing");
    setProcessingStep("Complete payment in Razorpay...");
    setIsRazorpayActive(true);
  };

  const handlePurchase = async () => {
    if (!book.id) return;

    if (!isAuthenticated) {
      if (purchaseStep === "auth") {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast.error("Please enter a valid email address");
          return;
        }

        setIsLoading(true);
        setDialogState("loading");
        try {
          await sendOtp();
          setDialogState("purchase");
        } catch (error: any) {
          toast.error(error.message || "Failed to send code");
          setDialogState("error");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (otp.length !== 6) {
        toast.error("Please enter the 6-digit verification code");
        return;
      }

      setIsLoading(true);
      setDialogState("loading");
      try {
        await verifyOtp();
        setPurchaseStep("auth");
        setDialogState("purchase");
      } catch (error: any) {
        toast.error(error.message || "Verification failed");
        setDialogState("error");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      setDialogState("purchase");
      await startRazorpay(session!.email, session!.name ?? (name || undefined));
    } catch (error: any) {
      toast.error(error.message || "Failed to start checkout");
      setDialogState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      await sendOtp();
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (dialogState) {
      case "loading":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 text-2xl">
                Processing
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Please wait...
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 animate-pulse space-y-4">
              <div className="h-4 bg-emerald-200 rounded w-3/4" />
              <div className="h-4 bg-emerald-200 rounded w-1/2" />
            </div>
          </>
        );
      case "processing":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 text-2xl">
                Processing Purchase
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-emerald-700 font-medium text-lg animate-pulse">
                {processingStep}
              </p>
            </div>
          </>
        );
      case "success":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 text-2xl">
                Purchase Successful!
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Your download has started. You can access it anytime from My
                Purchases.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 text-sm text-gray-600">
              <p>
                <span className="text-gray-500">Book:</span> {book.title}
              </p>
              <p>
                <span className="text-gray-500">Email:</span> {email}
              </p>
            </div>
          </>
        );
      case "error":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-red-600 text-2xl">Error</DialogTitle>
              <DialogDescription className="text-gray-600">
                Something went wrong. Please try again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogState("purchase")}
              >
                Try Again
              </Button>
            </DialogFooter>
          </>
        );
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 text-2xl">
                Complete Your Purchase
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {isAuthenticated
                  ? "You're signed in. Continue to secure checkout."
                  : purchaseStep === "auth"
                    ? "Sign in with Google or verify your email to continue."
                    : `Enter the code sent to ${email}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {isAuthenticated ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 space-y-1 text-sm">
                  {session?.name && (
                    <p className="text-gray-800">
                      <span className="text-gray-500">Name:</span>{" "}
                      {session.name}
                    </p>
                  )}
                  <p className="text-gray-800">
                    <span className="text-gray-500">Email:</span>{" "}
                    {session?.email}
                  </p>
                  <p className="text-gray-500 text-xs pt-1">
                    Signed in via{" "}
                    {session?.provider === "google" ? "Google" : "email"}
                  </p>
                </div>
              ) : purchaseStep === "auth" ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full"
                  >
                    <a href={googleHref}>Continue with Google</a>
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400 uppercase">
                      or email
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-lg tracking-widest placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCooldown > 0}
                    className="text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Resend code"}
                  </button>
                </>
              )}

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-gray-600">Total</span>
                <span className="text-emerald-600 font-semibold">
                  ₹{book.price}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 flex flex-col">
              {!isAuthenticated && purchaseStep === "otp" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPurchaseStep("auth");
                    setOtp("");
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button
                className=" rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handlePurchase}
                disabled={isLoading || !book.id}
              >
                {isLoading
                  ? "Processing..."
                  : isAuthenticated
                    ? "Pay Now"
                    : purchaseStep === "auth"
                      ? "Send Verification Code"
                      : "Verify & Continue"}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog
      open={isOpen && !isRazorpayActive}
      modal={!isRazorpayActive}
      onOpenChange={
        dialogState === "processing" || isRazorpayActive
          ? undefined
          : handleClose
      }
    >
      <DialogContent
        className="sm:max-w-[425px] bg-white/98 border-emerald-300"
        showCloseButton={false}
      >
        {dialogState !== "processing" && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
