import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, setAdminToken } from "@/lib/api";
import { ApiError } from "@/lib/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      setAdminToken(token);
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.error || err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-serif text-center text-[#1a1a2e] mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"
            autoFocus
            required
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1a1a2e] text-white rounded-lg font-medium hover:bg-[#2a2a4e] disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
