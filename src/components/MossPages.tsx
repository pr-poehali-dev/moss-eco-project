import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  Lang,
  Page,
  Product,
  CartItem,
  T,
  PRODUCTS,
} from "@/components/moss-data";
import MossProductCard from "@/components/MossProductCard";

// ─── OrderForm type ────────────────────────────────────────────────────────────
interface OrderForm {
  name: string;
  phone: string;
  message: string;
}

// ─── Catalog Page ─────────────────────────────────────────────────────────────
interface MossCatalogPageProps {
  lang: Lang;
  filterCat: string;
  orderSent: boolean;
  orderForm: OrderForm;
  setFilterCat: (cat: string) => void;
  setOrderForm: (f: OrderForm) => void;
  handleOrderSubmit: (e: React.FormEvent) => void;
  addToCart: (p: Product, shade?: string) => void;
}

export function MossCatalogPage({
  lang,
  filterCat,
  orderSent,
  orderForm,
  setFilterCat,
  setOrderForm,
  handleOrderSubmit,
  addToCart,
}: MossCatalogPageProps) {
  const t = T[lang];
  const categories = ["Все", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
  const filtered = filterCat === "Все" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filterCat);

  return (
    <main className="moss-page">
      <div className="moss-container">
        <div className="moss-section__head" style={{ paddingTop: "3rem" }}>
          <h1 className="moss-section__title">{t.catalog.title}</h1>
          <p className="moss-section__sub">{t.catalog.sub}</p>
        </div>

        <div className="moss-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`moss-filter-btn ${filterCat === cat ? "active" : ""}`}
            >
              {cat === "Все" ? t.catalog.filter : cat}
            </button>
          ))}
        </div>

        <div className="moss-products-grid">
          {filtered.map((p) => (
            <MossProductCard key={p.id} product={p} lang={lang} t={t} onAdd={addToCart} />
          ))}
        </div>

        <div id="order-form-cat" style={{ paddingTop: "4rem" }}>
          <div className="moss-section__head">
            <h2 className="moss-section__title">{t.order.title}</h2>
            <p className="moss-section__sub">{t.order.sub}</p>
          </div>
          {orderSent ? (
            <div className="moss-order-success">
              <Icon name="CheckCircle" size={40} />
              <p>{t.order.success}</p>
            </div>
          ) : (
            <form className="moss-order-form" onSubmit={handleOrderSubmit}>
              <input
                className="moss-input"
                placeholder={t.order.name}
                value={orderForm.name}
                onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                required
              />
              <input
                className="moss-input"
                placeholder={t.order.phone}
                value={orderForm.phone}
                onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                required
              />
              <textarea
                className="moss-input moss-textarea"
                placeholder={t.order.message}
                value={orderForm.message}
                onChange={(e) => setOrderForm({ ...orderForm, message: e.target.value })}
                rows={4}
              />
              <button type="submit" className="moss-btn moss-btn--primary moss-btn--full">
                {t.order.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
const SEND_ORDER_URL = "https://functions.poehali.dev/49c88edf-c0b4-44ae-a351-1a962622b00f";

interface MossCartPageProps {
  lang: Lang;
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  discountPct: number;
  finalTotal: number;
  setPage: (p: Page) => void;
  removeFromCart: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  onOrderSent?: () => void;
  user?: { name?: string; phone?: string } | null;
  goToLogin?: () => void;
}

const DISCOUNT_TIERS = [
  { kg: 11, pct: 10 },
  { kg: 21, pct: 15 },
  { kg: 100, pct: 20 },
];

export function MossCartPage({
  lang,
  cart,
  cartTotal,
  cartCount,
  discountPct,
  finalTotal,
  setPage,
  removeFromCart,
  changeQty,
  onOrderSent,
  user,
  goToLogin,
}: MossCartPageProps) {
  const t = T[lang];

  const nextTier = DISCOUNT_TIERS.find((tier) => cartCount < tier.kg);
  const prevTierKg = nextTier
    ? DISCOUNT_TIERS[DISCOUNT_TIERS.indexOf(nextTier) - 1]?.kg ?? 0
    : null;
  const progress = nextTier && prevTierKg !== null
    ? Math.min(100, Math.round(((cartCount - prevTierKg) / (nextTier.kg - prevTierKg)) * 100))
    : 100;
  const [modal, setModal] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) { setFormError("Введите имя"); return; }
    if (!phone.trim()) { setFormError("Введите телефон"); return; }
    setLoading(true);
    const token = localStorage.getItem("moss_token") || "";
    const items = cart.map((i) => ({
      id: i.id,
      name: lang === "ru" ? i.name : i.nameEn,
      qty: i.qty,
      price: i.price,
      unit: i.unit ?? "kg",
    }));
    try {
      const res = await fetch(SEND_ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          phone,
          message: comment,
          items,
          total: cartTotal,
          discount: discountPct,
          finalTotal,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Ошибка отправки. Попробуйте ещё раз.");
        setLoading(false);
        return;
      }
    } catch {
      setFormError("Нет связи. Проверьте интернет и попробуйте ещё раз.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setSent(true);
    onOrderSent?.();
    setTimeout(() => { setSent(false); setModal(false); setName(""); setPhone(""); setComment(""); }, 3500);
  }

  return (
    <main className="moss-page">
      <div className="moss-container">
        <h1 className="moss-page__title">{t.cart.title}</h1>
        {cart.length === 0 ? (
          <div className="moss-empty">
            <Icon name="ShoppingBag" size={56} />
            <p>{t.cart.empty}</p>
            <button className="moss-btn moss-btn--primary" onClick={() => setPage("catalog")}>
              {t.nav.catalog}
            </button>
          </div>
        ) : (
          <div className="moss-cart-layout">
            <div className="moss-cart-items">
              {cart.map((item) => (
                <div key={item.id} className="moss-cart-item">
                  <div className="moss-cart-item__img">
                    {item.image && <img src={item.image} alt={item.name} />}
                  </div>
                  <div className="moss-cart-item__info">
                    <div className="moss-cart-item__name">
                      {lang === "ru" ? item.name : item.nameEn}
                    </div>
                    <div className="moss-cart-item__category">{item.category}</div>
                    <div className="moss-cart-item__price">
                      {item.price > 0
                        ? `${(item.price * item.qty).toLocaleString()} ₽`
                        : t.catalog.custom}
                    </div>
                  </div>
                  <div className="moss-cart-item__controls">
                    <button className="moss-qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                    <span className="moss-qty-value">
                      {item.qty} {item.unit === "m2" ? "м²" : "кг"}
                    </span>
                    <button className="moss-qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                    <button className="moss-remove-btn" onClick={() => removeFromCart(item.id)}>
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="moss-cart-summary">
              <div className="moss-cart-summary__box">
                <div className="moss-cart-summary__row">
                  <span>{t.cart.total}</span>
                  <span>{cartTotal.toLocaleString()} ₽</span>
                </div>
                {discountPct > 0 && (
                  <div className="moss-cart-summary__row moss-cart-summary__row--discount">
                    <span>{t.cart.discount}</span>
                    <span>−{discountPct}%</span>
                  </div>
                )}
                <div className="moss-cart-summary__total">
                  <span>{t.cart.total}</span>
                  <span>{finalTotal.toLocaleString()} ₽</span>
                </div>
                {user ? (
                  <button
                    className="moss-btn moss-btn--primary moss-btn--full"
                    onClick={() => setModal(true)}
                  >
                    {t.cart.checkout}
                  </button>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "var(--moss-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                      Для оформления заказа необходимо войти в аккаунт
                    </p>
                    <button
                      className="moss-btn moss-btn--primary moss-btn--full"
                      onClick={() => goToLogin ? goToLogin() : setPage("account")}
                    >
                      Войти / Зарегистрироваться
                    </button>
                  </div>
                )}
              </div>
              {nextTier ? (
                <div className="moss-discount-progress">
                  <p className="moss-discount-progress__text">
                    {lang === "ru"
                      ? `Ещё ${nextTier.kg - cartCount} ед. — и скидка ${nextTier.pct}%`
                      : `${nextTier.kg - cartCount} more — get ${nextTier.pct}% off`}
                  </p>
                  <div className="moss-discount-progress__bar">
                    <div
                      className="moss-discount-progress__fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="moss-discount-progress__labels">
                    <span>{prevTierKg} ед.</span>
                    <span>{nextTier.kg} ед.</span>
                  </div>
                </div>
              ) : (
                <div className="moss-discount-progress">
                  <p className="moss-discount-progress__text moss-discount-progress__text--max">
                    {lang === "ru" ? "Максимальная скидка 20% активна!" : "Maximum 20% discount applied!"}
                  </p>
                </div>
              )}
              <div className="moss-discount-hint">
                {t.discount.tiers.map((tier, i) => (
                  <div key={i} className="moss-discount-hint__row">
                    <span>{tier.label}</span>
                    <span className="moss-discount-hint__val">−{tier.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="moss-modal-overlay" onClick={() => !loading && setModal(false)}>
          <div className="moss-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="moss-modal__close" onClick={() => setModal(false)}>
              <Icon name="X" size={20} />
            </button>
            {sent ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <Icon name="CheckCircle" size={48} style={{ color: "var(--moss-green, #2d6a4f)", marginBottom: "1rem" }} />
                <h3 style={{ fontFamily: "var(--moss-font)", marginBottom: "0.5rem" }}>Заказ принят!</h3>
                <p style={{ color: "var(--moss-muted)" }}>Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <div className="moss-modal__body">
                <h3 style={{ fontFamily: "var(--moss-font)", fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                  Оформление заказа
                </h3>
                <p style={{ color: "var(--moss-muted)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                  Итого: <b>{finalTotal.toLocaleString()} ₽</b>
                  {discountPct > 0 && <span style={{ color: "var(--moss-green, #2d6a4f)" }}> (скидка {discountPct}%)</span>}
                </p>
                <form className="moss-order-form" onSubmit={handleSubmit}>
                  <input
                    className="moss-input"
                    type="text"
                    placeholder="Ваше имя *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    className="moss-input"
                    type="tel"
                    placeholder="Телефон *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <textarea
                    className="moss-input"
                    placeholder="Комментарий к заказу"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ resize: "none" }}
                  />
                  {formError && (
                    <p style={{ color: "#e63946", fontSize: "0.85rem", margin: "-0.25rem 0 0" }}>{formError}</p>
                  )}
                  <button
                    type="submit"
                    className="moss-btn moss-btn--primary moss-btn--full"
                    disabled={loading}
                  >
                    {loading ? "Отправляем..." : "Отправить заказ"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Account Page ─────────────────────────────────────────────────────────────
interface MossUser { id: number; email: string; name?: string; }

interface MossAccountPageProps {
  lang: Lang;
  user: MossUser | null;
  authUrl: string;
  onLogin: (user: MossUser) => void;
  onLogout: () => void;
}

interface MossOrder {
  id: number;
  name: string;
  phone: string;
  message?: string;
  items: { name: string; qty: number; price: number; unit?: string }[];
  total: number;
  discount: number;
  finalTotal: number;
  status: string;
  createdAt: string;
}

export function MossAccountPage({ lang, user, authUrl, onLogin, onLogout }: MossAccountPageProps) {
  const t = T[lang];
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<MossOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("moss_token");
    if (!token) return;
    setOrdersLoading(true);
    fetch(`${authUrl}?action=orders`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [user, authUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = { email, password };
      if (mode === "register") { body.name = name; body.phone = phone; }
      const res = await fetch(`${authUrl}?action=${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка"); return; }
      localStorage.setItem("moss_token", data.token);
      onLogin(data.user);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="moss-page">
      <div className="moss-container moss-account">
        <h1 className="moss-page__title">{t.account.title}</h1>
        {user ? (
          <div className="moss-account__logged">
            <div className="moss-account__welcome">
              <div className="moss-account__avatar">
                <Icon name="User" size={32} />
              </div>
              <div>
                <h2>{user.name || t.account.welcome}</h2>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="moss-account__orders">
              <h3>{t.account.orders}</h3>
              {ordersLoading ? (
                <p style={{ color: "var(--moss-muted)", fontSize: "0.9rem" }}>Загружаем...</p>
              ) : orders.length === 0 ? (
                <div className="moss-empty moss-empty--sm">
                  <Icon name="Package" size={36} />
                  <p>{t.account.noOrders}</p>
                </div>
              ) : (
                <div className="moss-orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="moss-order-card">
                      <div className="moss-order-card__header">
                        <span className="moss-order-card__num">Заказ #{order.id}</span>
                        <span className="moss-order-card__date">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span className={`moss-order-card__status moss-order-card__status--${order.status}`}>
                          {order.status === "new" ? "Новый" : order.status === "done" ? "Выполнен" : order.status}
                        </span>
                      </div>
                      <div className="moss-order-card__items">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="moss-order-card__item">
                            <span>{item.name}</span>
                            <span>{item.qty} {item.unit === "m2" ? "м²" : "кг"}</span>
                            <span>{item.price > 0 ? `${(item.price * item.qty).toLocaleString()} ₽` : "На заказ"}</span>
                          </div>
                        ))}
                      </div>
                      <div className="moss-order-card__footer">
                        {order.discount > 0 && (
                          <span className="moss-order-card__discount">Скидка {order.discount}%</span>
                        )}
                        <span className="moss-order-card__total">{order.finalTotal?.toLocaleString()} ₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="moss-btn moss-btn--outline" onClick={onLogout}>
              {t.account.logout}
            </button>
          </div>
        ) : (
          <div className="moss-account__auth">
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <button
                className={`moss-btn ${mode === "login" ? "moss-btn--primary" : "moss-btn--outline"} moss-btn--sm`}
                onClick={() => { setMode("login"); setError(""); }}
              >
                {t.account.login}
              </button>
              <button
                className={`moss-btn ${mode === "register" ? "moss-btn--primary" : "moss-btn--outline"} moss-btn--sm`}
                onClick={() => { setMode("register"); setError(""); }}
              >
                {t.account.register}
              </button>
            </div>
            <p className="moss-account__sub">{t.account.loginSub}</p>
            <form className="moss-order-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <>
                  <input
                    className="moss-input"
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="moss-input"
                    type="tel"
                    placeholder="Телефон *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </>
              )}
              <input
                className="moss-input"
                type="email"
                placeholder={t.account.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="moss-input"
                type="password"
                placeholder={t.account.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && (
                <p style={{ color: "#e63946", fontSize: "0.85rem", margin: "-0.25rem 0 0" }}>{error}</p>
              )}
              <button
                type="submit"
                className="moss-btn moss-btn--primary moss-btn--full"
                disabled={loading}
              >
                {loading ? "..." : mode === "login" ? t.account.login : t.account.register}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
interface MossFooterProps {
  lang: Lang;
  setPage: (p: Page) => void;
  setFilterCat: (cat: string) => void;
}

export function MossFooter({ lang, setPage, setFilterCat }: MossFooterProps) {
  const t = T[lang];

  return (
    <footer className="moss-footer">
      <div className="moss-container moss-footer__inner">
        <div>
          <div className="moss-logo moss-logo--footer">
            <span className="moss-logo__dot" />
            MossLab
          </div>
          <p className="moss-footer__desc">{t.footer.desc}</p>
        </div>
        <div>
          <div className="moss-footer__heading">{t.footer.catalog}</div>
          <div className="moss-footer__links">
            {["Ягель", "Королевский мох", "Плоский мох", "Мшанка", "Панели"].map((cat) => (
              <button
                key={cat}
                className="moss-footer__link"
                onClick={() => { setPage("catalog"); setFilterCat(cat); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="moss-footer__heading">{t.footer.contacts}</div>
          <div className="moss-footer__links">
            <a href="mailto:papet526@gmail.com" className="moss-footer__link">papet526@gmail.com</a>
            <a href="tel:+79600826886" className="moss-footer__link">+7 (960) 082-68-86</a>
          </div>
        </div>
      </div>
      <div className="moss-footer__bottom">
        <div className="moss-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>© 2024 MossLab. {t.footer.rights}.</span>
          <button
            onClick={() => setPage("admin")}
            style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.3, fontSize: "0.75rem", color: "inherit" }}
          >
            ⚙
          </button>
        </div>
      </div>
    </footer>
  );
}