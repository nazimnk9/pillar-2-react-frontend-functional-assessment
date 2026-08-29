"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";
import {
  LogOut,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Save,
  CheckCircle,
  X,
  PlusCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface DashboardClientProps {
  session: Session | null;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Simulation switches
  const [simulateFailure, setSimulateFailure] = useState(false);
  
  // Admin Stock editing states
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Cart Zustand store hooks
  const { cart, addToCart, removeFromCart, clearCart, getCartCount, getCartTotal } = useCartStore();

  // Optimistic UI state to prevent hydration flash
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
    if (session?.user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [session]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred while loading products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdminStockSave = async (productId: number) => {
    if (editingStockValue < 0) {
      toast.error("Stock cannot be negative!");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restock",
          items: [{ id: productId, stock: editingStockValue }],
        }),
      });

      if (!response.ok) throw new Error("Failed to update stock");
      
      const data = await response.json();
      if (data.success) {
        toast.success("Stock updated successfully!");
        setProducts(data.products);
        setEditingProductId(null);
      }
    } catch {
      toast.error("Error saving stock updates.");
    }
  };

  const handleCheckout = async () => {
    // 1. Verify session
    if (!session) {
      toast.error("Session expired. Redirecting to login...");
      signOut({ callbackUrl: "/login" });
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsCheckingOut(true);

    try {
      // If simulateFailure checkbox is checked, trigger checkout fail
      if (simulateFailure) {
        // Delay to simulate API response time
        await new Promise((resolve) => setTimeout(resolve, 1500));
        throw new Error("Simulated payment processing failure.");
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout",
          items: cart,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      toast.success("Order placed successfully! Cart cleared.");
      clearCart();
      fetchProducts(); // reload updated stocks
      setIsCartOpen(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Checkout failed.";
      
      // Toast with "Retry" action button!
      toast(
        (t) => (
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-semibold text-zinc-900">{errMsg}</p>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleCheckout();
              }}
              className="self-end bg-orange-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-accent/90 transition-colors"
            >
              Retry Checkout
            </button>
          </div>
        ),
        {
          duration: 6000,
          icon: "⚠️",
          style: {
            background: "#FFF",
            color: "#000",
            border: "1px solid #E4E4E7",
          },
        }
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white font-plus-jakarta pb-16">
      <Toaster position="top-right" />

      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 w-full bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 font-outfit text-xl font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-accent text-white text-sm">
              I
            </span>
            <span>Inventory Hub</span>
          </div>

          {/* User Profile & Cart Controls */}
          <div className="flex items-center gap-4">
            {/* Session Info */}
            {session?.user && (
              <div className="hidden sm:flex items-center gap-3 border-r border-zinc-800 pr-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name}`}
                  alt="avatar"
                  className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-white">{session.user.name}</p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <span>{session.user.email}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      isAdmin ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {session.user.role || "Manager"}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 transition-all"
            >
              <ShoppingCart className="h-5 w-5 text-zinc-300" />
              {hasHydrated && getCartCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-accent text-[10px] font-black text-white animate-bounce">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex h-10 px-4 items-center justify-center gap-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-6 py-12 md:px-12">
        {/* Banner Section */}
        <div className="mb-10 bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div className="absolute right-0 top-0 w-64 h-64 bg-orange-accent/5 rounded-full blur-3xl -z-10" />
          <div>
            <h1 className="font-outfit text-3xl font-extrabold text-white">Stock Management</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Add products to your cart, monitor stock, and simulate checkout processes.
            </p>
          </div>
          <div>
            <button
              onClick={fetchProducts}
              className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Inventory
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl animate-pulse">
                {/* Image Placeholder */}
                <div className="aspect-[16/10] bg-zinc-800 rounded-2xl mb-6" />
                {/* Title */}
                <div className="h-6 bg-zinc-800 rounded-lg w-2/3 mb-3" />
                {/* Category */}
                <div className="h-4 bg-zinc-800 rounded-lg w-1/3 mb-6" />
                {/* Bottom Row */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-850">
                  <div className="h-6 bg-zinc-800 rounded-lg w-1/4" />
                  <div className="h-10 bg-zinc-800 rounded-xl w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-zinc-900 border border-red-500/20 p-8 rounded-3xl text-center max-w-md mx-auto my-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Failed to Load Products</h3>
            <p className="text-zinc-400 text-sm mb-6">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-orange-accent text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-orange-accent/90 transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Fetching
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl text-center max-w-md mx-auto my-12">
            <Package className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Products Available</h3>
            <p className="text-zinc-400 text-sm mb-6">There are no products in our store directory at the moment.</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const inCartItem = hasHydrated ? cart.find((item) => item.id === product.id) : null;
              const cartQty = inCartItem?.quantity || 0;
              const remainingStock = product.stock - cartQty;

              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock < 5;

              return (
                <div
                  key={product.id}
                  className={`bg-zinc-900 border transition-all duration-300 p-6 rounded-3xl flex flex-col justify-between min-h-[420px] ${
                    isOutOfStock
                      ? "border-red-500/20 opacity-70"
                      : isLowStock
                      ? "border-amber-500/20 hover:border-amber-500/40"
                      : "border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative aspect-[16/10] bg-zinc-950 rounded-2xl mb-6 overflow-hidden border border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                      
                      {/* Stock Badge */}
                      <div className="absolute top-4 right-4">
                        {isOutOfStock ? (
                          <span className="bg-red-500 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-500 text-black font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                            Low Stock
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Metadata */}
                    <span className="text-[10px] font-semibold text-orange-accent uppercase tracking-widest">
                      {product.category}
                    </span>
                    <h3 className="font-outfit text-xl font-bold text-white mt-1 mb-2">
                      {product.name}
                    </h3>
                    
                    {/* Stock Detail Info */}
                    <p className="text-zinc-500 text-xs font-semibold flex items-center gap-1.5 mb-6">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        product.stock === 0 ? "bg-red-500 animate-pulse" : product.stock < 5 ? "bg-amber-500" : "bg-green-500"
                      }`} />
                      <span>Available Stock:</span>
                      <span className={product.stock === 0 ? "text-red-400" : product.stock < 5 ? "text-amber-400" : "text-green-400"}>
                        {product.stock} units
                      </span>
                      {cartQty > 0 && (
                        <span className="text-orange-accent text-[10px]">
                          ({cartQty} in cart)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Pricing and Action row */}
                  <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-4">
                    {/* Admin Stock Adjustment Controls (RBAC) */}
                    {isAdmin && (
                      <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Admin stock:</span>
                        {editingProductId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(parseInt(e.target.value) || 0)}
                              className="w-16 bg-zinc-900 border border-zinc-700 text-white text-center rounded px-1 py-0.5"
                            />
                            <button
                              onClick={() => handleAdminStockSave(product.id)}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Save Stock"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingProductId(null)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingProductId(product.id);
                              setEditingStockValue(product.stock);
                            }}
                            className="flex items-center gap-1 text-orange-accent font-bold hover:text-orange-accent/80 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                            Adjust
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <div className="font-outfit text-2xl font-black text-white">
                        ${product.price}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        disabled={remainingStock <= 0}
                        onClick={() => {
                          addToCart(product);
                          toast.success(`${product.name} added to cart!`);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                          remainingStock <= 0
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-orange-accent text-white hover:bg-orange-accent/90 shadow-sm"
                        }`}
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        {remainingStock <= 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Slider Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 text-white h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Cart Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-accent" />
                <h3 className="font-outfit text-xl font-bold">Shopping Cart</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {hasHydrated && cart.length === 0 ? (
                <div className="my-auto text-center">
                  <ShoppingCart className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 text-sm font-semibold">Your cart is empty</p>
                  <p className="text-zinc-600 text-xs mt-1">Browse products and add them to order</p>
                </div>
              ) : (
                hasHydrated && cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                      <p className="text-zinc-400 text-xs font-black mt-1">${item.price}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        disabled={item.quantity >= item.stock}
                        onClick={() => {
                          addToCart(item);
                        }}
                        className={`h-7 w-7 rounded-full border flex items-center justify-center transition-colors ${
                          item.quantity >= item.stock
                            ? "border-zinc-850 text-zinc-600 cursor-not-allowed bg-zinc-950"
                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300"
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {hasHydrated && cart.length > 0 && (
              <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex flex-col gap-6">
                {/* Checkout simulation options */}
                <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-white">Simulate Payment Failure</span>
                    <span className="text-zinc-500 text-[10px]">Forces order checkout to error</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="h-4 w-4 accent-orange-accent rounded border-zinc-800 bg-zinc-950 cursor-pointer"
                  />
                </div>

                {/* Subtotals */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-zinc-400 text-sm font-semibold">
                    <span>Items Count</span>
                    <span>{getCartCount()} items</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-zinc-850 pt-4 mt-2">
                    <span className="font-extrabold text-sm text-white">Total Amount</span>
                    <span className="font-outfit text-2xl font-black text-orange-accent">${getCartTotal()}</span>
                  </div>
                </div>

                {/* Checkout buttons */}
                <div className="flex gap-4">
                  <button
                    disabled={isCheckingOut}
                    onClick={() => {
                      clearCart();
                      toast.success("Cart cleared.");
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white transition-colors"
                    title="Clear All Cart Items"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex-grow flex h-12 items-center justify-center gap-2 bg-orange-accent hover:bg-orange-accent/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-accent/10 active:scale-95 disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Checkout Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
