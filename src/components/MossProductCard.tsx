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
  const [selectedShade, setSelectedShade] = useState<number | null>(null);

  const shades = product.colors ? MOSS_SHADES.slice(0, product.colors) : [];

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

        {shades.length > 0 && (
          <div className="moss-product-card__shades">
            <div className="moss-product-card__shades-label">
              <Icon name="Palette" size={13} />
              {selectedShade !== null
                ? shades[selectedShade].name
                : `${shades.length} ${t.catalog.colors}`}
            </div>
            <div className="moss-product-card__shades-grid">
              {shades.map((shade, i) => (
                <button
                  key={i}
                  className={`moss-shade${selectedShade === i ? " moss-shade--active" : ""}`}
                  style={{ background: shade.hex }}
                  title={shade.name}
                  onClick={() => setSelectedShade(selectedShade === i ? null : i)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="moss-product-card__footer">
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
  );
}
