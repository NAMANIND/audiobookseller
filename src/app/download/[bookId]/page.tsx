"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type DownloadPageProps = {
  params: {
    bookId: string;
  };
};

export default function DownloadPage({ params }: DownloadPageProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`/api/books/${params.bookId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch book details");
        }
        const data = await response.json();
        setBookDetails(data);
      } catch (err) {
        setError("Failed to load book details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [params.bookId]);

  const handleDownload = async () => {
    try {
      setDownloadStarted(true);
      // Here you would typically trigger the actual download
      // For now, we'll just simulate it
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch(
        `/api/download/${params.bookId}?token=${token}`
      );
      if (!response.ok) {
        throw new Error("Failed to start download");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      setError("Failed to start download. Please try again.");
      setDownloadStarted(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-2 border-emerald-300 border-t-emerald-600"></div>
          </div>
          <p className="text-gray-600 font-light">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded-full blur-xl"></div>
            <div className="relative">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-light text-red-600">Error</h1>
            <p className="text-gray-600 font-light">{error}</p>
          </div>
          <Button
            asChild
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-2.5 rounded-full transition-all duration-300 font-light border border-emerald-300 hover:border-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl"></div>
          <div className="relative flex items-center justify-center">
            {downloadStarted ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-600" />
            ) : (
              <Download className="w-16 h-16 text-emerald-600" />
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-light text-emerald-600">
            {downloadStarted ? "Download Starting!" : "Ready to Download"}
          </h1>
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl border border-emerald-200 shadow-sm space-y-3">
            <h2 className="text-xl font-light text-emerald-700">
              {bookDetails?.title}
            </h2>
            <p className="text-gray-600 font-light">{bookDetails?.author}</p>
          </div>
          <p className="text-gray-600 font-light">
            {downloadStarted
              ? "Your download will begin automatically. If it doesn't, click the button below."
              : "Click the button below to start your download."}
          </p>
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleDownload}
              disabled={downloadStarted}
              className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-2.5 rounded-full transition-all duration-300 font-light border border-emerald-300 hover:border-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {downloadStarted ? "Downloading..." : "Download Now"}
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-emerald-300 text-gray-600 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 rounded-full transition-all duration-300 font-light"
            >
              <Link href="/purchases">View All Purchases</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
