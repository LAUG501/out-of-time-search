"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const verificationSignals = [
  "One-click OAuth onboarding (Google/X/Facebook)",
  "Email verification code required for password sign-in",
  "Optional phone/SMS verification via workflow webhook",
  "Hashed credentials with role-aware session trust",
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creating account...");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string; verification?: { dispatch?: string } };
    if (!response.ok || !payload.ok) {
      setStatus(payload.error || "Registration failed");
      return;
    }

    setNeedsVerify(true);
    setStatus(`Account created. Verification sent (${payload.verification?.dispatch || "pending"}).`);
  }

  async function verifyCode() {
    setStatus("Verifying code...");
    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, action: "verify" }),
    });
    const payload = (await response.json()) as { ok: boolean; error?: string; message?: string };
    if (!response.ok || !payload.ok) {
      setStatus(payload.error || "Code verification failed");
      return;
    }
    setStatus(payload.message || "Verified. Continue to login.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Identity and Trust</p>
        <h1 className="text-3xl font-semibold tracking-tight">Register as a Verified Contributor</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One-click OAuth is fastest. Password accounts require code verification before login.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>One-Click Register</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <a href="/api/auth/signin/google?callbackUrl=/mission-control" className="rounded border border-border px-3 py-2 text-center text-sm hover:bg-muted">Continue with Google</a>
          <a href="/api/auth/signin/twitter?callbackUrl=/mission-control" className="rounded border border-border px-3 py-2 text-center text-sm hover:bg-muted">Continue with X</a>
          <a href="/api/auth/signin/facebook?callbackUrl=/mission-control" className="rounded border border-border px-3 py-2 text-center text-sm hover:bg-muted">Continue with Facebook</a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Email Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <form className="space-y-3" onSubmit={onSubmit}>
            <input className="h-10 w-full rounded border border-border bg-background px-3" type="text" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
            <input className="h-10 w-full rounded border border-border bg-background px-3" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <input className="h-10 w-full rounded border border-border bg-background px-3" type="tel" placeholder="Phone (optional, for SMS pin)" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <input className="h-10 w-full rounded border border-border bg-background px-3" type="password" placeholder="Password (min 8 chars)" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            <Button className="w-full" type="submit">Create account</Button>
          </form>

          {needsVerify ? (
            <div className="space-y-2 rounded border border-border p-3">
              <p className="text-xs text-muted-foreground">Enter verification code to unlock sign-in.</p>
              <div className="flex gap-2">
                <input className="h-10 flex-1 rounded border border-border bg-background px-3" type="text" placeholder="6-digit code" value={code} onChange={(event) => setCode(event.target.value)} />
                <Button variant="outline" onClick={() => void verifyCode()}>Verify</Button>
              </div>
            </div>
          ) : null}

          {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
          <p className="text-xs text-muted-foreground">Already registered? <a href="/login" className="font-medium text-primary hover:underline">Sign in here</a></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Signals Used</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {verificationSignals.map((signal) => (
              <li key={signal}>- {signal}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
