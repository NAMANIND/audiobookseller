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

type DialogState = "purchase" | "loading" | "success" | "error";

export function PurchaseDialog({ isOpen, onClose, book }: PurchaseDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>("purchase");

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
            // Verify payment
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

            setDialogState("success");
            onClose();
            setTimeout(() => {
              onClose();
            }, 100);
            toast.success(
              "Payment successful! Check your email for the download link.",
              {
                duration: 5000,
              }
            );
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            setDialogState("error");
            onClose();
            setTimeout(() => {
              onClose();
            }, 100);
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

      // Close the dialog before opening Razorpay
      onClose();

      razorpay.on("payment.success", async function (response: any) {
        try {
          // Verify payment
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

          // Reopen dialog with success state
          setDialogState("success");
          onClose();
          setTimeout(() => {
            onClose();
          }, 100);

          toast.success(
            "Payment successful! Check your email for the download link.",
            {
              duration: 5000,
            }
          );
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed");
          setDialogState("error");
          onClose();
          setTimeout(() => {
            onClose();
          }, 100);
        }
      });

      razorpay.on("payment.error", function (error: any) {
        console.error("Payment error:", error);
        toast.error("Payment failed");
        setDialogState("error");
        onClose();
        setTimeout(() => {
          onClose();
        }, 100);
      });

      razorpay.open();
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to process purchase");
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
              <DialogTitle className="text-emerald-400 text-2xl">
                Processing Payment
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Please wait while we process your payment...
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-emerald-500/20 rounded w-3/4"></div>
                <div className="h-4 bg-emerald-500/20 rounded w-1/2"></div>
              </div>
            </div>
          </>
        );
      case "success":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-emerald-400 text-2xl">
                Purchase Successful!
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Thank you for your purchase. Here are your purchase details:
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-black/40 backdrop-blur-xl p-4 rounded-lg border border-emerald-500/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Book Title:</span>
                  <span className="text-emerald-400 font-light">
                    {book.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Amount Paid:</span>
                  <span className="text-emerald-400 font-light">
                    ₹{book.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Email:</span>
                  <span className="text-emerald-400 font-light">{email}</span>
                </div>
              </div>
              <p className="text-zinc-400 text-sm">
                A download link has been sent to your email address. Please
                check your inbox.
              </p>
            </div>
          </>
        );
      case "error":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-red-400 text-2xl">
                Payment Error
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                There was an issue processing your payment. Please try again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogState("purchase")}
                className="border-emerald-500/20 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500"
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
              <DialogTitle className="text-emerald-400 text-2xl">
                Complete Your Purchase
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Enter your email address to receive the download link.
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
                  className="bg-black/50 border-emerald-500/20 focus:border-emerald-500 text-white placeholder:text-zinc-400"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Total Amount:</span>
                <span className="text-emerald-400 font-semibold">
                  ₹{book.price}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-full transition-all duration-300 font-light border border-emerald-500/20 hover:border-emerald-500/40 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                {isLoading ? "Processing..." : "Purchase"}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-black/95 backdrop-blur-sm border-emerald-500/20">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-zinc-400 hover:text-emerald-400 transition-colors" />
          <span className="sr-only">Close</span>
        </button>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
