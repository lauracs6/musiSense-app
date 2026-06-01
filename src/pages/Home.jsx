import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { Music, Loader2, Play } from "lucide-react";
import TrackActions from "../components/TrackActions";
import { isTrackPlayable } from "../utils/trackUtils";

const Home = ({ onPlay }) => {
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackMenuId, setActiveTrackMenuId] = useState(null);

  const isAuthenticated = !!localStorage.getItem("token");

  const getCoverUrl = (cover) => {
    if (!cover) return null;
    if (cover.startsWith("http")) return cover;
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    return `${baseUrl}/storage/${cover}`;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([api.get("/tracks"), api.get("/genres"), api.get("/albums")])
      .then(([resTracks, resGenres, resAlbums]) => {
        // --- CANCIONES: solo las que son reproducibles ---
        const tracksData = resTracks.data.data || resTracks.data || [];
        const playableTracks = tracksData.filter(track => isTrackPlayable(track));
        const randomSongs = playableTracks
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);
        setSongs(randomSongs);

        // --- GÉNEROS ---
        const genresData = resGenres.data.data || resGenres.data || [];
        setGenres(Array.isArray(genresData) ? genresData : []);

        // --- ARTISTAS (a partir de álbumes, como antes) ---
        const albumsData = resAlbums.data.data || resAlbums.data || [];
        if (Array.isArray(albumsData)) {
          const artistMap = new Map();
          albumsData.forEach((album) => {
            const artistName = album.artist;
            if (!artistName) return;
            if (!artistMap.has(artistName) && album.cover) {
              const coverUrl = getCoverUrl(album.cover);
              const isArtistInactive = album.artist_active === false;
              const isGenreInactive = album.genre && album.genre.status === 'n';
              const isActive = !isArtistInactive && !isGenreInactive;
              artistMap.set(artistName, { name: artistName, cover: coverUrl, active: isActive });
            }
          });
          const uniqueArtists = Array.from(artistMap.values()).slice(0, 6);
          setArtists(uniqueArtists);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading home data:", err);
        setLoading(false);
      });
  }, [isAuthenticated]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
          <Music size={40} />
        </div>
        <h1 className="text-4xl text-white">Welcome to MusiSense</h1>
        <p className="text-slate-400 max-w-md">
          Discover, create and enjoy your personal music collection. Login to start your journey.
        </p>
        <Link
          to="/login"
          className="w-42 bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-150 text-white text-sm py-3 rounded-full transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* GENRES */}
      <section>
        <h2 className="text-xl text-white mb-6">Explore Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {genres.map((genre) => {
            const isInactive = genre.status === 'n';
            return (
              <Link
                key={genre.id}
                to={isInactive ? "#" : `/genre/${genre.id}`}
                onClick={(e) => isInactive && e.preventDefault()}
                className={`h-12 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full flex items-center justify-center cursor-pointer transition-all group px-4 text-center ${
                  isInactive ? "opacity-50 grayscale pointer-events-none" : "hover:brightness-150"
                }`}
              >
                <span className="text-white text-sm">{genre.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ARTISTS */}
      {artists.length > 0 && (
        <section className="w-full text-center">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl text-white text-left">Explore Artists</h2>
            <Link
              to="/artists"
              className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors"
            >
              Show All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 justify-center justify-items-center max-w-5xl mx-auto">
            {artists.map((artist) => {
              const isInactive = !artist.active;
              return (
                <Link
                  key={artist.name}
                  to={isInactive ? "#" : `/artist/${encodeURIComponent(artist.name)}`}
                  onClick={(e) => isInactive && e.preventDefault()}
                  className={`flex flex-col items-center gap-4 group cursor-pointer w-full max-w-[160px] ${
                    isInactive ? "opacity-50 grayscale pointer-events-none" : ""
                  }`}
                >
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden group-hover:scale-110">
                    <img
                      src={artist.cover}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                  </div>
                  <span className="text-sm text-white">{artist.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* TRACKS - solo se muestran canciones reproducibles */}
      {songs.length > 0 && (
        <section>
          <h2 className="text-xl text-white mb-6">Tracks you might like</h2>
          <div className="flex flex-col gap-4">
            {songs.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-xl hover:brightness-110 transition-all group px-4 shadow-md border border-slate-800/40"
              >
                <div
                  className="flex items-center gap-5 flex-1 cursor-pointer"
                  onClick={() => onPlay(track, songs)}
                >
                  <div className="w-12 h-12 rounded flex items-center justify-center overflow-hidden shadow-md transition-all relative shrink-0">
                    {track.album?.cover ? (
                      <img
                        src={getCoverUrl(track.album.cover)}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music size={18} className="text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={16} fill="white" className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-white text-sm">{track.title}</span>
                    <span className="text-xs text-gray-400 group-hover:text-slate-300 truncate">
                      {track.artist}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="hidden md:block text-xs text-gray-300">
                    {Math.floor(track.duration / 60)}:
                    {String(track.duration % 60).padStart(2, "0")}
                  </span>
                  <TrackActions
                    track={track}
                    isOpen={activeTrackMenuId === track.id}
                    setIsOpen={(open) => setActiveTrackMenuId(open ? track.id : null)}
                    isLastItem={index >= songs.length - 2}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;