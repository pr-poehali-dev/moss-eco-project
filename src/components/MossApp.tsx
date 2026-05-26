import { useState } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type Lang = "ru" | "en";
type Page = "home" | "catalog" | "account" | "cart";

interface Product {
  id: number;
  category: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  badge?: string;
  colors?: number;
  image?: string;
}

interface CartItem extends Product {
  qty: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const HERO_IMG =
  "https://cdn.poehali.dev/projects/ad3c7dd6-d380-475d-bcf2-32abf5134c2e/files/1cd145cc-017f-453f-97d0-d58cb2e27e7d.jpg";
const MOSS_COLLECTION_IMG =
  "https://cdn.poehali.dev/projects/ad3c7dd6-d380-475d-bcf2-32abf5134c2e/files/16f7125f-6f00-45fe-9ed6-07255fccd602.jpg";
const LICHEN_IMG =
  "https://cdn.poehali.dev/projects/ad3c7dd6-d380-475d-bcf2-32abf5134c2e/files/18d542e3-fe1c-417a-a04d-06cca84624dd.jpg";

const PRODUCTS: Product[] = [
  {
    id: 1,
    category: "Ягель",
    name: "Премиум мох",
    nameEn: "Premium Moss",
    description:
      "Только крупный мох, плотные шапочки, отсутствие отходов. 25 оттенков.",
    descriptionEn: "Large moss only, dense caps, zero waste. 25 shades.",
    price: 1800,
    badge: "Хит",
    colors: 25,
    image: LICHEN_IMG,
  },
  {
    id: 2,
    category: "Ягель",
    name: "Стандартный ягель",
    nameEn: "Standard Lichen",
    description: "Классический ягель для декора и флористики. 25 оттенков.",
    descriptionEn:
      "Classic reindeer lichen for decor and floristry. 25 shades.",
    price: 1500,
    colors: 25,
    image: LICHEN_IMG,
  },
  {
    id: 3,
    category: "Ягель",
    name: "Флористический ягель",
    nameEn: "Floral Lichen",
    description:
      "Мелкий мох, короткие и маленькие пучки. Идеален для флористических композиций.",
    descriptionEn:
      "Fine moss, short and small bunches. Perfect for floral arrangements.",
    price: 600,
    colors: 25,
    image: LICHEN_IMG,
  },
  {
    id: 4,
    category: "Королевский мох",
    name: "Королевский мох",
    nameEn: "Royal Moss",
    description:
      "8 оттенков зелёного. Роскошная текстура для премиальных интерьеров.",
    descriptionEn:
      "8 shades of green. Luxurious texture for premium interiors.",
    price: 1800,
    badge: "Премиум",
    colors: 8,
    image: MOSS_COLLECTION_IMG,
  },
  {
    id: 5,
    category: "Плоский мох",
    name: "Плоский мох",
    nameEn: "Flat Moss",
    description:
      "2 цвета. Ровная бархатистая поверхность, идеальна для панелей.",
    descriptionEn: "2 colors. Smooth velvety surface, ideal for panels.",
    price: 5000,
    colors: 2,
    image: MOSS_COLLECTION_IMG,
  },
  {
    id: 6,
    category: "Мшанка",
    name: "Мох мшанка",
    nameEn: "Irish Moss",
    description:
      "2 цвета. Нежная мелкая текстура, создаёт эффект живого газона.",
    descriptionEn:
      "2 colors. Delicate fine texture, creates living lawn effect.",
    price: 7000,
    colors: 2,
    image: MOSS_COLLECTION_IMG,
  },
  {
    id: 7,
    category: "Панели",
    name: "Готовые панели из мха",
    nameEn: "Ready Moss Panels",
    description: "Готовые интерьерные панели на основе. Размеры на заказ.",
    descriptionEn: "Ready interior panels on base. Custom sizes available.",
    price: 18500,
    badge: "Популярное",
    image: HERO_IMG,
  },
  {
    id: 8,
    category: "Проекты",
    name: "Индивидуальный проект",
    nameEn: "Custom Project",
    description:
      "Уникальные инсталляции, логотипы, панно. Индивидуальный выкрас под ваш интерьер.",
    descriptionEn:
      "Unique installations, logos, murals. Custom dyeing for your interior.",
    price: 0,
    badge: "На заказ",
    image: HERO_IMG,
  },
];

const REVIEWS = [
  {
    id: 1,
    name: "Анастасия К.",
    role: "Дизайнер интерьеров",
    text: "Заказываю ягель уже третий раз. Качество стабильно высокое, цвета точно совпадают с каталогом. Отгрузка реально за 1 день!",
    textEn:
      "I order lichen for the third time. Quality is consistently high, colors match the catalog exactly. Shipment really within 1 day!",
    rating: 5,
  },
  {
    id: 2,
    name: "Михаил Р.",
    role: "Владелец ресторана",
    text: "Сделали мох-панно для нашего ресторана. Работа выполнена безупречно, клиенты постоянно фотографируются у стены.",
    textEn:
      "Made a moss mural for our restaurant. Flawless work, customers constantly take photos by the wall.",
    rating: 5,
  },
  {
    id: 3,
    name: "Елена В.",
    role: "Флорист",
    text: "Флористический ягель — находка! Идеальный размер бочков, никаких отходов. Уже рекомендую коллегам.",
    textEn:
      "Floral lichen is a gem! Perfect bunch size, zero waste. Already recommending to colleagues.",
    rating: 5,
  },
];

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  ru: {
    nav: {
      home: "Главная",
      catalog: "Каталог",
      account: "Кабинет",
      cart: "Корзина",
    },
    hero: {
      tag: "Производитель напрямую",
      h1: "Стабилизированный мох премиум-класса",
      sub: "Отгрузка 1–3 дня · 25 оттенков · Индивидуальный выкрас · Оптом и в розницу",
      cta: "Смотреть каталог",
      cta2: "Заказать проект",
    },
    features: [
      {
        icon: "Leaf",
        title: "Без ухода",
        desc: "Не требует полива и освещения",
      },
      {
        icon: "Truck",
        title: "Отгрузка 1–3 дня",
        desc: "Быстрая доставка по России",
      },
      {
        icon: "Palette",
        title: "Выкрас на заказ",
        desc: "Любой оттенок под ваш проект",
      },
      {
        icon: "Factory",
        title: "Производитель",
        desc: "Работаем напрямую без посредников",
      },
    ],
    catalog: {
      title: "Каталог продукции",
      sub: "Весь ассортимент в наличии на складе",
      filter: "Все",
      add: "В корзину",
      colors: "оттенков",
      custom: "На заказ",
      viewAll: "Смотреть все",
    },
    discount: {
      title: "Система скидок",
      sub: "Чем больше заказ — тем выгоднее цена",
      tiers: [
        { label: "от 5 кг", value: "5%", desc: "Скидка на весь заказ" },
        { label: "от 15 кг", value: "10%", desc: "Скидка на весь заказ" },
        { label: "от 30 кг", value: "15%", desc: "Скидка на весь заказ" },
        { label: "от 50 кг", value: "20%", desc: "Постоянный клиент" },
      ],
    },
    reviews: {
      title: "Отзывы клиентов",
      sub: "Нам доверяют дизайнеры, флористы и бизнес",
    },
    order: {
      title: "Оставить заявку",
      sub: "Ответим в течение 30 минут",
      name: "Имя",
      phone: "Телефон",
      message: "Комментарий к заказу",
      submit: "Отправить заявку",
      success: "Заявка отправлена! Свяжемся с вами скоро.",
    },
    custom: {
      title: "Индивидуальный проект",
      sub: "Создаём уникальные инсталляции под ваш интерьер",
      points: [
        "Панно и картины из мха",
        "Логотипы и надписи",
        "Вертикальные сады",
        "Корпоративный декор",
      ],
      cta: "Обсудить проект",
    },
    cart: {
      title: "Корзина",
      empty: "Корзина пуста",
      total: "Итого",
      checkout: "Оформить заказ",
      remove: "Удалить",
      discount: "Скидка",
    },
    account: {
      title: "Личный кабинет",
      login: "Войти",
      register: "Зарегистрироваться",
      email: "Email",
      password: "Пароль",
      orders: "Мои заказы",
      noOrders: "Заказов пока нет",
      logout: "Выйти",
      welcome: "Добро пожаловать!",
      loginSub:
        "Войдите для отслеживания заказов и получения персональных скидок",
    },
    footer: {
      desc: "Производитель стабилизированного мха. Работаем напрямую.",
      contacts: "Контакты",
      catalog: "Каталог",
      rights: "Все права защищены",
    },
  },
  en: {
    nav: { home: "Home", catalog: "Catalog", account: "Account", cart: "Cart" },
    hero: {
      tag: "Direct from Manufacturer",
      h1: "Premium Stabilized Moss",
      sub: "Shipping 1–3 days · 25 shades · Custom dyeing · Wholesale & retail",
      cta: "View Catalog",
      cta2: "Custom Project",
    },
    features: [
      {
        icon: "Leaf",
        title: "Maintenance-free",
        desc: "No watering or lighting needed",
      },
      {
        icon: "Truck",
        title: "Ships in 1–3 days",
        desc: "Fast delivery across Russia",
      },
      {
        icon: "Palette",
        title: "Custom dyeing",
        desc: "Any shade for your project",
      },
      { icon: "Factory", title: "Manufacturer", desc: "Direct, no middlemen" },
    ],
    catalog: {
      title: "Product Catalog",
      sub: "Full range in stock",
      filter: "All",
      add: "Add to cart",
      colors: "shades",
      custom: "On order",
      viewAll: "View all",
    },
    discount: {
      title: "Discount System",
      sub: "Bigger order — better price",
      tiers: [
        { label: "from 5 kg", value: "5%", desc: "Discount on entire order" },
        { label: "from 15 kg", value: "10%", desc: "Discount on entire order" },
        { label: "from 30 kg", value: "15%", desc: "Discount on entire order" },
        { label: "from 50 kg", value: "20%", desc: "Loyalty client" },
      ],
    },
    reviews: {
      title: "Client Reviews",
      sub: "Trusted by designers, florists and businesses",
    },
    order: {
      title: "Leave a Request",
      sub: "We respond within 30 minutes",
      name: "Name",
      phone: "Phone",
      message: "Order comment",
      submit: "Send Request",
      success: "Request sent! We'll contact you soon.",
    },
    custom: {
      title: "Custom Project",
      sub: "Creating unique installations for your interior",
      points: [
        "Moss murals and artworks",
        "Logos and lettering",
        "Vertical gardens",
        "Corporate decor",
      ],
      cta: "Discuss project",
    },
    cart: {
      title: "Cart",
      empty: "Your cart is empty",
      total: "Total",
      checkout: "Checkout",
      remove: "Remove",
      discount: "Discount",
    },
    account: {
      title: "My Account",
      login: "Sign In",
      register: "Register",
      email: "Email",
      password: "Password",
      orders: "My Orders",
      noOrders: "No orders yet",
      logout: "Sign Out",
      welcome: "Welcome!",
      loginSub: "Sign in to track orders and get personal discounts",
    },
    footer: {
      desc: "Stabilized moss manufacturer. Direct sales.",
      contacts: "Contacts",
      catalog: "Catalog",
      rights: "All rights reserved",
    },
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MossApp() {
  const [lang, setLang] = useState<Lang>("ru");
  const [page, setPage] = useState<Page>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filterCat, setFilterCat] = useState("Все");
  const [orderSent, setOrderSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const t = T[lang];
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const categories = [
    "Все",
    ...Array.from(new Set(PRODUCTS.map((p) => p.category))),
  ];
  const filtered =
    filterCat === "Все"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === filterCat);

  const discountPct =
    cartTotal >= 50000 * 20
      ? 20
      : cartTotal >= 50000 * 15
        ? 15
        : cartTotal >= 50000 * 10
          ? 10
          : cartTotal >= 50000 * 5
            ? 5
            : 0;
  const finalTotal = Math.round(cartTotal * (1 - discountPct / 100));

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing)
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  }

  function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 4000);
    setOrderForm({ name: "", phone: "", message: "" });
  }

  const navItems: { key: Page; label: string }[] = [
    { key: "home", label: t.nav.home },
    { key: "catalog", label: t.nav.catalog },
    { key: "account", label: t.nav.account },
  ];

  return (
    <div className="moss-app">
      {/* ─── Navbar ─── */}
      <nav className="moss-nav">
        <div className="moss-container moss-nav__inner">
          <button className="moss-logo" onClick={() => setPage("home")}>
            <span className="moss-logo__dot" />
            MossLab
          </button>

          <div className="moss-nav__links">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`moss-nav__link ${page === item.key ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="moss-nav__actions">
            <button
              className="moss-lang"
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
            >
              {lang === "ru" ? "EN" : "RU"}
            </button>
            <button className="moss-cart-btn" onClick={() => setPage("cart")}>
              <Icon name="ShoppingBag" size={20} />
              {cartCount > 0 && (
                <span className="moss-cart-badge">{cartCount}</span>
              )}
            </button>
            <button
              className="moss-burger"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Icon name={mobileMenu ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="moss-mobile-menu">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setPage(item.key);
                  setMobileMenu(false);
                }}
                className="moss-mobile-menu__item"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setPage("cart");
                setMobileMenu(false);
              }}
              className="moss-mobile-menu__item"
            >
              {t.nav.cart} {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
        )}
      </nav>

      {/* ─── Pages ─── */}
      {page === "home" && (
        <main>
          {/* Hero */}
          <section className="moss-hero">
            <div
              className="moss-hero__bg"
              style={{ backgroundImage: `url(${HERO_IMG})` }}
            />
            <div className="moss-hero__overlay" />
            <div className="moss-container moss-hero__content">
              <span className="moss-tag animate-fade-in">{t.hero.tag}</span>
              <h1 className="moss-hero__h1 animate-fade-in">{t.hero.h1}</h1>
              <p className="moss-hero__sub animate-fade-in">{t.hero.sub}</p>
              <div className="moss-hero__btns animate-fade-in">
                <button
                  className="moss-btn moss-btn--primary"
                  onClick={() => setPage("catalog")}
                >
                  {t.hero.cta}
                </button>
                <button
                  className="moss-btn moss-btn--outline"
                  onClick={() => {
                    document
                      .getElementById("custom-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t.hero.cta2}
                </button>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="moss-features">
            <div className="moss-container moss-features__grid">
              {t.features.map((f, i) => (
                <div key={i} className="moss-feature-card">
                  <div className="moss-feature-card__icon">
                    <Icon name={f.icon} fallback="Leaf" size={24} />
                  </div>
                  <h3 className="moss-feature-card__title">{f.title}</h3>
                  <p className="moss-feature-card__desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Products Preview */}
          <section className="moss-section">
            <div className="moss-container">
              <div className="moss-section__head">
                <h2 className="moss-section__title">{t.catalog.title}</h2>
                <p className="moss-section__sub">{t.catalog.sub}</p>
              </div>
              <div className="moss-products-grid">
                {PRODUCTS.slice(0, 6).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    lang={lang}
                    t={t}
                    onAdd={addToCart}
                  />
                ))}
              </div>
              <div className="moss-section__center">
                <button
                  className="moss-btn moss-btn--ghost"
                  onClick={() => setPage("catalog")}
                >
                  {t.catalog.viewAll} <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            </div>
          </section>

          {/* Discount Section */}
          <section className="moss-discount">
            <div className="moss-container">
              <div className="moss-section__head">
                <h2 className="moss-section__title moss-section__title--light">
                  {t.discount.title}
                </h2>
                <p className="moss-section__sub moss-section__sub--light">
                  {t.discount.sub}
                </p>
              </div>
              <div className="moss-discount__tiers">
                {t.discount.tiers.map((tier, i) => (
                  <div key={i} className="moss-discount__tier">
                    <div className="moss-discount__value">{tier.value}</div>
                    <div className="moss-discount__label">{tier.label}</div>
                    <div className="moss-discount__desc">{tier.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="moss-section">
            <div className="moss-container">
              <div className="moss-section__head">
                <h2 className="moss-section__title">{t.reviews.title}</h2>
                <p className="moss-section__sub">{t.reviews.sub}</p>
              </div>
              <div className="moss-reviews-grid">
                {REVIEWS.map((r) => (
                  <div key={r.id} className="moss-review-card">
                    <div className="moss-review-card__stars">
                      {"★".repeat(r.rating)}
                    </div>
                    <p className="moss-review-card__text">
                      "{lang === "ru" ? r.text : r.textEn}"
                    </p>
                    <div className="moss-review-card__author">
                      <div className="moss-review-card__avatar">
                        {r.name[0]}
                      </div>
                      <div>
                        <div className="moss-review-card__name">{r.name}</div>
                        <div className="moss-review-card__role">{r.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Custom Project */}
          <section id="custom-section" className="moss-custom">
            <div className="moss-container moss-custom__inner">
              <div className="moss-custom__text">
                <span className="moss-tag moss-tag--dark">
                  {lang === "ru" ? "Под ваш проект" : "Tailor-made"}
                </span>
                <h2 className="moss-custom__title">{t.custom.title}</h2>
                <p className="moss-custom__sub">{t.custom.sub}</p>
                <ul className="moss-custom__list">
                  {t.custom.points.map((pt, i) => (
                    <li key={i} className="moss-custom__point">
                      <Icon name="Check" size={16} />
                      {pt}
                    </li>
                  ))}
                </ul>
                <button
                  className="moss-btn moss-btn--primary"
                  onClick={() => {
                    document
                      .getElementById("order-form")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t.custom.cta}
                </button>
              </div>
              <div className="moss-custom__img">
                <img src={MOSS_COLLECTION_IMG} alt="Custom moss project" />
              </div>
            </div>
          </section>

          {/* Order Form */}
          <section id="order-form" className="moss-section moss-section--light">
            <div className="moss-container moss-order__inner">
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
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, name: e.target.value })
                    }
                    required
                  />
                  <input
                    className="moss-input"
                    placeholder={t.order.phone}
                    value={orderForm.phone}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, phone: e.target.value })
                    }
                    required
                  />
                  <textarea
                    className="moss-input moss-textarea"
                    placeholder={t.order.message}
                    value={orderForm.message}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, message: e.target.value })
                    }
                    rows={4}
                  />
                  <button
                    type="submit"
                    className="moss-btn moss-btn--primary moss-btn--full"
                  >
                    {t.order.submit}
                  </button>
                </form>
              )}
            </div>
          </section>
        </main>
      )}

      {page === "catalog" && (
        <main className="moss-page">
          <div className="moss-container">
            <div className="moss-section__head" style={{ paddingTop: "3rem" }}>
              <h1 className="moss-section__title">{t.catalog.title}</h1>
              <p className="moss-section__sub">{t.catalog.sub}</p>
            </div>

            {/* Filters */}
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
                <ProductCard
                  key={p.id}
                  product={p}
                  lang={lang}
                  t={t}
                  onAdd={addToCart}
                />
              ))}
            </div>

            {/* Order form */}
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
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, name: e.target.value })
                    }
                    required
                  />
                  <input
                    className="moss-input"
                    placeholder={t.order.phone}
                    value={orderForm.phone}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, phone: e.target.value })
                    }
                    required
                  />
                  <textarea
                    className="moss-input moss-textarea"
                    placeholder={t.order.message}
                    value={orderForm.message}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, message: e.target.value })
                    }
                    rows={4}
                  />
                  <button
                    type="submit"
                    className="moss-btn moss-btn--primary moss-btn--full"
                  >
                    {t.order.submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      )}

      {page === "cart" && (
        <main className="moss-page">
          <div className="moss-container">
            <h1 className="moss-page__title">{t.cart.title}</h1>
            {cart.length === 0 ? (
              <div className="moss-empty">
                <Icon name="ShoppingBag" size={56} />
                <p>{t.cart.empty}</p>
                <button
                  className="moss-btn moss-btn--primary"
                  onClick={() => setPage("catalog")}
                >
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
                        <div className="moss-cart-item__category">
                          {item.category}
                        </div>
                        <div className="moss-cart-item__price">
                          {item.price > 0
                            ? `${(item.price * item.qty).toLocaleString()} ₽`
                            : t.catalog.custom}
                        </div>
                      </div>
                      <div className="moss-cart-item__controls">
                        <button
                          className="moss-qty-btn"
                          onClick={() => changeQty(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="moss-qty-value">{item.qty}</span>
                        <button
                          className="moss-qty-btn"
                          onClick={() => changeQty(item.id, 1)}
                        >
                          +
                        </button>
                        <button
                          className="moss-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
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
                        <span className="moss-discount-hint__val">
                          −{tier.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {page === "account" && (
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
                <button
                  className="moss-btn moss-btn--outline"
                  onClick={() => setIsLoggedIn(false)}
                >
                  {t.account.logout}
                </button>
              </div>
            ) : (
              <div className="moss-account__auth">
                <p className="moss-account__sub">{t.account.loginSub}</p>
                <form
                  className="moss-order-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsLoggedIn(true);
                  }}
                >
                  <input
                    className="moss-input"
                    type="email"
                    placeholder={t.account.email}
                    required
                  />
                  <input
                    className="moss-input"
                    type="password"
                    placeholder={t.account.password}
                    required
                  />
                  <button
                    type="submit"
                    className="moss-btn moss-btn--primary moss-btn--full"
                  >
                    {t.account.login}
                  </button>
                  <button
                    type="button"
                    className="moss-btn moss-btn--outline moss-btn--full"
                  >
                    {t.account.register}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ─── Footer ─── */}
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
              {[
                "Ягель",
                "Королевский мох",
                "Плоский мох",
                "Мшанка",
                "Панели",
              ].map((cat) => (
                <button
                  key={cat}
                  className="moss-footer__link"
                  onClick={() => {
                    setPage("catalog");
                    setFilterCat(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="moss-footer__heading">{t.footer.contacts}</div>
            <div className="moss-footer__links">
              <a href="mailto:info@mosslab.ru" className="moss-footer__link">
                info@mosslab.ru
              </a>
              <a href="tel:+79001234567" className="moss-footer__link">
                +7 (900) 123-45-67
              </a>
            </div>
          </div>
        </div>
        <div className="moss-footer__bottom">
          <div className="moss-container">
            © 2024 MossLab. {t.footer.rights}.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  lang,
  t,
  onAdd,
}: {
  product: Product;
  lang: Lang;
  t: (typeof T)["ru"];
  onAdd: (p: Product) => void;
}) {
  return (
    <div className="moss-product-card">
      <div className="moss-product-card__img">
        {product.image && (
          <img src={product.image} alt={product.name} loading="lazy" />
        )}
        {product.badge && <span className="moss-badge">{product.badge}</span>}
      </div>
      <div className="moss-product-card__body">
        <div className="moss-product-card__cat">{product.category}</div>
        <h3 className="moss-product-card__name">
          {lang === "ru" ? product.name : product.nameEn}
        </h3>
        <p className="moss-product-card__desc">
          {lang === "ru" ? product.description : product.descriptionEn}
        </p>
        {product.colors && (
          <div className="moss-product-card__colors">
            <Icon name="Palette" size={13} />
            {product.colors} {t.catalog.colors}
          </div>
        )}
        <div className="moss-product-card__footer">
          <div className="moss-product-card__price">
            {product.price > 0
              ? `от ${product.price.toLocaleString()} ₽`
              : t.catalog.custom}
          </div>
          <button
            className="moss-btn moss-btn--sm moss-btn--primary"
            onClick={() => onAdd(product)}
          >
            {t.catalog.add}
          </button>
        </div>
      </div>
    </div>
  );
}
