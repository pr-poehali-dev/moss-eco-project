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
interface MossCartPageProps {
  lang: Lang;
  cart: CartItem[];
  cartTotal: number;
  discountPct: number;
  finalTotal: number;
  setPage: (p: Page) => void;
  removeFromCart: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
}

export function MossCartPage({
  lang,
  cart,
  cartTotal,
  discountPct,
  finalTotal,
  setPage,
  removeFromCart,
  changeQty,
}: MossCartPageProps) {
  const t = T[lang];

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
                    <span className="moss-qty-value">{item.qty}</span>
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
                <button className="moss-btn moss-btn--primary moss-btn--full">
                  {t.cart.checkout}
                </button>
              </div>
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
    </main>
  );
}

// ─── Account Page ─────────────────────────────────────────────────────────────
interface MossAccountPageProps {
  lang: Lang;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

export function MossAccountPage({ lang, isLoggedIn, setIsLoggedIn }: MossAccountPageProps) {
  const t = T[lang];

  return (
    <main className="moss-page">
      <div className="moss-container moss-account">
        <h1 className="moss-page__title">{t.account.title}</h1>
        {isLoggedIn ? (
          <div className="moss-account__logged">
            <div className="moss-account__welcome">
              <div className="moss-account__avatar">
                <Icon name="User" size={32} />
              </div>
              <div>
                <h2>{t.account.welcome}</h2>
                <p>user@example.com</p>
              </div>
            </div>
            <div className="moss-account__orders">
              <h3>{t.account.orders}</h3>
              <div className="moss-empty moss-empty--sm">
                <Icon name="Package" size={36} />
                <p>{t.account.noOrders}</p>
              </div>
            </div>
            <button className="moss-btn moss-btn--outline" onClick={() => setIsLoggedIn(false)}>
              {t.account.logout}
            </button>
          </div>
        ) : (
          <div className="moss-account__auth">
            <p className="moss-account__sub">{t.account.loginSub}</p>
            <form
              className="moss-order-form"
              onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}
            >
              <input className="moss-input" type="email" placeholder={t.account.email} required />
              <input className="moss-input" type="password" placeholder={t.account.password} required />
              <button type="submit" className="moss-btn moss-btn--primary moss-btn--full">
                {t.account.login}
              </button>
              <button type="button" className="moss-btn moss-btn--outline moss-btn--full">
                {t.account.register}
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
            <a href="mailto:info@mosslab.ru" className="moss-footer__link">info@mosslab.ru</a>
            <a href="tel:+79001234567" className="moss-footer__link">+7 (900) 123-45-67</a>
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