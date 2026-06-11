"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/auth";

type LoginStep = "choose" | "otp";

interface LoginPanelProps {
  returnTo?: string;
  onSuccess?: (user: SessionUser) => void;
  title?: string;
  description?: string;
}

export function LoginPanel({
  returnTo = "/purchases",
  onSuccess,
  title = "Sign in to continue",
  description = "Use Google or verify your email with a one-time code.",
}: LoginPanelProps) {
  const [step, setStep] = useState<LoginStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const googleHref = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;

  const sendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send verification code");
      }

      setStep("otp");
      toast.success("Check your email for the verification code");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Invalid verification code");
      }

      const sessionResponse = await fetch("/api/auth/session", { credentials: "include" });
      const data = await sessionResponse.json();

      if (data.user) {
        onSuccess?.(data.user);
      } else {
        onSuccess?.({ email: email.toLowerCase(), provider: "email" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl text-[var(--espresso)]">{title}</h2>
          <p className="text-sm text-[var(--taupe)] mt-2">
            Enter the code sent to <span className="text-[var(--espresso)]">{email}</span>
          </p>
        </div>

        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="text-center text-lg tracking-widest"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setStep("choose");
              setOtp("");
            }}
            disabled={isLoading}
            className="rounded-full"
          >
            Back
          </Button>
          <Button onClick={verifyOtp} disabled={isLoading} className="rounded-full flex-1">
            {isLoading ? "Verifying..." : "Verify & sign in"}
          </Button>
        </div>

        <button
          type="button"
          onClick={sendOtp}
          disabled={isLoading}
          className="text-sm text-[var(--terracotta)] hover:underline disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-[var(--espresso)]">{title}</h2>
        <p className="text-sm text-[var(--taupe)] mt-2">{description}</p>
      </div>

      <Button asChild className="w-full min-h-[48px] rounded-full bg-white border border-[var(--sand)] text-[var(--espresso)] hover:bg-[var(--cream-light)]">
        <a href={googleHref}>Continue with Google</a>
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--sand)]" />
        <span className="text-xs uppercase tracking-wider text-[var(--taupe)]">or email</span>
        <div className="h-px flex-1 bg-[var(--sand)]" />
      </div>

      <div className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          onClick={sendOtp}
          disabled={isLoading}
          className="w-full min-h-[48px] rounded-full"
        >
          {isLoading ? "Sending..." : "Send verification code"}
        </Button>
      </div>
    </div>
  );
}
