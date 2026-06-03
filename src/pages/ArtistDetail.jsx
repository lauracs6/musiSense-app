import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, ArrowLeft, Disc } from "lucide-react";

const ArtistDetail = () => {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistActive, setArtistActive] = useState(true);
  const pollingIntervalRef = useRef(null);

  const getCoverUrl = (cover) => {
    if (!cover) return null;
    if (cover.startsWith("http")) return cover;
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    return `${baseUrl}/storage/${cover}`;
  };

  const fetchArtistData = useCallback(async () => {
    try {
      const albumsRes = await api.get("/albums");
      const albumsData = albumsRes.data.data || albumsRes.data || [];

      // Filtrar álbumes del artista por nombre
      const artistAlbums = albumsData.filter((album) => {
        if (album.artist && album.artist.toLowerCase() === artistName.toLowerCase())
          return true;
        if (album.artists && album.artists.some(a => a.name.toLowerCase() === artistName.toLowerCase()))
          return true;
        return false;
      });

      // Ordenar del más reciente al más antiguo
      const sortedAlbums = artistAlbums.sort((a, b) => {
        const yearA = parseInt(a.year || a.release_year || 0);
        const yearB = parseInt(b.year || b.release_year || 0);
        return yearB - yearA;
      });

      setAlbums(sortedAlbums);

      // 🔥 Determinar si el artista está activo: si tiene al menos un álbum activo
      const hasActiveAlbums = sortedAlbums.some(album => album.status === 'y');
      setArtistActive(hasActiveAlbums);
    } catch (err) {
      console.error("Error loading artist albums:", err);
    } finally {
      setLoading(false);
    }
  }, [artistName]);

  // Carga inicial
  useEffect(() => {
    setLoading(true);
    fetchArtistData();
  }, [fetchArtistData]);

  // Escuchar evento global para refrescar (cuando se invalida una canción)
  useEffect(() => {
    const handleRefresh = () => {
      console.log("🔄 Evento track-invalidated recibido, refrescando artista...");
      fetchArtistData();
    };
    window.addEventListener("track-invalidated", handleRefresh);
    return () => window.removeEventListener("track-invalidated", handleRefresh);
  }, [fetchArtistData]);

  // Polling cada 10 segundos (solo cuando la pestaña está visible)
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) return;
      pollingIntervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchArtistData();
        }
      }, 10000);
    };
    startPolling();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [fetchArtistData]);

  // Pausar polling cuando la pestaña no está visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchArtistData();
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            if (document.visibilityState === 'visible') fetchArtistData();
          }, 10000);
        }
      } else {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchArtistData]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  const artistProfilePic = albums.length > 0 && albums[0].cover
    ? getCoverUrl(albums[0].cover)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* CABECERA - se pone gris si no tiene álbumes activos */}
      <div className={`-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12 transition-all ${!artistActive ? "opacity-50 grayscale" : ""}`}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <img src={artistProfilePic} alt={artistName} className="w-70 h-65 object-cover rounded-full shadow-lg" />
          <div className="flex flex-col text-center md:text-left space-y-2">
            <p className="text-4xl text-white font-bold">{artistName}</p>
            <p className="text-white text-xl">
              {albums.length} {albums.length === 1 ? "album" : "albums"}
            </p>
            {!artistActive && (
              <span className="text-red-300 text-sm font-bold">(No active albums)</span>
            )}
          </div>
        </div>
      </div>

      {/* LISTA DE ÁLBUMES */}
      <div className="space-y-4">
        <h2 className="text-white text-lg">Albums</h2>
        {albums.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No albums found.</p>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1">
            {albums.map((album) => {
              const isAlbumInactive = album.status === "n";
              const albumCover = getCoverUrl(album.cover);
              const albumTitle = album.title || album.name;

              return (
                <Link
                  key={album.id}
                  to={isAlbumInactive ? "#" : `/album/${album.id}`}
                  onClick={(e) => isAlbumInactive && e.preventDefault()}
                  className={`w-60 p-3 rounded-xl flex-shrink-0 transition-all group ${
                    isAlbumInactive
                      ? "opacity-50 grayscale pointer-events-none"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <div className="w-full aspect-square overflow-hidden mb-3 relative shadow-md">
                    {albumCover ? (
                      <img
                        src={albumCover}
                        alt={albumTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Disc size={20} />
                      </div>
                    )}
                  </div>
                  <div className="truncate space-y-1">
                    <p className="text-lg text-white truncate transition-colors">{albumTitle}</p>
                    <p className="text-sm text-gray-300 truncate">{album.artist || artistName}</p>
                    <p className="text-sm text-gray-300">{album.year || "N/A"}</p>
                    {isAlbumInactive && <p className="text-xs text-red-400 font-medium">(Inactive)</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;