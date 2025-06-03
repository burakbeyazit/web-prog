'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setShowRedirect(false);
    try {
      const response = await fetch("http://localhost:5139/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If not valid JSON, get text
        const text = await response.text();
        setMessage(text || "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      if (data.success) {
        setMessage(data.message || "Giriş başarılı!");
        // Decode JWT and store user info
        if (data.token) {
          const parseJwt = (token: string) => {
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              return JSON.parse(jsonPayload);
            } catch {
              return null;
            }
          };
          const payload = parseJwt(data.token);
          if (payload) {
            if (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]) {
              localStorage.setItem('userFirstName', payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]);
            }
            if (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]) {
              localStorage.setItem('userLastName', payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]);
            }
            if (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]) {
              localStorage.setItem('userEmail', payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]);
            }
          }
        }
        setShowRedirect(true);
        setTimeout(() => router.push("/shop"), 1800);
      } else {
        setMessage(data.message || "Giriş başarısız. Lütfen tekrar deneyin.");
      }
    } catch (error: any) {
      if (error?.message) {
        setMessage(error.message);
      } else {
        setMessage("Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-blue-200 to-gray-100">
      {/* Static Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="Background flowers"
          className="w-full h-full object-cover object-center opacity-40"
          style={{ filter: 'blur(2px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/70 to-gray-200/80" />
      </div>
      {/* Form Overlay */}
      <div className="relative z-10 bg-white/90 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Logo" className="w-12 h-12" />
          <span className="text-3xl font-extrabold text-blue-800 tracking-tight">Flower Shop</span>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">Login to Your Account</h1>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-md disabled:opacity-60 mt-2 text-lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button
          className="mt-4 text-blue-700 hover:underline text-base font-medium"
          type="button"
          onClick={() => router.push('/register')}
        >
          Don't have an account? Register
        </button>
        {message && (
          <div className="mt-6 text-center text-base text-blue-700 font-medium">{message}</div>
        )}
        {showRedirect && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-white rounded-xl shadow-xl px-8 py-6 text-center flex flex-col items-center">
              <svg className="w-12 h-12 text-blue-600 mb-2 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" strokeWidth="4" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <div className="text-lg font-semibold text-blue-700 mb-1">You are being redirected...</div>
              <div className="text-sm text-gray-500">Please wait.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 