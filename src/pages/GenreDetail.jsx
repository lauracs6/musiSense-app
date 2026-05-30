import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { Loader2, Disc, ArrowLeft } from "lucide-react";

const GenreDetail = () => {
  const { id } = useParams();
  const [genre, setGenre] = useState(null);
  const [groupedArtists, setGroupedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api
      .get(`/genres/${id}`)
      .then((res) => {
        const genreData = res.data.data || res.data;
        setGenre(genreData);

        // Los álbumes ya vienen filtrados por Laravel gracias a .load('albums.artists')
        const genreAlbums = genreData.albums || [];

        // Agrupar álbumes por artista leyendo el array plural 'artists'
        const artistMap = {};
        genreAlbums.forEach((album) => {
          // Tomamos el nombre del primer artista del array si existe
          const artistName =
            album.artists && album.artists.length > 0
              ? album.artists[0].name || album.artists[0].nombre
              : "Artista Desconocido";

          if (!artistMap[artistName]) {
            artistMap[artistName] = [];
          }
          artistMap[artistName].push(album);
        });

        // Ordenar artistas Alfabéticamente de la A a la Z (Vertical)
        const sortedArtists = Object.keys(artistMap)
          .sort((a, b) => a.localeCompare(b))
          .map((artistName) => {
            // Ordenar los álbumes de este artista por año: Más reciente primero (Horizontal)
            const sortedAlbums = artistMap[artistName].sort((a, b) => {
              const yearA = parseInt(a.year || a.release_year || 0);
              const yearB = parseInt(b.year || b.release_year || 0);
              return yearB - yearA;
            });

            return {
              name: artistName,
              albums: sortedAlbums,
            };
          });

        setGroupedArtists(sortedArtists);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching genre detail:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  if (!genre)
    return (
      <div className="text-center text-slate-400 py-12">Genre not found.</div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Link
        to="/"
        className="p-2 text-gray-200 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} />
      </Link>
      {/* Cabecera de la vista */}
      <div className="-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl text-white tracking-widest font-semibold">
              {genre.name}
            </h1>
            <h2 className="text-sm text-gray-100 mt-1">
              {genre.albums ? genre.albums.length : 0}{" "}
              {genre.albums && genre.albums.length === 1 ? "Album" : "Albums"}
            </h2>
          </div>
        </div>
      </div>

      {groupedArtists.length === 0 ? (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          No albums registered under this genre yet.
        </div>
      ) : (
        <div className="space-y-10">
          {/* Artistas de la A a la Z (vertical) */}
          {groupedArtists.map((artist) => (
            <div key={artist.name} className="space-y-4">
              <h2 className="text-white text-lg">{artist.name}</h2>

              {/* Álbumes de más reciente a más antiguo (horizontal) */}
              <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1">
                {artist.albums.map((album) => {
                  const coverUrl = album.cover
                    ? album.cover.startsWith("http")
                      ? album.cover
                      : `http://musisense.test/storage/${album.cover}`
                    : null;

                  return (
                    <Link
                      key={album.id}
                      to={`/album/${album.id}`}
                      className="w-60 p-3 rounded-xl flex-shrink-0 transition-all group"
                    >
                      <div className="w-full aspect-square overflow-hidden mb-3 relative shadow-md">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={album.name || album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Disc size={32} />
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreDetail;
