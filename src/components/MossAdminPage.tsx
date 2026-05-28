import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { PRODUCTS } from "@/components/moss-data";

const SHADE_IMAGE_URL = "https://functions.poehali.dev/0850ab58-7649-40b0-aca2-a0226c5e6994";

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

const SEND_ORDER_URL = "https://functions.poehali.dev/49c88edf-c0b4-44ae-a351-1a962622b00f";
const ADMIN_TOKEN = "moss_admin_2026";

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  paid: "Оплачен",
  shipped: "Отгружен",
  cancelled: "Отменён",
};
const STATUS_COLORS: Record<string, string> = {
  new: "#f59e0b",
  confirmed: "#3b82f6",
  paid: "#22c55e",
  shipped: "#8b5cf6",
  cancelled: "#ef4444",
};

interface Order {
  id: number;
  userId: number | null;
  name: string;
  phone: string;
  message: string | null;
  items: { name: string; qty: number; price: number; unit?: string }[];
  total: number;
  discount: number;
  finalTotal: number;
  status: string;
  createdAt: string;
  userEmail: string | null;
}

type Tab = "orders" | "products" | "shades";

export default function MossAdminPage() {
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (tab === "orders") loadOrders();
  }, [tab]);

  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${SEND_ORDER_URL}?action=list&admin_token=${ADMIN_TOKEN}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { /* ignore */ }
    setOrdersLoading(false);
  }

  async function updateStatus(orderId: number, status: string) {
    setUpdatingId(orderId);
    try {
      await fetch(`${SEND_ORDER_URL}?action=status&admin_token=${ADMIN_TOKEN}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      showToast("Статус обновлён");
    } catch { showToast("Ошибка обновления"); }
    setUpdatingId(null);
  }
  const [shadeImages, setShadeImages] = useState<Record<string, string>>({});
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(SHADE_IMAGE_URL)
      .then((r) => r.json())
      .then(setShadeImages)
      .catch(() => {});
    fetch(`${SHADE_IMAGE_URL}?kind=product`)
      .then((r) => r.json())
      .then(setProductImages)
      .catch(() => {});
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function uploadFile(key: string, file: File, body: object, onSuccess: (url: string) => void) {
    setUploading(key);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch(SHADE_IMAGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, image_b64: base64, content_type: file.type || "image/jpeg" }),
        });
        const data = await res.json();
        onSuccess(data.image_url);
        showToast("Фото загружено");
      } catch {
        showToast("Ошибка загрузки");
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  }

  async function deleteFile(url: string, onSuccess: () => void) {
    try {
      await fetch(url, { method: "DELETE" });
      onSuccess();
      showToast("Фото удалено");
    } catch {
      showToast("Ошибка удаления");
    } finally {
      setDeleting(null);
    }
  }

  function renderImageCard(
    key: string,
    label: string,
    imageUrl: string | undefined,
    previewBg: string,
    uploadBody: object,
    deleteUrl: string,
    onUploaded: (url: string) => void,
    onDeleted: () => void,
  ) {
    const hasImage = !!imageUrl;
    const isUp = uploading === key;
    const isDel = deleting === key;

    return (
      <div
        key={key}
        style={{ border: "1.5px solid var(--moss-border, #e0e0d8)", borderRadius: 12, overflow: "hidden", background: "#fff" }}
      >
        <div
          style={{ height: 120, background: hasImage ? "transparent" : previewBg, position: "relative", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => !isUp && fileRefs.current[key]?.click()}
        >
          {hasImage ? (
            <img src={imageUrl} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Icon name="ImagePlus" size={28} style={{ color: previewBg === "#f5f5f5" ? "#bbb" : "rgba(255,255,255,0.7)" }} />
          )}
          {isUp && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="Loader2" size={24} style={{ color: "#fff", animation: "spin 1s linear infinite" }} />
            </div>
          )}
          <input
            ref={(el) => { fileRefs.current[key] = el; }}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(key, file, uploadBody, onUploaded);
              e.target.value = "";
            }}
          />
        </div>
        <div style={{ padding: "0.6rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 500, flex: 1 }}>{label}</span>
          {hasImage && (
            <button title="Удалить" disabled={isDel} onClick={() => { setDeleting(key); deleteFile(deleteUrl, onDeleted); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--moss-muted)", padding: 2 }}>
              <Icon name={isDel ? "Loader2" : "Trash2"} size={15} />
            </button>
          )}
          <button title={hasImage ? "Заменить" : "Загрузить"} disabled={isUp}
            onClick={() => fileRefs.current[key]?.click()}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--moss-muted)", padding: 2 }}>
            <Icon name="Upload" size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <h1 style={{ fontFamily: "var(--moss-font)", fontSize: "1.6rem", marginBottom: "1.5rem" }}>
        Панель управления фото
      </h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {([["orders", "Заказы"], ["products", "Товары"], ["shades", "Оттенки"]] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: 8, border: "1.5px solid var(--moss-border, #e0e0d8)",
              background: tab === t ? "var(--moss-green, #2d6a4f)" : "#fff",
              color: tab === t ? "#fff" : "inherit",
              cursor: "pointer", fontWeight: 500, fontSize: "0.9rem",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p style={{ color: "var(--moss-muted)", fontSize: "0.9rem" }}>
              Управляйте статусами заказов. Скидка 5% нового клиента сгорает после первого <b>оплаченного</b> заказа.
            </p>
            <button onClick={loadOrders} style={{ background: "none", border: "1.5px solid var(--moss-border, #e0e0d8)", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Icon name="RefreshCw" size={14} /> Обновить
            </button>
          </div>
          {ordersLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--moss-muted)" }}>
              <Icon name="Loader2" size={32} />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--moss-muted)" }}>Заказов пока нет</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {orders.map((order) => (
                <div key={order.id} style={{ border: "1.5px solid var(--moss-border, #e0e0d8)", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
                  <div style={{ padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", borderBottom: "1px solid var(--moss-border, #e0e0d8)", background: "#fafaf7" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>#{order.id}</span>
                    <span style={{ fontWeight: 600 }}>{order.name}</span>
                    <a href={`tel:${order.phone}`} style={{ color: "var(--moss-olive, #5a7a4a)", fontSize: "0.9rem" }}>{order.phone}</a>
                    {order.userEmail && <span style={{ fontSize: "0.8rem", color: "var(--moss-muted)" }}>{order.userEmail}</span>}
                    <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--moss-muted)" }}>
                      {new Date(order.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{ padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, background: STATUS_COLORS[order.status] + "22", color: STATUS_COLORS[order.status] }}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <div style={{ padding: "0.85rem 1.25rem" }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.87rem", padding: "0.2rem 0", borderBottom: "1px dashed #eee" }}>
                        <span>{item.name} × {item.qty} {item.unit === "m2" ? "м²" : "кг"}</span>
                        <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toLocaleString()} ₽</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontWeight: 700 }}>
                      <span>Итого{order.discount > 0 ? ` (скидка ${order.discount}%)` : ""}:</span>
                      <span>{order.finalTotal?.toLocaleString()} ₽</span>
                    </div>
                    {order.message && <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--moss-muted)" }}>💬 {order.message}</p>}
                    <div style={{ marginTop: "0.85rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          disabled={order.status === key || updatingId === order.id}
                          onClick={() => updateStatus(order.id, key)}
                          style={{
                            padding: "0.3rem 0.8rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: order.status === key ? "default" : "pointer",
                            border: `1.5px solid ${STATUS_COLORS[key]}`,
                            background: order.status === key ? STATUS_COLORS[key] : "transparent",
                            color: order.status === key ? "#fff" : STATUS_COLORS[key],
                            opacity: updatingId === order.id ? 0.6 : 1,
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "products" && (
        <>
          <p style={{ color: "var(--moss-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Загрузите главное фото для каждого товара в каталоге.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {PRODUCTS.map((p) => {
              const key = `product-${p.id}`;
              return renderImageCard(
                key,
                p.name,
                productImages[String(p.id)] || p.image,
                "#e8ede9",
                { kind: "product", product_id: p.id },
                `${SHADE_IMAGE_URL}?kind=product&product_id=${p.id}`,
                (url) => setProductImages((prev) => ({ ...prev, [String(p.id)]: url })),
                () => setProductImages((prev) => { const n = { ...prev }; delete n[String(p.id)]; return n; }),
              );
            })}
          </div>
        </>
      )}

      {tab === "shades" && (
        <>
          <p style={{ color: "var(--moss-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Загрузите фото для каждого оттенка — оно показывается покупателям при выборе цвета.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {MOSS_SHADES.map((shade) => {
              const key = `shade-${shade.name}`;
              return renderImageCard(
                key,
                shade.name,
                shadeImages[shade.name],
                shade.hex,
                { shade_name: shade.name },
                `${SHADE_IMAGE_URL}?shade_name=${encodeURIComponent(shade.name)}`,
                (url) => setShadeImages((prev) => ({ ...prev, [shade.name]: url })),
                () => setShadeImages((prev) => { const n = { ...prev }; delete n[shade.name]; return n; }),
              );
            })}
          </div>
        </>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          background: "#1a1a1a", color: "#fff", borderRadius: 8,
          padding: "0.6rem 1.25rem", fontSize: "0.9rem", zIndex: 9999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}