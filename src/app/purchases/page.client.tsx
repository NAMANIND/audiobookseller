"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginPanel } from "@/components/auth/login-panel";
import { downloadPurchaseFile } from "@/lib/download-client";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/auth";

interface PurchaseItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  amount: number;
  currency: string;
  purchasedAt: string;
}

export default function PurchasesPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/purchases", { credentials: "include" });
      if (response.status === 401) {
        setUser(null);
        setPurchases([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load purchases");
      }

      const data = await response.json();
      setUser(data.user);
      setPurchases(data.purchases ?? []);
    } catch {
      toast.error("Could not load your purchases");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("error") === "google_auth_failed") {
      toast.error("Google sign-in failed. Please try again.");
    }
    loadPurchases();
  }, [loadPurchases, searchParams]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setPurchases([]);
    toast.success("Signed out");
  };

  const handleLoginSuccess = (sessionUser: SessionUser) => {
    setUser(sessionUser);
    loadPurchases();
  };

  const handleDownload = async (purchase: PurchaseItem) => {
    setDownloadingId(purchase.id);
    try {
      await downloadPurchaseFile(purchase.id, purchase.title);
      toast.success("Download started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream-light)] pt-28 pb-16">
      <div className="section-shell-wide max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <p className="section-label mb-2">Library</p>
            <h1 className="section-heading">My Purchases</h1>
            {user && (
              <p className="section-subhead mt-3">
                Signed in as {user.name ? `${user.name} · ` : ""}
                {user.email}
              </p>
            )}
          </div>
          {user && (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-full shrink-0"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-[var(--sand)] bg-white/70 backdrop-blur-sm p-8 sm:p-10">
            <LoginPanel returnTo="/purchases" onSuccess={handleLoginSuccess} />
          </div>
        ) : purchases.length === 0 ? (
          <div className="rounded-3xl border border-[var(--sand)] bg-white/70 p-10 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto text-[var(--taupe)] mb-4" />
            <p className="font-serif text-xl text-[var(--espresso)] mb-2">No purchases yet</p>
            <p className="text-sm text-[var(--taupe)] mb-6">
              When you buy an audiobook, it will show up here with a download link.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/#audiobook">Browse Ehsaas</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <article
                key={purchase.id}
                className="flex gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-[var(--sand)] bg-white/80"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden ring-1 ring-[var(--sand)]">
                  <Image
                    src={purchase.coverImage}
                    alt={purchase.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg text-[var(--espresso)] truncate">
                    {purchase.title}
                  </h2>
                  <p className="text-sm text-[var(--taupe)] truncate">{purchase.author}</p>
                  <p className="text-xs text-[var(--taupe)] mt-2">
                    Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={downloadingId === purchase.id}
                      onClick={() => handleDownload(purchase)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloadingId === purchase.id ? "Downloading..." : "Download"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
