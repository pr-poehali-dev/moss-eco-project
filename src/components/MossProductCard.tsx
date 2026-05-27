import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Lang, Product, T } from "@/components/moss-data";

interface MossProductCardProps {
  product: Product;
  lang: Lang;
  t: (typeof T)["ru"];
  onAdd: (p: Product) => void;
}

const MOSS_SHADES = [
  { name: "Изумрудный", hex: "#2d6a4f" },
  { name: "Тёмно-зелёный", hex: "#1b4332" },
  { name: "Лесной", hex: "#40916c" },
  { name: "Травяной", hex: "#52b788" },
  { name: "Мятный", hex: "#74c69d" },
  { name: "Оливковый", hex: "#6b7c44" },
  { name: "Хаки", hex: "#8a9a5b" },
  { name: "Болотный", hex: "#4a5e3a" },
  { name: "Шалфей", hex: "#a8c5a0" },
  { name: "Весенний", hex: "#b7e4c7" },
  { name: "Фисташковый", hex: "#c7f2a4" },
  { name: "Лаймовый", hex: "#d9ed92" },
  { name: "Жёлто-зелёный", hex: "#b5c926" },
  { name: "Охра-зелёная", hex: "#9aaf3b" },
  { name: "Серо-зелёный", hex: "#778d5e" },
  { name: "Дымчатый", hex: "#96b09a" },
  { name: "Пепельный", hex: "#c2cdb8" },
  { name: "Голубовато-зелёный", hex: "#4d9078" },
  { name: "Бирюзовый", hex: "#2e9e7a" },
  { name: "Морской", hex: "#1f7a6e" },
  { name: "Натуральный", hex: "#8fbc8f" },
  { name: "Тёмный мох", hex: "#3a5a40" },
  { name: "Светлый мох", hex: "#b8d8b8" },
  { name: "Коричнево-зелёный", hex: "#7a8c5a" },
  { name: "Тундровый", hex: "#d4e6c3" },
];

export default function MossProductCard({ product, lang, t, onAdd }: MossProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "shades">("info");
  const [selectedShade, setSelectedShade] = useState<number | null>(null);

  const shades = product.colors ? MOSS_SHADES.slice(0, product.colors) : [];

  return (
    <>
      <div className="moss-product-card" onClick={() => setModalOpen(true)} style={{ cursor: "pointer" }}>
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
          {shades.length > 0 && (
            <div className="moss-product-card__colors">
              <Icon name="Palette" size={13} />
              {shades.length} {t.catalog.colors}
            </div>
          )}
          <div className="moss-product-card__footer" onClick={(e) => e.stopPropagation()}>
            <div className="moss-product-card__price">
              {product.price > 0 ? `от ${product.price.toLocaleString()} ₽` : t.catalog.custom}
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

      {modalOpen && (
        <div className="moss-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="moss-modal" onClick={(e) => e.stopPropagation()}>
            <button className="moss-modal__close" onClick={() => setModalOpen(false)}>
              <Icon name="X" size={20} />
            </button>

            {product.image && (
              <div className="moss-modal__img">
                <img src={product.image} alt={product.name} />
              </div>
            )}

            <div className="moss-modal__body">
              <div className="moss-modal__cat">{product.category}</div>
              <h2 className="moss-modal__title">
                {lang === "ru" ? product.name : product.nameEn}
              </h2>
              <div className="moss-modal__price">
                {product.price > 0 ? `от ${product.price.toLocaleString()} ₽/кг` : t.catalog.custom}
              </div>

              {shades.length > 0 && (
                <div className="moss-modal__tabs">
                  <button
                    className={`moss-modal__tab${activeTab === "info" ? " active" : ""}`}
                    onClick={() => setActiveTab("info")}
                  >
                    Описание
                  </button>
                  <button
                    className={`moss-modal__tab${activeTab === "shades" ? " active" : ""}`}
                    onClick={() => setActiveTab("shades")}
                  >
                    <Icon name="Palette" size={14} />
                    {shades.length} оттенков
                  </button>
                </div>
              )}

              {activeTab === "info" && (
                <p className="moss-modal__desc">
                  {lang === "ru" ? product.description : product.descriptionEn}
                </p>
              )}

              {activeTab === "shades" && shades.length > 0 && (
                <div className="moss-modal__shades">
                  <div className="moss-modal__shade-name">
                    {selectedShade !== null ? (
                      <>
                        <span className="moss-modal__shade-dot" style={{ background: shades[selectedShade].hex }} />
                        {shades[selectedShade].name}
                      </>
                    ) : (
                      <span style={{ color: "var(--moss-muted)" }}>Выберите оттенок</span>
                    )}
                  </div>
                  <div className="moss-modal__shades-grid">
                    {shades.map((shade, i) => (
                      <button
                        key={i}
                        className={`moss-shade moss-shade--lg${selectedShade === i ? " moss-shade--active" : ""}`}
                        style={{ background: shade.hex }}
                        title={shade.name}
                        onClick={() => setSelectedShade(selectedShade === i ? null : i)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                className="moss-btn moss-btn--primary moss-btn--full"
                style={{ marginTop: "1.25rem" }}
                onClick={() => { onAdd(product); setModalOpen(false); }}
              >
                {t.catalog.add}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
