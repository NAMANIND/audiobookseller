"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PurchaseDialog } from "@/components/purchase-dialog";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  driveLink: string;
}

export default function Home() {
  const [audiobooks, setAudiobooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch books from API
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books");
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setAudiobooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Failed to load audiobooks. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
      return;
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => {
      toast.error("Failed to load payment system. Please try again later.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBuyNow = (book: Book) => {
    if (!isRazorpayLoaded) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }
    setSelectedBook(book);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-2 border-emerald-300 border-t-emerald-600 mx-auto"></div>
          </div>
          <p className="text-gray-600 font-light">Loading audiobooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="text-center space-y-8 mb-20">
          <h1 className="text-4xl font-light tracking-tight text-emerald-600 sm:text-5xl">
            Discover Amazing Audiobooks
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
            Buy and download your favorite audiobooks instantly. No login
            required.
          </p>
        </section>

        {audiobooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 font-light text-lg">
              No audiobooks available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {audiobooks.map((book) => (
            <Card
              key={book.id}
              className="p-0 group relative hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-xl border-emerald-200 hover:border-emerald-300 overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="aspect-[1/1] relative overflow-hidden">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              <CardHeader className="space-y-3 px-6 pt-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 font-light">
                    {book.author}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <p className="text-sm text-gray-600 line-clamp-2 font-light leading-relaxed">
                  {book.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center px-6 py-6 border-t border-emerald-200">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-light">
                    Price
                  </span>
                  <span className="text-xl font-medium text-emerald-600 block">
                    ₹{book.price}
                  </span>
                </div>
                <Button
                  onClick={() => handleBuyNow(book)}
                  className="relative z-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-2.5 rounded-full transition-all duration-300 font-light border border-emerald-300 hover:border-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                >
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <PurchaseDialog
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          book={selectedBook}
        />
      )}
    </div>
  );
}
