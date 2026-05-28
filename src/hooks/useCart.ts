import { useState, useEffect } from "react";
import { CartItem, Product } from "@/components/moss-data";

const KEY = "moss_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function useCart() {
  const [cart, setCartState] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) setCartState(loadCart());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function setCart(updater: (prev: CartItem[]) => CartItem[]) {
    setCartState((prev) => {
      const next = updater(prev);
      saveCart(next);
      return next;
    });
  }

  function addToCart(p: Product, shade?: string) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id && i.shade === shade);
      if (existing) return prev.map((i) => i.id === p.id && i.shade === shade ? { ...i, qty: i.qty + 1 } : i);
      const name = shade ? `${p.name} — ${shade}` : p.name;
      const nameEn = shade ? `${p.nameEn} — ${shade}` : p.nameEn;
      return [...prev, { ...p, name, nameEn, shade, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }

  function clearCart() {
    setCartState([]);
    localStorage.removeItem(KEY);
  }

  return { cart, addToCart, removeFromCart, changeQty, clearCart };
}
