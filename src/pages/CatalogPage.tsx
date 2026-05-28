import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lang, T } from "@/components/moss-data";
import { useCart } from "@/hooks/useCart";
import MossNavbar from "@/components/MossNavbar";
import { MossCatalogPage, MossFooter } from "@/components/MossPages";
import { MossUser } from "@/components/MossApp";

const AUTH_URL = "https://functions.poehali.dev/7f977656-8009-4b66-bf51-c2621b26e5f6";

interface OrderForm {
  name: string;
  phone: string;
  message: string;
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ru");
  const { cart, addToCart } = useCart();
  const [filterCat, setFilterCat] = useState("Все");
  const [orderSent, setOrderSent] = useState(false);
  const [user, setUser] = useState<MossUser | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({ name: "", phone: "", message: "" });

  useEffect(() => {
    const token = localStorage.getItem("moss_token");
    if (!token) return;

    let attempts = 0;
    function tryMe() {
      fetch(`${AUTH_URL}?action=me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) setUser(data.user);
          else if (data.error === "Сессия истекла") localStorage.removeItem("moss_token");
        })
        .catch(() => {
          if (attempts < 3) { attempts++; setTimeout(tryMe, 2000 * attempts); }
        });
    }
    tryMe();
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

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

  const setPage = (p: string) => {
    if (p === "home") navigate("/");
    else if (p === "catalog") navigate("/catalog");
    else navigate("/");
  };

  return (
    <div className="moss-app">
      <MossNavbar
        lang={lang}
        page="catalog"
        cartCount={cartCount}
        mobileMenu={mobileMenu}
        setPage={setPage as (p: import("@/components/moss-data").Page) => void}
        setLang={setLang}
        setMobileMenu={setMobileMenu}
      />
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
      <MossFooter lang={lang} setPage={setPage as (p: import("@/components/moss-data").Page) => void} setFilterCat={setFilterCat} />
    </div>
  );
}