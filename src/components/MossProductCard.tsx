import Icon from "@/components/ui/icon";
import { Lang, Product, T } from "@/components/moss-data";

interface MossProductCardProps {
  product: Product;
  lang: Lang;
  t: (typeof T)["ru"];
  onAdd: (p: Product) => void;
}

export default function MossProductCard({ product, lang, t, onAdd }: MossProductCardProps) {
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
