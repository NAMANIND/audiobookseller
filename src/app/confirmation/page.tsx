"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const paymentId = searchParams.get("razorpay_payment_id");
    const orderId = searchParams.get("razorpay_order_id");
    const signature = searchParams.get("razorpay_signature");

    if (paymentId && orderId && signature) {
      // Here you would typically verify the payment with your backend
      setStatus("success");
    } else {
      setStatus("error");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-emerald-600">
            Processing your payment...
          </h1>
          <p className="text-gray-600">Please wait while we confirm your purchase.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Payment Error
          </h1>
          <p className="text-gray-600">There was an issue processing your payment. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-emerald-600">
          Payment Successful!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. You will receive an email with your
          audiobook shortly.
        </p>
      </div>
    </div>
  );
}
