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

export function PurchaseDialog({ isOpen, onClose, book }: PurchaseDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>("purchase");
  const [processingStep, setProcessingStep] = useState<string>("Verifying payment...");
  const [isRazorpayActive, setIsRazorpayActive] = useState(false);

  const handlePurchase = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setDialogState("loading");

    try {
      // Check if this is "My Purchases" flow (no book.id) or purchase flow
      if (!book.id) {
        // My Purchases flow - send all purchases to email
        const response = await fetch("/api/purchases/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send purchases");
        }

        const data = await response.json();
        
        setDialogState("success");
        toast.success(
          data.message || "Check your email for all your purchased audiobooks!",
          {
            duration: 5000,
          }
        );
        
        setTimeout(() => {
          onClose();
        }, 2000);
        
        return;
      }

      // Regular purchase flow
      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: book.price * 100, // amount in smallest currency unit
        currency: "INR",
        name: "Audiobook Seller",
        description: `Purchase: ${book.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Show dialog again with processing state
            setIsRazorpayActive(false);
            setDialogState("processing");
            setProcessingStep("Verifying payment...");
            
            // Small delay to ensure dialog is rendered
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verify payment
            setProcessingStep("Processing your purchase...");
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookId: book.id,
                bookTitle: book.title,
                email,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            setProcessingStep("Granting access to your audiobook...");
            
            // Small delay to show the final step
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setProcessingStep("Sending confirmation email...");
            
            // Another small delay
            await new Promise(resolve => setTimeout(resolve, 800));

            setDialogState("success");
            toast.success(
              "Payment successful! Check your email for access to your audiobook.",
              {
                duration: 5000,
              }
            );
            
            setTimeout(() => {
              onClose();
            }, 2000);
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

      // Hide dialog while Razorpay is active (but keep it mounted)
      setIsRazorpayActive(true);

      razorpay.on("payment.success", async function (response: any) {
        try {
          // Show dialog again with processing state
          setIsRazorpayActive(false);
          setDialogState("processing");
          setProcessingStep("Verifying payment...");
          
          // Small delay to ensure dialog is rendered
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Verify payment
          setProcessingStep("Processing your purchase...");
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              bookId: book.id,
              bookTitle: book.title,
              email,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error("Payment verification failed");
          }

          setProcessingStep("Granting access to your audiobook...");
          
          // Small delay to show the final step
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setProcessingStep("Sending confirmation email...");
          
          // Another small delay
          await new Promise(resolve => setTimeout(resolve, 800));

          setDialogState("success");
          toast.success(
            "Payment successful! Check your email for access to your audiobook.",
            {
              duration: 5000,
            }
          );
          
          setTimeout(() => {
            onClose();
          }, 2000);
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed");
          setIsRazorpayActive(false);
          setDialogState("error");
        }
      });

      razorpay.on("payment.error", function (error: any) {
        console.error("Payment error:", error);
        toast.error("Payment failed");
        setIsRazorpayActive(false);
        setDialogState("error");
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Purchase error:", error);
      const errorMessage = error.message || "Failed to process request";
      toast.error(errorMessage);
      setDialogState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDialogState("purchase");
    setEmail("");
    onClose();
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
              <div className="flex items-center justify-center">
                
              </div>
              <div className="text-center space-y-3">
                <p className="text-emerald-700 font-medium text-lg animate-pulse">
                  {processingStep}
                </p>
               
                <p className="text-sm text-gray-500 mt-4">
                  This may take a few moments. Please don't close this window.
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
                    <span className="text-emerald-700 font-light">{book.title}</span>
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
              <DialogTitle className="text-red-600 text-2xl">
                Error
              </DialogTitle>
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
                {book.id ? "Complete Your Purchase" : "Retrieve Your Audiobooks"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {book.id 
                  ? "Enter your email address to receive the download link."
                  : "Enter the email address you used earlier for purchasing. We will send you all the audiobooks you have purchased so far to your email."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
              {book.id ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-emerald-600 font-semibold">
                    ₹{book.price}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-light">
                  We'll send a link to your email with all your purchased audiobooks.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-2.5 rounded-full transition-all duration-300 font-light border border-emerald-300 hover:border-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                {isLoading ? "Processing..." : (book.id ? "Purchase" : "Send My Audiobooks")}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  // Don't render dialog at all when Razorpay is active
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
