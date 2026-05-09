"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    // Auto login after register
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (loginRes.ok) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/AOI LOGO_VARIATIONS-03.png"
            alt="Alpha Orion Inc."
            style={{ height: "36px", width: "auto" }}
          />
          <div className="w-px h-8 bg-gray-200" />
          <span className="text-xs text-[#D63B5A] tracking-widest uppercase font-medium">
            Ticketing System
          </span>
        </div>

        <div className="w-8 h-1 bg-[#D63B5A] rounded-full mb-4" />
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join the Alpha Orion ticketing system</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan dela Cruz"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2DB5]/20 focus:border-[#3D2DB5] bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@alphaorion.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2DB5]/20 focus:border-[#3D2DB5] bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2DB5]/20 focus:border-[#3D2DB5] bg-gray-50 text-gray-900"
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#3D2DB5] hover:bg-[#2E22A0] text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3D2DB5] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}