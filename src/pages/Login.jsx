import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { LogIn, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(() => {
    const savedMessage = localStorage.getItem("deactivatedMessage");
    if (savedMessage) {
      localStorage.removeItem("deactivatedMessage");
      return savedMessage;
    }
    return "";
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 border border-sky-300 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-400/20 shadow-inner">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl text-white text-center">Welcome Back</h1>
          <p className="text-gray-300 text-sm text-center">
            Log in to MusiSense to access your playlists
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center font-medium animate-in fade-in zoom-in-95 duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-gray-200 border border-sky-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-gray-200 border border-sky-300 text-gray-900 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-150 text-white text-sm py-3 rounded-full transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-sm text-center text-gray-300 pt-2">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-sky-300 transition-all"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
