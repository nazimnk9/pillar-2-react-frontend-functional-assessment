"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { KeyRound, Mail, Shield, AlertCircle, Eye, EyeOff, Copy } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = (await signIn("credentials", {
        email,
        password,
        role,
        redirect: true,
        callbackUrl: "/dashboard",
      })) as unknown as { error?: string } | null;

      if (res?.error) {
        setError("Invalid credentials. Try admin@jcrea.com / admin123.");
        toast.error("Login failed!");
      } else {
        toast.success("Welcome back!");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      toast.error("Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 text-white relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Decorative Blob */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-orange-accent/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-orange-accent/5 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-accent/10 text-orange-accent mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="font-outfit text-3xl font-extrabold text-white">
            Welcome Back
          </h2>
          <p className="text-zinc-400 text-sm mt-2">
            Sign in to manage your inventory dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs text-zinc-400 font-semibold uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jcrea.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:border-orange-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pass" className="text-xs text-zinc-400 font-semibold uppercase">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                id="pass"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3.5 text-sm focus:border-orange-accent focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Role selector for RBAC testing */}
          <div className="flex flex-col gap-2">
            <label htmlFor="role" className="text-xs text-zinc-400 font-semibold uppercase">Test Role (for RBAC)</label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:border-orange-accent focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="admin">Administrator (Can edit stock)</option>
                <option value="manager">Manager (View-only stock)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-accent text-white font-semibold py-3.5 rounded-xl hover:bg-orange-accent/90 transition-colors shadow-lg shadow-orange-accent/10 disabled:opacity-50 mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In with Credentials"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="px-4 text-zinc-500 text-xs font-semibold uppercase">OR</span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        {/* Google OAuth Login Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
        >
          {/* Google Icon SVG */}
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </div>

      {/* Role Credentials Helper Section */}
      <div className="mt-8 w-full max-w-md relative z-10 flex flex-col gap-4">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider text-center">
          Demo Assessment Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Admin Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                Admin Role
              </span>
              <p className="text-zinc-500 text-[10px] mt-1.5 leading-relaxed">
                Full catalog access with stock adjustment controls.
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3 text-[11px]">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Email:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard("admin@jcrea.com", "Admin Email")}
                  className="font-mono text-zinc-200 hover:text-orange-accent flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                  title="Copy email"
                >
                  admin@jcrea.com
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Password:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard("admin123", "Admin Password")}
                  className="font-mono text-zinc-200 hover:text-orange-accent flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                  title="Copy password"
                >
                  admin123
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Manager Card */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-lg">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                Manager Role
              </span>
              <p className="text-zinc-500 text-[10px] mt-1.5 leading-relaxed">
                Read-only catalog view. Stock adjustment forms hidden.
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3 text-[11px]">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Email:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard("manager@jcrea.com", "Manager Email")}
                  className="font-mono text-zinc-200 hover:text-orange-accent flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                  title="Copy email"
                >
                  manager@jcrea.com
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Password:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard("manager123", "Manager Password")}
                  className="font-mono text-zinc-200 hover:text-orange-accent flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                  title="Copy password"
                >
                  manager123
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
