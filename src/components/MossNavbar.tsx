import Icon from "@/components/ui/icon";
import { Lang, Page, T } from "@/components/moss-data";

interface MossNavbarProps {
  lang: Lang;
  page: Page;
  cartCount: number;
  mobileMenu: boolean;
  setPage: (p: Page) => void;
  setLang: (l: Lang) => void;
  setMobileMenu: (v: boolean) => void;
}

export default function MossNavbar({
  lang,
  page,
  cartCount,
  mobileMenu,
  setPage,
  setLang,
  setMobileMenu,
}: MossNavbarProps) {
  const t = T[lang];

  const navItems: { key: Page; label: string }[] = [
    { key: "home", label: t.nav.home },
    { key: "catalog", label: t.nav.catalog },
    { key: "account", label: t.nav.account },
  ];

  return (
    <nav className="moss-nav">
      <div className="moss-container moss-nav__inner">
        <button className="moss-logo" onClick={() => setPage("home")}>
          <span className="moss-logo__dot" />
          Borovik_moss
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
            {cartCount > 0 && <span className="moss-cart-badge">{cartCount}</span>}
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
              onClick={() => { setPage(item.key); setMobileMenu(false); }}
              className="moss-mobile-menu__item"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { setPage("cart"); setMobileMenu(false); }}
            className="moss-mobile-menu__item"
          >
            {t.nav.cart} {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      )}
    </nav>
  );
}