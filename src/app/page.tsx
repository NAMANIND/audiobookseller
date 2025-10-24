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

// Mock data - in a real app, this would come from your database
const audiobooks = [
  {
    id: "cmbhtanwy0000hquxkgsuvmn5",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
      "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    price: 1.0,
    coverImage:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
  },
  {
    id: "cmbhtanwy0001hquxlzqt8m4n",
    title: "1984",
    author: "George Orwell",
    description:
      "A dystopian social science fiction novel and cautionary tale.",
    price: 12.99,
    coverImage:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000",
  },
  // Add more audiobooks as needed
];

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<
    (typeof audiobooks)[0] | null
  >(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

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

  const handleBuyNow = (book: (typeof audiobooks)[0]) => {
    if (!isRazorpayLoaded) {
      toast.error("Payment system is loading. Please try again in a moment.");
      return;
    }
    setSelectedBook(book);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="text-center space-y-8 mb-20">
          <h1 className="text-4xl font-light tracking-tight text-emerald-400 sm:text-5xl">
            Discover Amazing Audiobooks
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto font-light">
            Buy and download your favorite audiobooks instantly. No login
            required.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {audiobooks.map((book) => (
            <Card
              key={book.id}
              className="p-0 group relative hover:shadow-2xl transition-all duration-500 bg-black/40 backdrop-blur-xl border-emerald-500/10 hover:border-emerald-500/30 overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="aspect-[1/1] relative overflow-hidden">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              <CardHeader className="space-y-3 px-6 pt-6">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-zinc-400 font-light">
                    {book.author}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <p className="text-sm text-zinc-400 line-clamp-2 font-light leading-relaxed">
                  {book.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center px-6 py-6 border-t border-emerald-500/10">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-light">
                    Price
                  </span>
                  <span className="text-xl font-medium text-emerald-400 block">
                    ₹{book.price}
                  </span>
                </div>
                <Button
                  onClick={() => handleBuyNow(book)}
                  className="relative z-10 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-6 py-2.5 rounded-full transition-all duration-300 font-light border border-emerald-500/20 hover:border-emerald-500/40 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                >
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
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
