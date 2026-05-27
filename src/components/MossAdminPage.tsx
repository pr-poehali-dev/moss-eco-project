import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

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

export default function MossAdminPage() {
  const [shadeImages, setShadeImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(SHADE_IMAGE_URL)
      .then((r) => r.json())
      .then((data) => setShadeImages(data))
      .catch(() => {});
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleFileChange(shadeName: string, file: File) {
    setUploading(shadeName);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const contentType = file.type || "image/jpeg";
      try {
        const res = await fetch(SHADE_IMAGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shade_name: shadeName, image_b64: base64, content_type: contentType }),
        });
        const data = await res.json();
        setShadeImages((prev) => ({ ...prev, [shadeName]: data.image_url }));
        showToast(`Фото для «${shadeName}» загружено`);
      } catch {
        showToast("Ошибка загрузки");
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleDelete(shadeName: string) {
    setDeleting(shadeName);
    try {
      await fetch(`${SHADE_IMAGE_URL}?shade_name=${encodeURIComponent(shadeName)}`, { method: "DELETE" });
      setShadeImages((prev) => {
        const next = { ...prev };
        delete next[shadeName];
        return next;
      });
      showToast(`Фото «${shadeName}» удалено`);
    } catch {
      showToast("Ошибка удаления");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <h1 style={{ fontFamily: "var(--moss-font)", fontSize: "1.6rem", marginBottom: "0.5rem" }}>
        Фотографии оттенков
      </h1>
      <p style={{ color: "var(--moss-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Загрузите фото для каждого оттенка — оно будет показываться покупателям при выборе цвета.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {MOSS_SHADES.map((shade) => {
          const hasImage = !!shadeImages[shade.name];
          const isUploading = uploading === shade.name;
          const isDeleting = deleting === shade.name;

          return (
            <div
              key={shade.name}
              style={{
                border: "1.5px solid var(--moss-border, #e0e0d8)",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <div
                style={{
                  height: 120,
                  background: hasImage ? "transparent" : shade.hex,
                  position: "relative",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => !isUploading && fileRefs.current[shade.name]?.click()}
              >
                {hasImage ? (
                  <img
                    src={shadeImages[shade.name]}
                    alt={shade.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Icon name="ImagePlus" size={28} style={{ color: "rgba(255,255,255,0.7)" }} />
                )}
                {isUploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="Loader2" size={24} style={{ color: "#fff", animation: "spin 1s linear infinite" }} />
                  </div>
                )}
                <input
                  ref={(el) => { fileRefs.current[shade.name] = el; }}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(shade.name, file);
                    e.target.value = "";
                  }}
                />
              </div>

              <div style={{ padding: "0.6rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: shade.hex, flexShrink: 0,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 500, flex: 1 }}>{shade.name}</span>
                {hasImage && (
                  <button
                    title="Удалить фото"
                    disabled={isDeleting}
                    onClick={() => handleDelete(shade.name)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--moss-muted)", padding: 2 }}
                  >
                    <Icon name={isDeleting ? "Loader2" : "Trash2"} size={15} />
                  </button>
                )}
                <button
                  title={hasImage ? "Заменить фото" : "Загрузить фото"}
                  disabled={isUploading}
                  onClick={() => fileRefs.current[shade.name]?.click()}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--moss-muted)", padding: 2 }}
                >
                  <Icon name="Upload" size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
