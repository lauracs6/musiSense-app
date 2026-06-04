import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { UserPlus, Loader2 } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", {
        username: username.trim(),
        email: email.trim(),
        password: password,
        password_confirmation: passwordConfirmation,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        window.location.href = "/";
      } else {
        navigate("/login", {
          state: { message: "Account created successfully! Please log in." },
        });
      }
    } catch (err) {
      console.error("API Error Response:", err.response);

      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const firstKey = Object.keys(validationErrors)[0];
        setError(validationErrors[firstKey][0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 border border-sky-300 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-400/20 shadow-inner">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl  text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-gray-300">
            Join MusiSense and build your own music playlists
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center font-medium animate-in fade-in zoom-in-95 duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-300 tracking-wider pl-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full bg-gray-200 border border-sky-300 text-gray-900 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-300 tracking-wider pl-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-gray-200 border border-sky-300 text-gray-900 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-300 tracking-wider pl-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-200 border border-sky-300 text-gray-900 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-300 tracking-wider pl-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-200 border border-sky-300 text-gray-900 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-150 text-white text-sm py-3 rounded-full transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-sm text-center text-gray-300 pt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-sky-300 transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
