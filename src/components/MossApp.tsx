import { useState } from "react";
import { Lang, Page, Product, CartItem, PRODUCTS, T } from "@/components/moss-data";
import MossNavbar from "@/components/MossNavbar";
import MossHomePage from "@/components/MossHomePage";
import { MossCatalogPage, MossCartPage, MossAccountPage, MossFooter } from "@/components/MossPages";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({ name: "", phone: "", message: "" });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const discountPct =
    cartTotal >= 50000 * 20 ? 20 :
    cartTotal >= 50000 * 15 ? 15 :
    cartTotal >= 50000 * 10 ? 10 :
    cartTotal >= 50000 * 5 ? 5 : 0;
  const finalTotal = Math.round(cartTotal * (1 - discountPct / 100));

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
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

  function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 4000);
    setOrderForm({ name: "", phone: "", message: "" });
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
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}

      <MossFooter lang={lang} setPage={setPage} setFilterCat={setFilterCat} />
    </div>
  );
}
