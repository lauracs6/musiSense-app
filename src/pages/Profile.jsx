import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Loader2, User, Lock, CheckCircle, AlertCircle } from "lucide-react";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUsername(userData.username || userData.name || "");
        setEmail(userData.email || "");
      } else {
        setMessage({
          type: "error",
          text: "User session not found. Please log in again.",
        });
      }
    } catch (err) {
      console.error("Error reading user from localStorage:", err);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword) {
      if (!currentPassword) {
        setMessage({
          type: "error",
          text: "You must enter your current password to set a new one.",
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "New passwords do not match." });
        return;
      }
    }

    setLoading(true);
    const promises = [];

    if (username.trim() !== "") {
      promises.push(api.put("/user", { username }));
    }

    if (newPassword) {
      promises.push(
        api.put("/user/password", {
          current_password: currentPassword, // 💡 Esto soluciona el error de validación
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      );
    }

    try {
      await Promise.all(promises);

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.username = username;
        localStorage.setItem("user", JSON.stringify(userData));
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      const responseData = err.response?.data;
      let errorMsg =
        responseData?.message || "Error updating account settings.";

      if (responseData?.errors) {
        const details = Object.values(responseData.errors).flat().join(" ");
        errorMsg = `${errorMsg} (${details})`;
      }

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 bg-gray-900 border border-sky-300 rounded-3xl p-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row gap-6 items-center p-2 border-b border-slate-800/60 pb-6">
        <div className="flex flex-col text-center space-y-1 w-full pb-1">
          <p className="text-lg text-white">Profile settings</p>
          <h1 className="text-white text-4xl font-bold tracking-widest transition-colors">
            {username}
          </h1>
          <p className="text-gray-400 text-sm ">{email}</p>
        </div>
      </div>

      {/* ALERTS */}
      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
              : "bg-rose-950/20 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message.text}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleUpdateProfile}
        className="space-y-6 bg-slate-900/10 p-6 rounded-2xl border border-slate-900 shadow-xl"
      >
        {/* SECTION 1: USERNAME */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-lg text-white tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-gray-200 border border-slate-800 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500/50 transition-colors w-full font-medium"
              placeholder="Your new username"
            />
          </div>
        </div>

        {/* SECTION 2: PASSWORD */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg text-white tracking-wider">Password</h2>
          <p className="text-sm text-gray-300">
            Leave these fields blank if you do not want to modify your current
            password.
          </p>

          <div className="grid grid-cols-1 gap-4">            
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-white tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-200 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500/50 transition-colors w-full "
                  placeholder="Enter current password to authorize changes"
                />
                <Lock
                  className="absolute left-3.5 top-3.5 text-slate-600"
                  size={16}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-white tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-200 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500/50 transition-colors w-full "
                    placeholder="••••••••"
                  />
                  <Lock
                    className="absolute left-3.5 top-3.5 text-slate-600"
                    size={16}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm text-white tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-200 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500/50 transition-colors w-full "
                    placeholder="••••••••"
                  />
                  <Lock
                    className="absolute left-3.5 top-3.5 text-slate-600"
                    size={16}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-150 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
