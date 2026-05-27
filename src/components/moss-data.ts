// ─── Types ────────────────────────────────────────────────────────────────────
export type Lang = "ru" | "en";
export type Page = "home" | "catalog" | "account" | "cart";

export interface Product {
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

export interface CartItem extends Product {
  qty: number;
  shade?: string;
}

// ─── Images ───────────────────────────────────────────────────────────────────
export const HERO_IMG =
  "https://cdn.poehali.dev/projects/ad3c7dd6-d380-475d-bcf2-32abf5134c2e/files/ce691e1f-c4ff-4d0b-8bc9-a7f55b51a30d.jpg";
export const MOSS_COLLECTION_IMG =
  "https://cdn.poehali.dev/projects/ad3c7dd6-d380-475d-bcf2-32abf5134c2e/files/16f7125f-6f00-45fe-9ed6-07255fccd602.jpg";
export const LICHEN_IMG =
  "https://cdn.poehali.dev/projects/ad3c7dd6-d380-475d-bcf2-32abf5134c2e/files/18d542e3-fe1c-417a-a04d-06cca84624dd.jpg";

// ─── Products ─────────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: 1,
    category: "Ягель",
    name: "Премиум мох",
    nameEn: "Premium Moss",
    description: "Только крупный мох, плотные шапочки, отсутствие отходов. 25 оттенков.",
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
    descriptionEn: "Classic reindeer lichen for decor and floristry. 25 shades.",
    price: 1500,
    colors: 25,
    image: LICHEN_IMG,
  },
  {
    id: 3,
    category: "Ягель",
    name: "Флористический ягель",
    nameEn: "Floral Lichen",
    description: "Мелкий мох, короткие и маленькие пучки. Идеален для флористических композиций.",
    descriptionEn: "Fine moss, short and small bunches. Perfect for floral arrangements.",
    price: 600,
    colors: 25,
    image: LICHEN_IMG,
  },
  {
    id: 4,
    category: "Королевский мох",
    name: "Королевский мох",
    nameEn: "Royal Moss",
    description: "8 оттенков зелёного. Роскошная текстура для премиальных интерьеров.",
    descriptionEn: "8 shades of green. Luxurious texture for premium interiors.",
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
    description: "2 цвета. Ровная бархатистая поверхность, идеальна для панелей.",
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
    description: "2 цвета. Нежная мелкая текстура, создаёт эффект живого газона.",
    descriptionEn: "2 colors. Delicate fine texture, creates living lawn effect.",
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
    description: "Уникальные инсталляции, логотипы, панно. Индивидуальный выкрас под ваш интерьер.",
    descriptionEn: "Unique installations, logos, murals. Custom dyeing for your interior.",
    price: 0,
    badge: "На заказ",
    image: HERO_IMG,
  },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const REVIEWS = [
  {
    id: 1,
    name: "Анастасия К.",
    role: "Дизайнер интерьеров",
    text: "Заказываю ягель уже третий раз. Качество стабильно высокое, цвета точно совпадают с каталогом. Отгрузка реально за 1 день!",
    textEn: "I order lichen for the third time. Quality is consistently high, colors match the catalog exactly. Shipment really within 1 day!",
    rating: 5,
  },
  {
    id: 2,
    name: "Михаил Р.",
    role: "Владелец ресторана",
    text: "Сделали мох-панно для нашего ресторана. Работа выполнена безупречно, клиенты постоянно фотографируются у стены.",
    textEn: "Made a moss mural for our restaurant. Flawless work, customers constantly take photos by the wall.",
    rating: 5,
  },
  {
    id: 3,
    name: "Елена В.",
    role: "Флорист",
    text: "Флористический ягель — находка! Идеальный размер бочков, никаких отходов. Уже рекомендую коллегам.",
    textEn: "Floral lichen is a gem! Perfect bunch size, zero waste. Already recommending to colleagues.",
    rating: 5,
  },
];

// ─── i18n ─────────────────────────────────────────────────────────────────────
export const T = {
  ru: {
    nav: { home: "Главная", catalog: "Каталог", account: "Кабинет", cart: "Корзина" },
    hero: {
      tag: "Производитель напрямую",
      h1: "Стабилизированный мох премиум-класса",
      sub: "Отгрузка 1–3 дня · 25 оттенков · Индивидуальный выкрас · Оптом и в розницу",
      cta: "Смотреть каталог",
      cta2: "Заказать проект",
    },
    features: [
      { icon: "Leaf", title: "Без ухода", desc: "Не требует полива и освещения" },
      { icon: "Truck", title: "Отгрузка 1–3 дня", desc: "Быстрая доставка по России" },
      { icon: "Palette", title: "Выкрас на заказ", desc: "Любой оттенок под ваш проект" },
      { icon: "Factory", title: "Производитель", desc: "Работаем напрямую без посредников" },
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
    reviews: { title: "Отзывы клиентов", sub: "Нам доверяют дизайнеры, флористы и бизнес" },
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
      points: ["Панно и картины из мха", "Логотипы и надписи", "Вертикальные сады", "Корпоративный декор"],
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
      loginSub: "Войдите для отслеживания заказов и получения персональных скидок",
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
      { icon: "Leaf", title: "Maintenance-free", desc: "No watering or lighting needed" },
      { icon: "Truck", title: "Ships in 1–3 days", desc: "Fast delivery across Russia" },
      { icon: "Palette", title: "Custom dyeing", desc: "Any shade for your project" },
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
    reviews: { title: "Client Reviews", sub: "Trusted by designers, florists and businesses" },
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
      points: ["Moss murals and artworks", "Logos and lettering", "Vertical gardens", "Corporate decor"],
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