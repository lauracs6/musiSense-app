import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Play,
  Trash2,
  Clock,
  Music,
  Edit2,
  Check,
  X,
  GripVertical,
  ArrowLeft,
  Plus,
  LoaderCircle,
} from "lucide-react";
import { isTrackPlayable } from "../utils/trackUtils";

const PlaylistDetail = ({ onPlay }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await api.get(`/playlists/${id}`);
      const data = res.data.data;
      setPlaylist(data);
      setNewName(data.name);
      setNewDescription(data.description || "");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching playlist", err);
      setLoading(false);
    }
  }, [id]);

  // Carga inicial + polling cada 5 segundos
  useEffect(() => {
    fetchPlaylist();
    intervalRef.current = setInterval(fetchPlaylist, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchPlaylist]);

  // Recargar al recibir foco de la ventana
  useEffect(() => {
    const handleFocus = () => fetchPlaylist();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchPlaylist]);

  // Escuchar evento de canción invalidada (por si viene de otro lugar)
  useEffect(() => {
    const handleRefresh = () => fetchPlaylist();
    window.addEventListener("track-invalidated", handleRefresh);
    return () => window.removeEventListener("track-invalidated", handleRefresh);
  }, [fetchPlaylist]);

  // 🔥 Detener reproducción inmediatamente si la playlist se desactiva
  useEffect(() => {
    if (!playlist) return;
    if (playlist.status === "n") {
      const audio = document.querySelector("audio");
      if (audio && !audio.paused) {
        audio.pause();
      }
      // Además, lanzar el evento para que MainLayout limpie la cola
      window.dispatchEvent(new CustomEvent("track-invalidated"));
    }
  }, [playlist]);

  const handleUpdatePlaylist = async () => {
    try {
      await api.put(`/playlists/${id}`, {
        name: newName,
        description: newDescription,
      });
      setPlaylist((prev) => ({ ...prev, name: newName, description: newDescription }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating playlist", err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this playlist?"))
      return;
    try {
      await api.delete(`/playlists/${id}`);
      navigate("/");
    } catch (err) {
      console.error("Error deleting playlist", err);
      alert("Could not delete the playlist.");
    }
  };

  const handleRemoveTrack = async (trackId) => {
    if (!window.confirm("Remove this song from the playlist?")) return;
    try {
      await api.delete(`/playlists/${id}/tracks/${trackId}`);
      setPlaylist((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.id !== trackId),
      }));
    } catch (err) {
      console.error("Error removing track", err);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(playlist.tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPlaylist((prev) => ({ ...prev, tracks: items }));
    try {
      await api.post(`/playlists/${id}/reorder`, {
        track_ids: items.map((t) => t.id),
      });
    } catch (err) {
      console.error("Error saving new order", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-indigo-500">
        <LoaderCircle className="animate-spin" size={48} />
      </div>
    );
  }

  if (!playlist) {
    return <div className="text-center text-slate-400 py-12">Playlist not found.</div>;
  }

  const isPlaylistActive = playlist.status === "y";
  const hasPlayableTracks = isPlaylistActive && playlist.tracks?.some((track) => isTrackPlayable(track));

  const firstTrackCover = playlist.tracks?.find((t) => t.album?.cover)?.album?.cover;
  const coverUrl = firstTrackCover
    ? firstTrackCover.startsWith("http")
      ? firstTrackCover
      : `http://musisense.test/storage/${firstTrackCover}`
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
      <div
        className={`-mx-10 bg-gradient-to-b from-gray-800 to-indigo-300 rounded-xl p-12 transition-all ${
          !isPlaylistActive ? "opacity-50 grayscale" : ""
        }`}
      >
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="w-44 h-44 md:w-48 md:h-48 bg-slate-800 rounded-lg overflow-hidden shrink-0 shadow-2xl border border-slate-800/40">
            {coverUrl ? (
              <img src={coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <Music size={64} />
              </div>
            )}
          </div>

          <div className="flex flex-col text-center md:text-left space-y-2 w-full min-w-0">
            {isEditing && isPlaylistActive ? (
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-800 text-2xl md:text-4xl text-white border-b-2 border-indigo-500 outline-none px-2 w-full font-bold tracking-widest"
                    autoFocus
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleUpdatePlaylist}
                      className="p-2 bg-indigo-600 rounded-full text-white hover:scale-105 transition-transform shadow-lg"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 bg-slate-700 rounded-full text-white hover:scale-105 transition-transform"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-slate-800 text-slate-300 text-sm w-full p-3 rounded-lg border border-white/10 outline-none resize-none focus:border-indigo-500/50"
                  placeholder="Add an optional description..."
                  rows="2"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-1">
                  <h1 className="w-max max-w-full text-4xl font-bold text-white tracking-widest truncate">
                    {playlist.name}
                  </h1>
                  {isPlaylistActive && (
                    <div className="flex items-center gap-1 bg-slate-900/40 p-1 rounded-full border border-white/5 shadow-inner">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Edit playlist"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={handleDeletePlaylist}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-white text-xl">{playlist.user || "User"}</p>
                <p className="text-white text-lg">{playlist.description || "No description."}</p>
                <p className="text-white text-sm">{playlist.tracks?.length || 0} tracks</p>
                {!isPlaylistActive && (
                  <p className="text-red-300 text-sm font-bold">(Playlist inactive)</p>
                )}
                {isPlaylistActive && !hasPlayableTracks && playlist.tracks?.length > 0 && (
                  <p className="text-red-300 text-sm font-bold">(All tracks are currently unavailable)</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TRACKLIST */}
      <div className="pt-4">
        {!playlist.tracks || playlist.tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/50 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Music size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-medium text-lg">This playlist is completely empty</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Start discovering music and curate your perfect selection.
              </p>
            </div>
            {isPlaylistActive && (
              <Link
                to="/search"
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-125 text-white text-sm font-medium rounded-full transition-all shadow-lg flex items-center gap-2 active:scale-95"
              >
                <Plus size={16} /> Find songs to add
              </Link>
            )}
          </div>
        ) : (
          <div className={`w-full flex flex-col ${!isPlaylistActive ? "opacity-50 grayscale pointer-events-none" : ""}`}>
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-gray-800 text-[11px] tracking-widest text-gray-300">
              <div className="w-10 text-center">#</div>
              <div>Song</div>
              <div className="hidden md:block">Album</div>
              <div className="w-24 flex justify-end pr-3">
                <Clock size={14} className="text-gray-300 mr-12" />
              </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="playlist-tracks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="mt-2 space-y-0.5">
                    {playlist.tracks.map((track, index) => {
                      const playable = isPlaylistActive && isTrackPlayable(track);
                      return (
                        <Draggable
                          key={track.id.toString()}
                          draggableId={track.id.toString()}
                          index={index}
                          isDragDisabled={!playable}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-4 py-2.5 rounded-lg transition-all group ${
                                !playable ? "opacity-50 grayscale pointer-events-none" : ""
                              } ${
                                snapshot.isDragging && playable
                                  ? "bg-indigo-900/40 border border-indigo-500/30"
                                  : "hover:bg-gray-900"
                              }`}
                            >
                              <div className="w-10 flex items-center justify-center relative">
                                <span className="text-sm text-gray-400 group-hover:opacity-0 transition-opacity">
                                  {index + 1}
                                </span>
                                {playable && (
                                  <button
                                    onClick={() => onPlay(track, playlist.tracks)}
                                    className="absolute inset-0 m-auto w-7 h-7 bg-sky-300 text-white rounded-full items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 flex active:scale-95"
                                  >
                                    <Play size={12} fill="white" className="ml-0.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-4 min-w-0">
                                {playable && (
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical size={16} />
                                  </div>
                                )}
                                {!playable && <div className="w-6" />}
                                <div className="flex flex-col truncate">
                                  <span
                                    className={`text-white text-lg transition-colors truncate ${
                                      !playable ? "line-through text-gray-400" : ""
                                    }`}
                                  >
                                    {track.title}
                                  </span>
                                  <span className="text-sm text-gray-400 truncate">
                                    {track.artist}
                                  </span>
                                </div>
                              </div>

                              <div className="hidden md:flex items-center text-sm text-gray-400 truncate pr-4">
                                <span className="truncate">
                                  {track.album?.title || track.album?.name || "Single"}
                                </span>
                              </div>

                              <div className="w-24 flex items-center justify-end gap-4">
                                <span className="text-sm text-gray-400">
                                  {Math.floor(track.duration / 60)}:
                                  {String(track.duration % 60).padStart(2, "0")}
                                </span>
                                {playable && (
                                  <button
                                    onClick={() => handleRemoveTrack(track.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;