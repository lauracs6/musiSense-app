import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import ElectroBorder from "./Electroborder";
import { isTrackPlayable } from "../utils/trackUtils";
import {
  Home as HomeIcon,
  Search,
  PlusSquare,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  LogIn,
  LogOut,
  User as UserIcon,
  ListMusic,
  Shuffle,
  UserPlus,
  PlusIcon,
  Music4,
  Music2Icon,
} from "lucide-react";

const MainLayout = ({
  children,
  currentTrack,
  onNext,
  onPrev,
  isShuffle,
  setIsShuffle,
}) => {
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const rainbowColors = [
    "#22b2ff",
    "#5650ff",
    "#a155f7",
    "#ff4af0",
    "#a155f7",
    "#5650ff",
  ];
  const [colorIndex, setColorIndex] = useState(0);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Función auxiliar para obtener la URL completa de la carátula
  const getCoverUrl = (cover) => {
    if (!cover) return null;
    if (cover.startsWith("http")) return cover;
    // La base del storage es la raíz del backend (sin /api)
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    return `${baseUrl}/storage/${cover}`;
  };

  useEffect(() => {
    if (!token) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [token]);

  const fetchPlaylists = () => {
    if (token) {
      api
        .get("/playlists")
        .then((res) => setPlaylists(res.data.data || res.data || []))
        .catch((err) => console.error("Error updating sidebar playlists", err));
    }
  };

  useEffect(() => {
    fetchPlaylists();
    window.addEventListener("playlist-created", fetchPlaylists);
    return () => {
      window.removeEventListener("playlist-created", fetchPlaylists);
    };
  }, [token, location.pathname]);

  useEffect(() => {
    if (currentTrack && audioRef.current && token) {
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentTrack, token]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume * 0.9;
    }
  }, [volume]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % rainbowColors.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, rainbowColors.length]);

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsPlaying(false);
      navigate("/login");
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;
  const currentBorderColor = rainbowColors[colorIndex];

  // Construir la URL del stream usando la baseURL de axios
  const streamUrl = currentTrack && token
    ? `${api.defaults.baseURL}/tracks/${currentTrack.id}/stream`
    : null;

  return (
    <div className="flex h-screen w-screen flex-col bg-black text-gray-300 font-sans select-none overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (igual que antes, sin cambios) */}
        <aside className="w-64 bg-gray-900 p-4 flex flex-col gap-4 border-r border-slate-900 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className="pt-2">
            <Link
              to="/"
              className="group flex flex-col items-center gap-1 transition-all"
            >
              <img
                src="/images/MS.png"
                alt="Musisense Logo"
                className="w-28 h-28 rounded-full brightness-110 transition-all group-hover:scale-120"
              />
            </Link>
          </div>

          <nav className="flex flex-col gap-2 mt-2">
            <Link
              to="/search"
              className={`flex items-center justify-center gap-4 px-3 py-2 rounded-lg text-sm/lg transition-colors ${
                location.pathname === "/search"
                  ? "text-sky-400 bg-gray-500/20"
                  : "text-white"
              }`}
            >
              <Search size={22} />
            </Link>
          </nav>

          {token && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <div className="flex items-center justify-between px-3 mb-4">
                  <p className="text-sm/lg font-bold text-white tracking-widest">
                    My Playlists
                  </p>
                  <Link
                    to="/create-playlist"
                    title="Create Playlist"
                    className={`p-2 transition-all text-sm rounded-full flex items-center justify-center hover:scale-105 active:scale-95 ${
                      location.pathname === "/create-playlist"
                        ? "text-sky-400 bg-gray-500/30"
                        : "text-white bg-gray-500/20 hover:bg-gray-600/40"
                    }`}
                  >
                    <PlusIcon size={18} />
                    Create
                  </Link>
                </div>
                <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar px-3 border-l border-indigo-950 ml-1">
                  {playlists.length === 0 ? (
                    <p className="text-xs text-slate-500 italic pl-1 py-1 font-medium select-none">
                      No playlists yet
                    </p>
                  ) : (
                    playlists.map((pl) => (
                      <Link
                        key={pl.id}
                        to={`/playlist/${pl.id}`}
                        className={`flex items-center gap-4 px-3 py-2 rounded-lg text-sm transition-colors ${
                          location.pathname === `/playlist/${pl.id}`
                            ? "text-sky-400 bg-gray-400/20"
                            : "text-white"
                        }`}
                      >
                        <ListMusic
                          size={18}
                          className="group-hover:scale-110 transition-transform flex-shrink-0"
                        />
                        <span className="truncate">{pl.name}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-indigo-950">
            {token ? (
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-4 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === `/profile`
                      ? "text-sky-400 bg-gray-400/20"
                      : "text-indigo-400"
                  }`}
                >
                  <UserIcon size={22} className="flex-shrink-0" />
                  <Link to="/profile" className="text-sm/lg truncate">
                    {user.username || user.name}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-white hover:text-red-400 px-3 py-1.5 text-sm w-full text-left transition-colors cursor-pointer"
                >
                  <LogOut size={22} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Link
                  to="/login"
                  className="flex items-center gap-4 text-white hover:text-indigo-300 px-3 py-2 text-sm/lg transition-colors"
                >
                  <LogIn size={22} /> Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-4 text-white hover:text-indigo-300 px-3 py-2 text-sm/lg transition-colors"
                >
                  <UserPlus size={22} /> Register
                </Link>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-900/50 to-black p-8">
          {children}
        </main>
      </div>

      {/* AUDIO (solo si hay token y currentTrack) */}
      {token && currentTrack && (
        <audio
          ref={audioRef}
          src={streamUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onNext}
        />
      )}

      {/* REPRODUCTOR */}
      {token ? (
        <ElectroBorder
          borderColor={currentBorderColor}
          borderWidth={3}
          distortion={1}
          animationSpeed={1.8}
          glowBlur={12}
          isPaused={!isPlaying}
          className="w-full mt-auto transition-colors duration-1000 ease-in-out"
        >
          <footer className="h-24 bg-black/90 px-6 flex items-center justify-between backdrop-blur-md">
            {/* Metadata */}
            <div className="flex items-center gap-4 w-1/4">
              <div className="animate-spin [animation-duration:20s] w-14 h-14 bg-slate-800 rounded-full border border-indigo-500/20 flex items-center justify-center overflow-hidden shrink-0">
                {currentTrack?.album?.cover ? (
                  <img
                    src={getCoverUrl(currentTrack.album.cover)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music size={22} className="text-indigo-500/40" />
                )}
              </div>
              <div className="truncate">
                <div className="text-lg bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-300 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
                  {currentTrack?.title || "No track selected"}
                </div>
                <div className="text-sm/lg ">
                  {currentTrack?.artist || "MusiSense Player"}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center w-2/4 gap-2">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`transition-all hover:scale-110 cursor-pointer ${isShuffle ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}
                  title="Shuffle"
                >
                  <Shuffle size={22} />
                </button>
                <button
                  onClick={onPrev}
                  className="text-gray-400 hover:text-white transition-all cursor-pointer"
                  title="Previous"
                >
                  <SkipBack size={22} fill="currentColor" />
                </button>
                <button
                  onClick={togglePlay}
                  className="bg-white text-black rounded-full p-2.5 hover:bg-sky-300 hover:text-white hover:scale-110 transition-all shadow-lg active:scale-95"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={26} fill="currentColor" />
                  ) : (
                    <Play size={26} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button
                  onClick={onNext}
                  className="text-gray-400 hover:text-white transition-all cursor-pointer"
                  title="Next"
                >
                  <SkipForward size={22} fill="currentColor" />
                </button>
              </div>

              <div className="w-full flex items-center gap-3 px-4">
                <span className="text-xs  text-slate-400 w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleProgressChange}
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${progressPercent}%, #1e293b ${progressPercent}%, #1e293b 100%)`,
                  }}
                  className="flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-white transition-all"
                />
                <span className="text-xs  text-slate-400 w-12">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Volume */}
            <div className="w-1/4 flex justify-end items-center gap-3">
              {volume === 0 ? (
                <VolumeX
                  size={22}
                  className="text-gray-400 hover:text-white transition-all cursor-pointer"
                  onClick={() => setVolume(0.5)}
                />
              ) : (
                <Volume2
                  size={22}
                  className="text-gray-400 hover:text-white transition-all cursor-pointer"
                  onClick={() => setVolume(0)}
                />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volumePercent}%, #1e293b ${volumePercent}%, #1e293b 100%)`,
                }}
                className="w-24 h-1 rounded-lg appearance-none cursor-pointer accent-white transition-all"
              />
            </div>
          </footer>
        </ElectroBorder>
      ) : (
        <footer className="h-24 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 px-8 flex items-center justify-between border-t border-indigo-950/40 relative z-50">
          <div className="flex items-center gap-4">
            <img
              src="/images/MS.png"
              alt="MusiSense Logo"
              className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-widest text-white">
                MusiSense
              </span>
              <span className="text-xs text-indigo-400 font-medium">
                Sensing the rhythm of your world
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium tracking-wide">
            Sign in to unleash the full audio experience.
          </div>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;