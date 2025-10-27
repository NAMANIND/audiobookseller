"use client";

import { useState } from "react";
import { PurchaseDialog } from "@/components/purchase-dialog";

export function Navigation() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200 sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a
            href="/"
            className="text-2xl font-light text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Audiobook Seller
          </a>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-light text-gray-600 hover:text-emerald-600 transition-colors"
            >
              My Purchases
            </button>
          </div>
        </nav>
      </header>

      <PurchaseDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={{
          id: "",
          title: "",
          price: 0,
        }}
      />
    </>
  );
}

