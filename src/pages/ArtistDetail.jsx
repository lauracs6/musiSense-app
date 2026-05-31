import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, ArrowLeft, Disc } from "lucide-react";

const ArtistDetail = () => {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistActive, setArtistActive] = useState(true);

  const getCoverUrl = (cover) => {
    if (!cover) return null;
    if (cover.startsWith("http")) return cover;
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    return `${baseUrl}/storage/${cover}`;
  };

  useEffect(() => {
    setLoading(true);
    api
      .get("/albums")
      .then((res) => {
        const albumsData = res.data.data || res.data || [];
        
        // DEBUG: Ver qué llega
        console.log("Todos los álbumes:", albumsData.map(a => ({id: a.id, title: a.title, status: a.status, artist_active: a.artist_active, artist: a.artist})));

        // Filtrar álbumes del artista por nombre
        const artistAlbums = albumsData.filter((album) => {
          if (album.artist && album.artist.toLowerCase() === artistName.toLowerCase()) return true;
          if (album.artists && album.artists.some((a) => a.name.toLowerCase() === artistName.toLowerCase())) return true;
          return false;
        });

        console.log("Álbumes filtrados:", artistAlbums.map(a => ({id: a.id, title: a.title, status: a.status, artist_active: a.artist_active})));

        // Ordenar
        const sortedAlbums = artistAlbums.sort((a, b) => {
          const yearA = parseInt(a.year || a.release_year || 0);
          const yearB = parseInt(b.year || b.release_year || 0);
          return yearB - yearA;
        });

        setAlbums(sortedAlbums);

        // ✅ LÓGICA CORREGIDA: El artista está activo si tiene al menos un álbum con status === 'y'
        const hasActiveAlbum = sortedAlbums.some(album => album.status === 'y');
        setArtistActive(hasActiveAlbum);
        console.log("Artista activo (tiene álbumes activos)?", hasActiveAlbum);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading artist albums:", err);
        setLoading(false);
      });
  }, [artistName]);

  if (loading) return <div className="flex h-64 items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={48} /></div>;

  const artistProfilePic = albums.length > 0 && albums[0].cover ? getCoverUrl(albums[0].cover) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* CABECERA - se pone gris solo si NO tiene ningún álbum activo */}
      <div className={`-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12 transition-all ${!artistActive ? 'opacity-50 grayscale' : ''}`}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <img src={artistProfilePic} alt={artistName} className="w-70 h-65 object-cover rounded-full shadow-lg" />
          <div className="flex flex-col text-center md:text-left space-y-2">
            <p className="text-4xl text-white font-bold">{artistName}</p>
            <p className="text-white text-xl">{albums.length} {albums.length === 1 ? "album" : "albums"}</p>
            {!artistActive && <span className="text-red-300 text-sm font-bold">(No active albums)</span>}
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
              // Un álbum está inactivo si su status === 'n'
              const isAlbumInactive = album.status === 'n';
              const albumCover = getCoverUrl(album.cover);
              const albumTitle = album.title || album.name;

              return (
                <Link
                  key={album.id}
                  to={isAlbumInactive ? "#" : `/album/${album.id}`}
                  onClick={(e) => isAlbumInactive && e.preventDefault()}
                  className={`w-60 p-3 rounded-xl flex-shrink-0 transition-all group ${
                    isAlbumInactive ? "opacity-50 grayscale pointer-events-none" : "hover:bg-gray-800/50"
                  }`}
                >
                  <div className="w-full aspect-square overflow-hidden mb-3 relative shadow-md">
                    {albumCover ? (
                      <img src={albumCover} alt={albumTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600"><Disc size={20} /></div>
                    )}
                  </div>
                  <div className="truncate space-y-1">
                    <p className="text-lg text-white truncate">{albumTitle}</p>
                    <p className="text-sm text-gray-300 truncate">{album.artist || artistName}</p>
                    <p className="text-sm text-gray-300">{album.year || "N/A"}</p>
                    {isAlbumInactive && <p className="text-xs text-red-400 font-medium">(Album not available right now)</p>}
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