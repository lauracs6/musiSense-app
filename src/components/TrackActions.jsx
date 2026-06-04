import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MoreVertical, Plus, ListMusic, CheckCircle2, Loader2, FolderPlus } from 'lucide-react';

const TrackActions = ({ track, isOpen, setIsOpen, isLastItem }) => {
  const [playlists, setPlaylists] = useState([]);
  const [addedStatus, setAddedStatus] = useState(null); 
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/playlists')
        .then(res => setPlaylists(res.data.data || res.data || []))
        .catch(err => console.error("Error fetching playlists", err));
    }
  }, [isOpen]);

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/tracks`, { track_id: track.id });
      setAddedStatus(playlistId);
      setTimeout(() => {
        setAddedStatus(null);
        setIsOpen(false); 
      }, 1500);
    } catch (err) {
      console.error("Error adding track to playlist", err);
    }
  };

  const handleFastCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.post('/playlists', {
        name: newPlaylistName.trim(),
        status: 'y'
      });

      const freshPlaylist = res.data?.playlist || res.data?.data || res.data;

      if (freshPlaylist && freshPlaylist.id) {
        await api.post(`/playlists/${freshPlaylist.id}/tracks`, { track_id: track.id });
        
        setPlaylists(prev => [...prev, freshPlaylist]);
        setAddedStatus(freshPlaylist.id);
        setNewPlaylistName('');

        window.dispatchEvent(new Event('playlist-created'));

        setTimeout(() => {
          setAddedStatus(null);
          setIsOpen(false); 
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating and adding to playlist", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation(); 
          setIsOpen(!isOpen);
        }}
        className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (        
        <div className={`absolute right-0 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] animate-in zoom-in-95 duration-100 flex flex-col max-h-80 ${
          isLastItem ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
          
          {/* Header */}
          <div className="p-3 border-b border-slate-800">
            <p className="text-[10px]  text-slate-400 uppercase tracking-widest px-2">Add to Playlist</p>
          </div>
          
          {/* Playlists available */}
          <div className="flex-1 overflow-y-auto p-1 no-scrollbar max-h-44 border-b border-slate-800/60">
            {playlists.length > 0 ? (
              playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => addToPlaylist(pl.id)}
                  disabled={addedStatus !== null}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors group disabled:pointer-events-none"
                >
                  <div className="flex items-center gap-3 truncate">
                    <ListMusic size={16} className="text-slate-500 group-hover:text-indigo-200" />
                    <span className="truncate">{pl.name}</span>
                  </div>
                  {addedStatus === pl.id ? (
                    <CheckCircle2 size={16} className="text-green-400" />
                  ) : (
                    <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-500 text-center">No playlists found</div>
            )}
          </div>

          {/* Form */}
          <div className="p-2.5 bg-slate-950/40 rounded-b-xl">
            <form onSubmit={handleFastCreateAndAdd} className="space-y-1.5">
              <input
                type="text"
                required
                disabled={isCreating || addedStatus !== null}
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Create new playlist..."
                className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500/50 placeholder-slate-600 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isCreating || !newPlaylistName.trim() || addedStatus !== null}
                className="w-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white disabled:bg-slate-900 disabled:text-slate-600 text-[10px]  py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                {isCreating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <FolderPlus size={12} />
                    Create & Add
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default TrackActions;