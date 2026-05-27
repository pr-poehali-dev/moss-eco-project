import { useState, useEffect } from "react";
import { Lang, Page, Product, CartItem, T } from "@/components/moss-data";
import MossNavbar from "@/components/MossNavbar";
import MossHomePage from "@/components/MossHomePage";
import { MossCatalogPage, MossCartPage, MossAccountPage, MossFooter } from "@/components/MossPages";
import MossAdminPage from "@/components/MossAdminPage";

const AUTH_URL = "https://functions.poehali.dev/7f977656-8009-4b66-bf51-c2621b26e5f6";

export interface MossUser {
  id: number;
  email: string;
  name?: string;
}

interface OrderForm {
  name: string;
  phone: string;
  message: string;
}

export default function MossApp() {
  const [lang, setLang] = useState<Lang>("ru");
  const [page, setPage] = useState<Page>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filterCat, setFilterCat] = useState("Все");
  const [orderSent, setOrderSent] = useState(false);
  const [user, setUser] = useState<MossUser | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({ name: "", phone: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("moss_token");
    if (!token) return;
    fetch(`${AUTH_URL}?action=me`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const discountPct =
    cartCount >= 100 ? 20 :
    cartCount >= 21  ? 15 :
    cartCount >= 11  ? 10 : 0;
  const finalTotal = Math.round(cartTotal * (1 - discountPct / 100));

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
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("https://functions.poehali.dev/49c88edf-c0b4-44ae-a351-1a962622b00f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderForm),
      });
    } catch (err) { console.error(err); }
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 4000);
    setOrderForm({ name: "", phone: "", message: "" });
  }

  function handleLogout() {
    const token = localStorage.getItem("moss_token");
    if (token) {
      fetch(`${AUTH_URL}?action=logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("moss_token");
    setUser(null);
  }

  return (
    <div className="moss-app">
      <MossNavbar
        lang={lang}
        page={page}
        cartCount={cartCount}
        mobileMenu={mobileMenu}
        setPage={setPage}
        setLang={setLang}
        setMobileMenu={setMobileMenu}
      />

      {page === "home" && (
        <MossHomePage
          lang={lang}
          orderSent={orderSent}
          orderForm={orderForm}
          setPage={setPage}
          setOrderForm={setOrderForm}
          handleOrderSubmit={handleOrderSubmit}
          addToCart={addToCart}
        />
      )}

      {page === "catalog" && (
        <MossCatalogPage
          lang={lang}
          filterCat={filterCat}
          orderSent={orderSent}
          orderForm={orderForm}
          setFilterCat={setFilterCat}
          setOrderForm={setOrderForm}
          handleOrderSubmit={handleOrderSubmit}
          addToCart={addToCart}
        />
      )}

      {page === "cart" && (
        <MossCartPage
          lang={lang}
          cart={cart}
          cartTotal={cartTotal}
          cartCount={cartCount}
          discountPct={discountPct}
          finalTotal={finalTotal}
          setPage={setPage}
          removeFromCart={removeFromCart}
          changeQty={changeQty}
        />
      )}

      {page === "account" && (
        <MossAccountPage
          lang={lang}
          user={user}
          authUrl={AUTH_URL}
          onLogin={setUser}
          onLogout={handleLogout}
        />
      )}

      {page === "admin" && <MossAdminPage />}

      <MossFooter lang={lang} setPage={setPage} setFilterCat={setFilterCat} />
    </div>
  );
}