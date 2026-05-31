import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, ArrowLeft, Play, Clock } from "lucide-react";
import TrackActions from "../components/TrackActions";
import { isTrackPlayable } from "../utils/trackUtils";

const AlbumDetail = ({ onPlay }) => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTrackMenuId, setActiveTrackMenuId] = useState(null);

  const getCoverUrl = (cover) => {
    if (!cover) return null;
    if (cover.startsWith("http")) return cover;
    const baseUrl = api.defaults.baseURL.replace(/\/api$/, '');
    return `${baseUrl}/storage/${cover}`;
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/albums/${id}`)
      .then((res) => {
        const albumData = res.data.data || res.data;
        setAlbum(albumData);
        const albumTracks = albumData.tracks || [];
        const tracksWithContext = albumTracks.map((track) => ({
          ...track,
          artist: track.artist || albumData.artist,
          album: {
            id: albumData.id,
            title: albumData.title,
            cover: albumData.cover,
            status: albumData.status,
            artist_active: albumData.artist_active,
          },
        }));
        const sortedTracks = [...tracksWithContext].sort(
          (a, b) => (a.track_number || 0) - (b.track_number || 0)
        );
        setTracks(sortedTracks);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading album detail:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex h-64 items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={48} /></div>;
  if (!album) return <div className="text-center text-slate-400 py-12">Album not found.</div>;

  const coverUrl = getCoverUrl(album.cover);
  const albumActive = album.status === 'y'; // true si activo

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* CABECERA - se aplica gris si el álbum está inactivo */}
      <div className={`-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12 transition-all ${!albumActive ? 'opacity-50 grayscale' : ''}`}>
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <img src={coverUrl} alt={album.title} className="w-70 h-65 object-cover rounded-lg shadow-lg" />
          <div className="flex flex-col text-center md:text-left space-y-2">
            <p className="text-4xl text-white font-bold">{album.title}</p>
            <p className="text-white text-xl">{album.artist}</p>
            <p className="text-white text-lg">{album.year || "N/A"}</p>
            <p className="text-white text-sm">{tracks.length} tracks</p>
            {!albumActive && <span className="text-red-300 text-sm font-bold">(Album inactive)</span>}
          </div>
        </div>
      </div>

      {/* LISTA DE CANCIONES */}
      <div className="pt-4">
        {tracks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm bg-slate-900/10 rounded-xl border border-slate-900">
            This album has no tracks available.
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-gray-800 text-[11px] tracking-widest text-gray-300">
              <div className="w-10 text-center">#</div>
              <div>Song</div>
              <div className="hidden md:block">Album</div>
              <div className="w-24 flex justify-end pr-3"><Clock size={14} className="text-gray-300 mr-12" /></div>
            </div>

            <div className="mt-2 space-y-0.5">
              {tracks.map((track, index) => {
                const playable = isTrackPlayable(track);
                return (
                  <div
                    key={track.id}
                    className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-4 py-2.5 hover:bg-gray-900 rounded-lg transition-all group ${!playable ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-10 flex items-center justify-center relative">
                      <span className="text-sm text-gray-400 group-hover:opacity-0 transition-opacity">
                        {track.track_number || index + 1}
                      </span>
                      {playable && (
                        <button
                          onClick={() => onPlay(track, tracks)}
                          className="absolute inset-0 m-auto w-7 h-7 bg-sky-300 text-white rounded-full items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 flex active:scale-95"
                        >
                          <Play size={12} fill="white" className="ml-0.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col truncate">
                        <span className={`text-white text-lg transition-colors truncate ${!playable ? 'line-through text-gray-400' : ''}`}>
                          {track.title}
                        </span>
                        <span className="text-sm text-gray-400 truncate">{album.artist}</span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center text-sm text-gray-400 truncate pr-4">
                      <span className="truncate">{album.title}</span>
                    </div>

                    <div className="w-24 flex items-center justify-end gap-4">
                      <span className="text-sm text-gray-400">
                        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}
                      </span>
                      <TrackActions
                        track={track}
                        isOpen={activeTrackMenuId === track.id}
                        setIsOpen={(open) => setActiveTrackMenuId(open ? track.id : null)}
                        isLastItem={index >= tracks.length - 2}
                        disabled={!playable}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;