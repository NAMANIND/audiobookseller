import { Suspense } from "react";
import ConfirmationContent from "./confirmation-content";

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-emerald-600">
              Processing your payment...
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your purchase.
            </p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
