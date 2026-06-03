import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Loader2, ArrowLeft, Music } from "lucide-react";

const ArtistsList = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const getCoverUrl = (cover) => {
    if (!cover) return null;
    if (cover.startsWith("http")) return cover;
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    return `${baseUrl}/storage/${cover}`;
  };

  const fetchArtists = useCallback(async () => {
    try {
      const res = await api.get("/albums");
      const albumsData = res.data.data || res.data || [];

      if (Array.isArray(albumsData)) {
        const artistMap = new Map();

        albumsData.forEach((album) => {
          const artistName = album.artist;
          if (!artistName) return;

          const isAlbumActive = album.status === "y";
          if (!artistMap.has(artistName)) {
            artistMap.set(artistName, {
              name: artistName,
              cover: null,
              hasActiveAlbum: false,
            });
          }

          const artistData = artistMap.get(artistName);
          if (!artistData.cover && album.cover) {
            artistData.cover = getCoverUrl(album.cover);
          }
          if (isAlbumActive) {
            artistData.hasActiveAlbum = true;
          }
        });

        const uniqueArtists = Array.from(artistMap.values())
          .sort((a, b) => a.name.localeCompare(b.name));
        setArtists(uniqueArtists);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading artists:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
    // Polling cada 5 segundos
    intervalRef.current = setInterval(fetchArtists, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchArtists]);

  // Recargar al recibir foco de la ventana
  useEffect(() => {
    const handleFocus = () => fetchArtists();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchArtists]);

  // Escuchar evento de canción inválida (para refrescar)
  useEffect(() => {
    const handleRefresh = () => fetchArtists();
    window.addEventListener("track-invalidated", handleRefresh);
    return () => window.removeEventListener("track-invalidated", handleRefresh);
  }, [fetchArtists]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 text-gray-200 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="flex flex-col text-center md:text-left space-y-2">
            <p className="text-4xl text-white font-bold">All Artists</p>
            <p className="text-white text-xl">{artists.length} artists</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {artists.length === 0 ? (
          <div className="text-center text-slate-500 py-12">No artists found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center mx-auto">
            {artists.map((artist) => {
              const isActive = artist.hasActiveAlbum;
              return (
                <Link
                  key={artist.name}
                  to={isActive ? `/artist/${encodeURIComponent(artist.name)}` : "#"}
                  onClick={(e) => !isActive && e.preventDefault()}
                  className={`flex flex-col items-center gap-4 group cursor-pointer w-full max-w-[160px] ${
                    !isActive ? "opacity-50 grayscale pointer-events-none" : ""
                  }`}
                >
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden group-hover:scale-110">
                    {artist.cover ? (
                      <img
                        src={artist.cover}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                        <Music size={36} />
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-white">{artist.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsList;