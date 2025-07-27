
import '../index.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/profile");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left: Illustration/Info Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 to-gray-900 text-white items-center justify-center p-10">
        <div>
          <h2 className="text-3xl font-bold mb-4">Fuel & Geo Alert System</h2>
          <p className="text-lg opacity-80 max-w-md">
            Monitor fuel levels, track geofence alerts, and manage your fleet in real time with intelligent insights.
          </p>
          <h1>Version - DEMO</h1>
        </div>
      </div>

      {/* Right: Glassmorphic Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-200 px-6 py-12 relative overflow-hidden">
        {/* Background blur layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-blue-100/30 backdrop-blur-md z-0" />

        {/* Login Card */}
        <div className="max-w-md w-full bg-white/70 p-10 rounded-xl shadow-2xl z-10">
          <div className="flex justify-center mb-6">
            <img src="/main_large.png" alt="Logo" className="h-19 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-blue-700 text-center mb-4">Welcome Back</h1>
          <p className="text-sm text-center text-gray-700 mb-6">
            Login to access your vehicle monitoring dashboard
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border p-3 rounded bg-white/60 backdrop-blur-sm"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border p-3 rounded bg-white/60 backdrop-blur-sm"
              required
            />
            <button
              type="submit"
              className={`w-full py-3 rounded text-white font-semibold ${
                loading ? "bg-blue-400" : "bg-blue-700 hover:bg-blue-800"
              }`}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>
          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
