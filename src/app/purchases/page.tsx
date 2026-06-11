import { Suspense } from "react";
import PurchasesPage from "./page.client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--cream-light)] pt-28 pb-16 section-shell-wide">
          <div className="h-10 w-48 bg-white/60 rounded animate-pulse mb-8" />
          <div className="h-64 rounded-3xl bg-white/60 animate-pulse" />
        </div>
      }
    >
      <PurchasesPage />
    </Suspense>
  );
}
