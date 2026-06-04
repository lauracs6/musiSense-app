import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { PlusCircle, Music, Loader2, ArrowLeft } from "lucide-react";

const CreatePlaylist = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/playlists", { name: name.trim() });

      const newPlaylist = response.data.data;
      navigate(`/playlist/${newPlaylist.id}`);
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError(
        err.response?.data?.message ||
          "Could not create playlist. Please try again.",
      );
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón de regreso arriba del todo */}
      <div className="flex items-center gap-4">
        <Link
          to={`/`}
          className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Header */}
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 border border-sky-300 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-white text-center">
              New Playlist
            </h1>
            <p className="text-gray-400 text-sm text-center">
              Give a name to your next musical masterpiece
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center font-medium animate-in fade-in zoom-in-95 duration-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg text-white mb-2 ml-1">
                Playlist Name
              </label>
              <input
                type="text"
                required
                className="w-full bg-gray-200 border border-sky-300 text-gray-900 rounded-lg p-3 transition-colors"
                placeholder="e.g. Chill Melodies 🎧"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-150 text-white text-sm py-3 rounded-full transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Create Playlist"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-700/50 flex items-center gap-4 text-gray-400">
            <div className="w-10 h-10 rounded-lg bg-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Music size={18} />
            </div>
            <p className="text-xs leading-relaxed">
              After creating it, you will be able to search for tracks and add
              them directly to this list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;
