import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Loader2, ArrowLeft, Music } from "lucide-react";

const ArtistsList = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api
      .get("/albums")
      .then((res) => {
        const albumsData = res.data.data || res.data || [];

        if (Array.isArray(albumsData)) {
          const artistMap = {};

          albumsData.forEach((album) => {
            if (album.artist) {
              if (!artistMap[album.artist] || album.cover) {
                const coverUrl = album.cover
                  ? album.cover.startsWith("http")
                    ? album.cover
                    : `http://musisense.test/storage/${album.cover}`
                  : null;

                artistMap[album.artist] = coverUrl;
              }
            }
          });

          const uniqueArtists = Object.entries(artistMap).map(
            ([name, cover]) => ({
              name,
              cover,
            }),
          );

          setArtists(uniqueArtists);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading all artists from albums:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* BOTÓN ATRÁS */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 text-gray-200 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* CABECERA */}
      <div className="-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">

          <div className="flex flex-col text-center md:text-left space-y-2">
            <p className="text-4xl text-white font-bold">
              All Artists
            </p>

            <p className="text-white text-xl">
              {artists.length} artists
            </p>
          </div>

        </div>
      </div>

      {/* ARTISTS */}
      <div className="space-y-4">
        {artists.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            No artists found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center mx-auto">
            {artists.map((artist) => (
              <Link
                key={artist.name}
                to={`/artist/${encodeURIComponent(artist.name)}`}
                className="flex flex-col items-center gap-4 group cursor-pointer w-full max-w-[160px]"
              >
                {/* FOTO ARTISTA */}
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

                {/* NOMBRE */}
                <span className="text-sm text-white">
                  {artist.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ArtistsList;