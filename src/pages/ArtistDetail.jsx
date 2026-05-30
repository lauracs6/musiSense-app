import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, ArrowLeft, Disc } from "lucide-react";

const ArtistDetail = () => {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/albums")
      .then((res) => {
        const albumsData = res.data.data || res.data || [];

        // Filtrar álbumes por artista
        const artistAlbums = albumsData.filter((album) => {
          if (
            album.artist &&
            album.artist.toLowerCase() === artistName.toLowerCase()
          )
            return true;
          if (
            album.artists &&
            album.artists.some(
              (a) => a.name.toLowerCase() === artistName.toLowerCase(),
            )
          )
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading artist albums:", err);
        setLoading(false);
      });
  }, [artistName]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  const artistProfilePic =
    albums.length > 0 && albums[0].cover
      ? albums[0].cover.startsWith("http")
        ? albums[0].cover
        : `http://musisense.test/storage/${albums[0].cover}`
      : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* CABECERA */}
      <div className="-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <img
            src={artistProfilePic}
            alt={artistName}
            className="w-70 h-65 object-cover rounded-full shadow-lg"
          />

          <div className="flex flex-col text-center md:text-left space-y-2">
            <p className="text-4xl text-white font-bold">{artistName}</p>
            <p className="text-white text-xl">
              {albums.length} {albums.length === 1 ? "album" : "albums"}
            </p>
          </div>
        </div>
      </div>

      {/* ALBUMS */}
      <div className="space-y-4">
        <h2 className="text-white text-lg">Albums</h2>

        {albums.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No albums found.</p>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1">
            {albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="w-60 p-3 rounded-xl flex-shrink-0 transition-all group"
              >
                <div className="w-full aspect-square overflow-hidden mb-3 relative shadow-md">
                  {album.cover ? (
                    <img
                      src={
                        album.cover.startsWith("http")
                          ? album.cover
                          : `http://musisense.test/storage/${album.cover}`
                      }
                      alt={album.name || album.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Disc size={20} />
                    </div>
                  )}
                </div>

                <div className="truncate space-y-1">
                  <p className="text-lg text-white truncate transition-colors">
                    {album.name || album.title}
                  </p>
                  <p className="text-sm text-gray-300 truncate">
                    {album.artists && album.artists.length > 0
                      ? album.artists[0].name || album.artists[0].nombre
                      : "Artista"}
                  </p>
                  <p className="text-sm text-gray-300 ">
                    {album.year || album.release_year || "N/A"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;
