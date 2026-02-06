import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { getAdminToken, clearAdminToken, adminListAnimations, adminUploadAnimation, adminDeleteAnimation, ApiError } from "@/lib/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<{ id: string; merchant_name: string; animation_url: string; updated_at?: { seconds?: number } | string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantName, setMerchantName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadList();
  }, [navigate]);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await adminListAnimations();
      setList(res.merchant_animations || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
      } else {
        setMessage({ type: "error", text: "Failed to load list" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin/login", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName.trim() || !file) {
      setMessage({ type: "error", text: "Enter merchant name and select a file" });
      return;
    }
    setMessage(null);
    setUploading(true);
    try {
      await adminUploadAnimation(merchantName.trim(), file);
      setMessage({ type: "success", text: `"${merchantName}" animation saved` });
      setMerchantName("");
      setFile(null);
      if (document.getElementById("animation-file")) (document.getElementById("animation-file") as HTMLInputElement).value = "";
      await loadList();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof ApiError ? (err.data?.error || err.message) : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, merchantName: string) => {
    if (!confirm(`Delete animation for "${merchantName || id}"?`)) return;
    setDeletingId(id);
    setMessage(null);
    try {
      await adminDeleteAnimation(id);
      setMessage({ type: "success", text: `Deleted "${merchantName || id}"` });
      loadList();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof ApiError ? (err.data?.error || err.message) : "Delete failed",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!getAdminToken()) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-serif text-[#1a1a2e]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Merchant Animations
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-[#1a1a2e]"
          >
            Log out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Merchant name</label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. Walmart, Songmont"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animation (MP4, WebM, GIF; max 10MB, ~5s loop)</label>
            <input
              id="animation-file"
              type="file"
              accept=".mp4,.webm,.gif,.mov"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:bg-gray-50"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2 bg-[#1a1a2e] text-white rounded-lg font-medium hover:bg-[#2a2a4e] disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload animation"}
          </button>
        </form>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-[#1a1a2e] mb-4">Saved merchants</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-gray-500">No animations yet. Add one above.</p>
          ) : (
            <ul className="space-y-6">
              {list.map((item) => {
                const isVideo = item.animation_url && /\.(mp4|webm|mov)$/i.test(item.animation_url);
                const ts = item.updated_at;
                const cacheBust =
                  ts != null
                    ? typeof ts === "object"
                      ? (ts as { seconds?: number; _seconds?: number }).seconds ??
                        (ts as { _seconds?: number })._seconds ??
                        String(ts)
                      : String(ts)
                    : item.animation_url ?? Date.now();
                const previewUrl =
                  item.animation_url +
                  (item.animation_url.includes("?") ? "&" : "?") +
                  "v=" +
                  encodeURIComponent(String(cacheBust));
                const itemKey = `${item.id}-${cacheBust}`;
                return (
                  <li key={itemKey} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span className="font-medium text-[#1a1a2e]">{item.merchant_name || item.id}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.merchant_name)}
                        disabled={deletingId === item.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 flex items-center gap-1 text-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                    {item.animation_url ? (
                      <div className="aspect-video max-w-md rounded-lg overflow-hidden bg-black">
                        {isVideo ? (
                          <video
                            key={previewUrl}
                            src={previewUrl}
                            className="w-full h-full object-contain"
                            controls
                            loop
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            key={previewUrl}
                            src={previewUrl}
                            alt={item.merchant_name || item.id}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No preview</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
