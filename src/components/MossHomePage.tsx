import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Lang, Page, Product, T, PRODUCTS, REVIEWS, HERO_IMG, MOSS_COLLECTION_IMG } from "@/components/moss-data";
import MossProductCard from "@/components/MossProductCard";

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

interface OrderForm {
  name: string;
  phone: string;
  message: string;
}

interface MossHomePageProps {
  lang: Lang;
  orderSent: boolean;
  orderForm: OrderForm;
  setPage: (p: Page) => void;
  setOrderForm: (f: OrderForm) => void;
  handleOrderSubmit: (e: React.FormEvent) => void;
  addToCart: (p: Product, shade?: string) => void;
}

export default function MossHomePage({
  lang,
  orderSent,
  orderForm,
  setPage,
  setOrderForm,
  handleOrderSubmit,
  addToCart,
}: MossHomePageProps) {
  const t = T[lang];
  const countdown = useCountdown(new Date("2026-07-01T00:00:00"));

  return (
    <main>
      {/* Hero */}
      <section className="moss-hero">
        <div className="moss-hero__bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="moss-hero__overlay" />
        <div className="moss-container moss-hero__content">
          <span className="moss-tag animate-fade-in">{t.hero.tag}</span>
          <h1 className="moss-hero__h1 animate-fade-in">{t.hero.h1}</h1>
          <p className="moss-hero__sub animate-fade-in">{t.hero.sub}</p>
          <div className="moss-hero__btns animate-fade-in">
            <button className="moss-btn moss-btn--primary" onClick={() => setPage("catalog")}>
              {t.hero.cta}
            </button>
            <button
              className="moss-btn moss-btn--outline"
              onClick={() => {
                document.getElementById("custom-section")?.scrollIntoView({ behavior: "smooth" });
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
              <MossProductCard key={p.id} product={p} lang={lang} t={t} onAdd={addToCart} />
            ))}
          </div>
          <div className="moss-section__center">
            <button className="moss-btn moss-btn--ghost" onClick={() => setPage("catalog" as import("@/components/moss-data").Page)}>
              {t.catalog.viewAll} <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Discount Section */}
      <section className="moss-discount">
        <div className="moss-container">
          <div className="moss-section__head">
            <h2 className="moss-section__title moss-section__title--light">{t.discount.title}</h2>
            <p className="moss-section__sub moss-section__sub--light">{t.discount.sub}</p>
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
                <div className="moss-review-card__stars">{"★".repeat(r.rating)}</div>
                <p className="moss-review-card__text">
                  "{lang === "ru" ? r.text : r.textEn}"
                </p>
                <div className="moss-review-card__author">
                  <div className="moss-review-card__avatar">{r.name[0]}</div>
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
                document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
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

      {/* Delivery */}
      <section className="moss-section">
        <div className="moss-container">
          <div className="moss-section__head">
            <h2 className="moss-section__title">Доставка</h2>
            <p className="moss-section__sub">Отправляем по всей России удобным для вас способом</p>
          </div>
          <div className="moss-delivery-grid">
            <div className="moss-delivery-card">
              <div className="moss-delivery-card__icon">
                <Icon name="Truck" size={32} />
              </div>
              <h3 className="moss-delivery-card__title">СДЭК</h3>
              <p className="moss-delivery-card__desc">Доставка до двери или пункта выдачи. Срок 2–5 дней по России.</p>
              <div className="moss-delivery-card__price">от 350 ₽</div>
            </div>
            <div className="moss-delivery-card">
              <div className="moss-delivery-card__icon">
                <Icon name="Zap" size={32} />
              </div>
              <h3 className="moss-delivery-card__title">Доставка до Москвы</h3>
              <p className="moss-delivery-card__desc">Экспресс-доставка до Москвы за 1 день.</p>
              <div className="moss-delivery-card__price">от 500 ₽</div>
            </div>
            <div className="moss-delivery-card">
              <div className="moss-delivery-card__icon">
                <Icon name="MapPin" size={32} />
              </div>
              <h3 className="moss-delivery-card__title">Самовывоз</h3>
              <p className="moss-delivery-card__desc">Марий Эл, пгт. Красногорский. Согласуйте время получения при оформлении.</p>
              <div className="moss-delivery-card__price">Бесплатно</div>
            </div>
            <div className="moss-delivery-card moss-delivery-card--highlight">
              <div className="moss-delivery-card__icon">
                <Icon name="Gift" size={32} />
              </div>
              <h3 className="moss-delivery-card__title">Бесплатная доставка</h3>
              <p className="moss-delivery-card__desc">При заказе от 10 000 ₽ доставка по России до конца июня 2026 г. — бесплатно.</p>
              <div className="moss-delivery-card__price">от 10 000 ₽</div>
              <div className="moss-countdown">
                <div className="moss-countdown__label">До конца акции</div>
                <div className="moss-countdown__grid">
                  <div className="moss-countdown__unit"><span>{String(countdown.days).padStart(2, "0")}</span><small>дн</small></div>
                  <div className="moss-countdown__sep">:</div>
                  <div className="moss-countdown__unit"><span>{String(countdown.hours).padStart(2, "0")}</span><small>ч</small></div>
                  <div className="moss-countdown__sep">:</div>
                  <div className="moss-countdown__unit"><span>{String(countdown.minutes).padStart(2, "0")}</span><small>мин</small></div>
                  <div className="moss-countdown__sep">:</div>
                  <div className="moss-countdown__unit"><span>{String(countdown.seconds).padStart(2, "0")}</span><small>сек</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="moss-section moss-section--light">
        <div className="moss-container">
          <div className="moss-section__head">
            <h2 className="moss-section__title">Контакты</h2>
            <p className="moss-section__sub">Свяжитесь с нами любым удобным способом</p>
          </div>
          <div className="moss-contacts-grid">
            <div className="moss-contact-card">
              <div className="moss-contact-card__icon"><Icon name="Phone" size={28} /></div>
              <div className="moss-contact-card__label">Телефон</div>
              <a href="tel:+79600826886" className="moss-contact-card__value">+7 (960) 082-68-86</a>
            </div>
            <div className="moss-contact-card">
              <div className="moss-contact-card__icon"><Icon name="Mail" size={28} /></div>
              <div className="moss-contact-card__label">Email</div>
              <a href="mailto:papet526@gmail.com" className="moss-contact-card__value">papet526@gmail.com</a>
            </div>
            <div className="moss-contact-card">
              <div className="moss-contact-card__icon"><Icon name="Building2" size={28} /></div>
              <div className="moss-contact-card__label">Реквизиты</div>
              <div className="moss-contact-card__value">ИП Петров Павел Андреевич</div>
              <div className="moss-contact-card__sub">ИНН 120804155440</div>
            </div>
            <div className="moss-contact-card">
              <div className="moss-contact-card__icon"><Icon name="Send" size={28} /></div>
              <div className="moss-contact-card__label">Telegram</div>
              <a href="https://t.me/borov1kkk" target="_blank" rel="noopener noreferrer" className="moss-contact-card__value">@borov1kkk</a>
            </div>
            <div className="moss-contact-card">
              <div className="moss-contact-card__icon"><Icon name="Users" size={28} /></div>
              <div className="moss-contact-card__label">ВКонтакте</div>
              <a href="https://vk.com/borovik_design" target="_blank" rel="noopener noreferrer" className="moss-contact-card__value">vk.com/borovik_design</a>
            </div>
            <div className="moss-contact-card">
              <div className="moss-contact-card__icon"><Icon name="Instagram" size={28} /></div>
              <div className="moss-contact-card__label">Instagram</div>
              <a href="https://www.instagram.com/borovik_design?igsh=Z3JxN2lzaGZxaGM%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="moss-contact-card__value">@borovik_design</a>
            </div>
            <div className="moss-contacts-grid__last-row">
              <div className="moss-contact-card">
                <div className="moss-contact-card__icon"><Icon name="MessageCircle" size={28} /></div>
                <div className="moss-contact-card__label">Max</div>
                <a href="https://max.ru/id120804155440_biz" target="_blank" rel="noopener noreferrer" className="moss-contact-card__value">Написать в Max</a>
              </div>
              <div className="moss-contact-card">
                <div className="moss-contact-card__icon"><Icon name="Phone" size={28} /></div>
                <div className="moss-contact-card__label">WhatsApp</div>
                <a href="https://wa.me/c/272189274247304" target="_blank" rel="noopener noreferrer" className="moss-contact-card__value">Написать в WhatsApp</a>
              </div>
            </div>
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
      </section>
    </main>
  );
}