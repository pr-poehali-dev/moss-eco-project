import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Lang, Product, T } from "@/components/moss-data";

const SHADE_IMAGE_URL = "https://functions.poehali.dev/0850ab58-7649-40b0-aca2-a0226c5e6994";

let shadeImagesCache: Record<string, string> | null = null;
let shadeImagesFetching: Promise<Record<string, string>> | null = null;
function fetchShadeImages(): Promise<Record<string, string>> {
  if (shadeImagesCache) return Promise.resolve(shadeImagesCache);
  if (!shadeImagesFetching) {
    shadeImagesFetching = fetch(SHADE_IMAGE_URL)
      .then((r) => r.json())
      .then((data) => { shadeImagesCache = data; return data; })
      .catch(() => ({}));
  }
  return shadeImagesFetching;
}

let productImagesCache: Record<string, string> | null = null;
let productImagesFetching: Promise<Record<string, string>> | null = null;
function fetchProductImages(): Promise<Record<string, string>> {
  if (productImagesCache) return Promise.resolve(productImagesCache);
  if (!productImagesFetching) {
    productImagesFetching = fetch(`${SHADE_IMAGE_URL}?kind=product`)
      .then((r) => r.json())
      .then((data) => { productImagesCache = data; return data; })
      .catch(() => ({}));
  }
  return productImagesFetching;
}

interface MossProductCardProps {
  product: Product;
  lang: Lang;
  t: (typeof T)["ru"];
  onAdd: (p: Product, shade?: string) => void;
}

const MOSS_SHADES = [
  { name: "Изумруд", hex: "#2d6a4f" },
  { name: "Стандартный зелёный", hex: "#3a7d44" },
  { name: "Ель", hex: "#1b4332" },
  { name: "Болотный", hex: "#4a5e3a" },
  { name: "Лайм", hex: "#d9ed92" },
  { name: "Трава", hex: "#52b788" },
  { name: "Салатовый", hex: "#a8d96e" },
  { name: "Крапива", hex: "#6aaa3a" },
  { name: "Зелёное яблоко", hex: "#8db600" },
  { name: "Ярко-голубой", hex: "#00aaff" },
  { name: "Синее море", hex: "#1a6b8a" },
  { name: "Бирюзовый", hex: "#2ec4b6" },
  { name: "Топаз", hex: "#0ba4a4" },
  { name: "Фуксия", hex: "#ff0090" },
  { name: "Розовый", hex: "#ffaec9" },
  { name: "Ультра-розовый", hex: "#ff2d78" },
  { name: "Белый", hex: "#f5f5f5" },
  { name: "Пепельный", hex: "#b0b0b0" },
  { name: "Чёрный", hex: "#1a1a1a" },
  { name: "Красный", hex: "#e63946" },
  { name: "Жёлтый", hex: "#ffd166" },
  { name: "Оранжевый", hex: "#f4845f" },
  { name: "Лазурь", hex: "#4fc3f7" },
  { name: "Коричневый", hex: "#7b4f2e" },
  { name: "Фиолетовый", hex: "#7b2d8b" },
];

export default function MossProductCard({ product, lang, t, onAdd }: MossProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "shades">("info");
  const [selectedShade, setSelectedShade] = useState<number | null>(null);
  const [shadeImages, setShadeImages] = useState<Record<string, string>>(shadeImagesCache ?? {});
  const [productImages, setProductImages] = useState<Record<string, string>>(productImagesCache ?? {});

  useEffect(() => {
    fetchShadeImages().then(setShadeImages);
    fetchProductImages().then(setProductImages);
  }, []);

  const shades = product.colors ? MOSS_SHADES.slice(0, product.colors) : [];
  const productImg = productImages[String(product.id)] || product.image;

  return (
    <>
      <div className="moss-product-card" onClick={() => { setModalOpen(true); setActiveTab("info"); setSelectedShade(null); }} style={{ cursor: "pointer" }}>
        <div className="moss-product-card__img">
          {productImg && (
            <img src={productImg} alt={product.name} loading="lazy" />
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
          <div className="moss-product-card__footer">
            <div className="moss-product-card__price">
              {product.price > 0
                ? `от ${product.price.toLocaleString()} ₽/${product.unit === "m2" ? "м²" : "кг"}`
                : t.catalog.custom}
            </div>
            {shades.length === 0 && (
              <button
                className="moss-btn moss-btn--sm moss-btn--primary"
                onClick={(e) => { e.stopPropagation(); onAdd(product); }}
              >
                {t.catalog.add}
              </button>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="moss-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="moss-modal" onClick={(e) => e.stopPropagation()}>
            <button className="moss-modal__close" onClick={() => setModalOpen(false)}>
              <Icon name="X" size={20} />
            </button>

            {productImg && (
              <div className="moss-modal__img">
                <img src={productImg} alt={product.name} />
              </div>
            )}

            <div className="moss-modal__body">
              <div className="moss-modal__cat">{product.category}</div>
              <h2 className="moss-modal__title">
                {lang === "ru" ? product.name : product.nameEn}
              </h2>
              <div className="moss-modal__price">
                {product.price > 0
                  ? `от ${product.price.toLocaleString()} ₽/${product.unit === "m2" ? "м²" : "кг"}`
                  : t.catalog.custom}
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
                  <div
                    style={{
                      width: "100%",
                      height: "140px",
                      borderRadius: "12px",
                      marginBottom: "0.75rem",
                      overflow: "hidden",
                      background: selectedShade !== null ? shades[selectedShade].hex : "#e8e8e8",
                      transition: "background 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {selectedShade !== null && shadeImages[shades[selectedShade].name] ? (
                      <img
                        src={shadeImages[shades[selectedShade].name]}
                        alt={shades[selectedShade].name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : selectedShade === null ? (
                      <span style={{ color: "#aaa", fontSize: "0.85rem" }}>Выберите оттенок</span>
                    ) : null}
                  </div>
                  <div className="moss-modal__shade-name">
                    {selectedShade !== null ? (
                      <>
                        <span className="moss-modal__shade-dot" style={{ background: shades[selectedShade].hex }} />
                        {shades[selectedShade].name}
                      </>
                    ) : (
                      <span style={{ color: "var(--moss-muted)" }}>&nbsp;</span>
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

              {(shades.length === 0 || activeTab === "shades") && (
                <button
                  className="moss-btn moss-btn--primary moss-btn--full"
                  style={{ marginTop: "1.25rem" }}
                  disabled={shades.length > 0 && selectedShade === null}
                  onClick={() => {
                    onAdd(product, selectedShade !== null ? shades[selectedShade].name : undefined);
                    setModalOpen(false);
                  }}
                >
                  {shades.length > 0 && selectedShade === null ? "Выберите оттенок" : t.catalog.add}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}