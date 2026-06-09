"use client";

import { useState } from "react";
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
type PurchaseStep = "email" | "otp";

export function PurchaseDialog({ isOpen, onClose, book }: PurchaseDialogProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>("purchase");
  const [processingStep, setProcessingStep] = useState<string>(
    "Verifying payment...",
  );
  const [isRazorpayActive, setIsRazorpayActive] = useState(false);

  const isMyPurchases = !book.id;

  const resetState = () => {
    setDialogState("purchase");
    setEmail("");
    setOtp("");
    setPurchaseStep("email");
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
    toast.success("Check your email for the verification code");
  };

  const verifyOtpAndSendPurchases = async () => {
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

    const response = await fetch("/api/purchases/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send purchases");
    }

    return response.json();
  };

  const handlePurchase = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (isMyPurchases && purchaseStep === "otp" && otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setDialogState("loading");

    try {
      // My Purchases flow
      if (isMyPurchases) {
        if (purchaseStep === "email") {
          await sendOtp();
          setDialogState("purchase");
          return;
        }

        const data = await verifyOtpAndSendPurchases();

        setDialogState("success");
        toast.success(
          data.message || "Check your email for all your purchased audiobooks!",
          { duration: 5000 },
        );

        setTimeout(() => onClose(), 2000);
        return;
      }

      // Purchase flow: Email -> OTP -> Razorpay
      if (purchaseStep === "email") {
        await sendOtp();
        setPurchaseStep("otp");
        setDialogState("purchase");
        return;
      }

      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Invalid verification code");
      }

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          email,
          price: book.price,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: book.price * 100,
        currency: "INR",
        name: "Audiobook Seller",
        description: `Purchase: ${book.title}`,
        order_id: order.id,

        handler: async function (response: any) {
          try {
            setIsRazorpayActive(false);
            setDialogState("processing");

            setProcessingStep("Verifying payment...");
            await new Promise((resolve) => setTimeout(resolve, 100));

            setProcessingStep("Processing your purchase...");

            const verifyPaymentResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookId: book.id,
                bookTitle: book.title,
                email,
              }),
            });

            if (!verifyPaymentResponse.ok) {
              throw new Error("Payment verification failed");
            }

            setProcessingStep("Preparing your download...");
            await new Promise((resolve) => setTimeout(resolve, 800));

            setProcessingStep("Sending confirmation email...");
            await new Promise((resolve) => setTimeout(resolve, 800));

            setDialogState("success");

            toast.success(
              "Payment successful! Check your email for access to your audiobook.",
              { duration: 5000 },
            );

            setTimeout(() => onClose(), 2000);
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            setIsRazorpayActive(false);
            setDialogState("error");
          }
        },

        prefill: {
          email,
        },

        theme: {
          color: "#22c55e",
        },
      };

      const razorpay = new window.Razorpay(options);

      setIsRazorpayActive(true);

      razorpay.on("payment.success", options.handler);

      razorpay.on("payment.error", function (error: any) {
        console.error("Payment error:", error);
        toast.error("Payment failed");
        setIsRazorpayActive(false);
        setDialogState("error");
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to process request");
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
                Processing Request
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Please wait while we process your request...
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-emerald-200 rounded w-3/4"></div>
                <div className="h-4 bg-emerald-200 rounded w-1/2"></div>
              </div>
            </div>
          </>
        );
      case "processing":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 text-2xl">
                Processing Your Purchase
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="text-center space-y-3">
                <p className="text-emerald-700 font-medium text-lg animate-pulse">
                  {processingStep}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  This may take a few moments. Please don&apos;t close this
                  window.
                </p>
              </div>
            </div>
          </>
        );
      case "success":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-600 text-2xl">
                {book.id ? "Purchase Successful!" : "Email Sent!"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {book.id
                  ? "Thank you for your purchase."
                  : "We've sent your audiobooks to your email address."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-emerald-50 backdrop-blur-xl p-4 rounded-lg border border-emerald-200 space-y-2">
                {book.id && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Book:</span>
                    <span className="text-emerald-700 font-light">
                      {book.title}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-emerald-700 font-light">{email}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {book.id
                  ? "A download link has been sent to your email address. Please check your inbox."
                  : "Please check your inbox for the download links to all your purchased audiobooks."}
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
                There was an issue processing your request. Please try again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogState("purchase")}
                className="border-emerald-300 text-gray-700 hover:text-emerald-700 hover:border-emerald-400"
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
                {book.id
                  ? "Complete Your Purchase"
                  : "Retrieve Your Audiobooks"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {book.id
                  ? "Enter your email address to receive the download link."
                  : purchaseStep === "email"
                    ? "Enter the email you used when purchasing. We'll send a verification code."
                    : `Enter the 6-digit code sent to ${email}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {purchaseStep === "email" ? (
                <div className="grid gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-emerald-300 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="bg-white border-emerald-300 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400 text-center text-lg tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              )}
              {book.id ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-emerald-600 font-semibold">
                    ₹{book.price}
                  </span>
                </div>
              ) : purchaseStep === "email" ? (
                <p className="text-sm text-gray-500 font-light">
                  We&apos;ll verify your email before sending your audiobooks.
                </p>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              {isMyPurchases && purchaseStep === "otp" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPurchaseStep("email");
                    setOtp("");
                  }}
                  disabled={isLoading}
                  className="border-emerald-300 text-gray-700"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-2.5 rounded-full transition-all duration-300 font-light border border-emerald-300 hover:border-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                {isLoading
                  ? "Processing..."
                  : book.id
                    ? "Purchase"
                    : purchaseStep === "email"
                      ? "Send Verification Code"
                      : "Verify & Send Audiobooks"}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  if (isRazorpayActive) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={dialogState === "processing" ? undefined : handleClose}
    >
      <DialogContent
        className="sm:max-w-[425px] bg-white/98 backdrop-blur-sm border-emerald-300"
        showCloseButton={false}
      >
        {dialogState !== "processing" && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            <X className="h-4 w-4 text-gray-600 hover:text-emerald-600 transition-colors" />
            <span className="sr-only">Close</span>
          </button>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
