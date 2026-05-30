import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search as SearchIcon, Disc, Music, Loader2, Play, ShieldAlert, LogIn, UserPlus, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import TrackActions from '../components/TrackActions';

const Search = ({ onPlay }) => {
  const [query, setQuery] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar el menú desplegable de acciones
  const [activeTrackMenuId, setActiveTrackMenuId] = useState(null);

  // Estados para la paginación de tracks
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Referencia para controlar el scroll del carrusel de álbumes
  const albumsContainerRef = useRef(null);

  // Verificamos si existe un token activo en el navegador
  const token = localStorage.getItem('token');

  // Reiniciar a la página 1 cada vez que cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // Carga inicial de datos
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([api.get('/tracks'), api.get('/albums')])
      .then(([resTracks, resAlbums]) => {
        setAllTracks(resTracks.data.data || resTracks.data || []);
        setAllAlbums(resAlbums.data.data || resAlbums.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading search data:", err);
        setLoading(false);
      });
  }, [token]);

  // Función para desplazar el carrusel de álbumes de forma suave
  const scrollAlbums = (direction) => {
    if (albumsContainerRef.current) {
      // Desplaza el equivalente a unos 3 álbumes por clic (240px ancho + 20px gap)
      const scrollAmount = direction === 'left' ? -780 : 780;
      albumsContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // CASO SIN SESIÓN
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-4xl text-white">Access Restricted</h1>
        <p className="text-slate-400 max-w-md">
          You must have an account to search for your favorite artists, albums, and tracks.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-2">
          <Link
            to="/login"
            className="flex-1 bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-150 text-white text-sm py-3 rounded-full transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            Log In
          </Link>
          <Link
            to="/register"
            className="flex-1 bg-gradient-to-r from-indigo-500 to-sky-400 hover:brightness-150 text-white text-sm py-3 rounded-full transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-indigo-500">
      <Loader2 className="animate-spin" size={48} />
    </div>
  );

  // --- LÓGICA DE FILTRADO ---
  const cleanQuery = query.toLowerCase().trim();

  const filteredTracks = cleanQuery 
    ? allTracks.filter(t => t.title.toLowerCase().includes(cleanQuery) || t.artist?.toLowerCase().includes(cleanQuery))
    : [];

  const filteredAlbums = cleanQuery
    ? allAlbums.filter(a => (a.name || a.title || '').toLowerCase().includes(cleanQuery))
    : [];

  const artistMap = {};
  allAlbums.forEach(album => {
    const name = album.artist || album.artists?.[0]?.name;
    if (name && !artistMap[name] && album.cover) {
      artistMap[name] = album.cover.startsWith('http') ? album.cover : `http://musisense.test/storage/${album.cover}`;
    }
  });

  const filteredArtists = cleanQuery
    ? Object.entries(artistMap)
        .filter(([name]) => name.toLowerCase().includes(cleanQuery))
        .map(([name, cover]) => ({ name, cover }))
    : [];

  const hasResults = filteredArtists.length > 0 || filteredAlbums.length > 0 || filteredTracks.length > 0;

  // --- LÓGICA DE PAGINACIÓN DE CANCIONES ---
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const indexOfLastTrack = currentPage * itemsPerPage;
  const indexOfFirstTrack = indexOfLastTrack - itemsPerPage;
  const currentTracks = filteredTracks.slice(indexOfFirstTrack, indexOfLastTrack);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Barra de búsqueda */}
      <div className="relative max-w-xl mx-auto">
        <SearchIcon className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search artists, albums, or tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-200 border-2 border-sky-300 text-gray-900 pl-12 pr-4 py-3 rounded-full focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-400 text-sm shadow-inner"
        />
      </div>

      {query && !hasResults && (
        <p className="text-center text-slate-400 py-12">No results found for "{query}"</p>
      )}

      {hasResults && (
        <div className="space-y-12">
          
          {/* ARTISTS */}
          {filteredArtists.length > 0 && (
            <section className="w-full text-center">
              <h2 className="text-xl text-white text-left mb-6">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 justify-center justify-items-center max-w-5xl mx-auto">
                {filteredArtists.map(artist => (
                  <Link 
                    key={artist.name} 
                    to={`/artist/${encodeURIComponent(artist.name)}`}
                    className="flex flex-col items-center gap-4 group cursor-pointer w-full max-w-[160px]"
                  >
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden group-hover:scale-110 shadow-xl">
                      <img src={artist.cover} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500" />
                    </div>
                    <span className="text-sm text-white">{artist.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ALBUMS (Carrusel con botones de navegación superior y sin barra visual) */}
          {filteredAlbums.length > 0 && (
            <section className="space-y-4 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-white">Albums</h2>
                
                {/* Controles de flechas limpias al estilo de navegación global */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollAlbums('left')}
                    className="p-2 text-gray-400 hover:text-white transition-colors active:scale-90"
                    title="Scroll left"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollAlbums('right')}
                    className="p-2 text-gray-400 hover:text-white transition-colors active:scale-90"
                    title="Scroll right"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
              
              {/* Contenedor con scroll ocultado estéticamente usando clases de Tailwind */}
              <div 
                ref={albumsContainerRef}
                className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {filteredAlbums.map(album => {
                  const coverUrl = album.cover 
                    ? (album.cover.startsWith('http') ? album.cover : `http://musisense.test/storage/${album.cover}`)
                    : null;
                  
                  return (
                    <Link
                      key={album.id}
                      to={`/album/${album.id}`}
                      className="w-60 p-3 rounded-xl flex-shrink-0 transition-all group"
                    >
                      <div className="w-full aspect-square overflow-hidden mb-3 relative shadow-md rounded-lg">
                        {coverUrl ? (
                          <img 
                            src={coverUrl} 
                            alt={album.name || album.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
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
                            : album.artist || "Artista"}
                        </p>
                        <p className="text-sm text-gray-300">
                          {album.year || album.release_year || "N/A"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* TRACKS */}
          {filteredTracks.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-white">Tracks</h2>
                {totalPages > 1 && (
                  <span className="text-xs text-gray-400 font-light">
                    Showing {indexOfFirstTrack + 1}-{Math.min(indexOfLastTrack, filteredTracks.length)} of {filteredTracks.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {currentTracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-xl hover:brightness-110 transition-all group px-4 shadow-md border border-slate-800/40"
                  >
                    <div 
                      className="flex items-center gap-5 flex-1 cursor-pointer truncate" 
                      onClick={() => onPlay(track, filteredTracks)}
                    >
                      <div className="w-12 h-12 rounded flex items-center justify-center overflow-hidden shadow-md transition-all relative shrink-0">
                        {track.album?.cover ? (
                          <img 
                            src={track.album.cover.startsWith('http') ? track.album.cover : `http://musisense.test/storage/${track.album.cover}`} 
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
                        <span className="text-white text-sm font-medium group-hover:text-sky-300 transition-colors truncate">
                          {track.title}
                        </span>
                        <Link 
                          to={`/artist/${encodeURIComponent(track.artist)}`} 
                          className="text-xs text-gray-400 group-hover:text-slate-300 hover:underline transition-colors truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {track.artist}
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <span className="hidden md:block text-xs text-gray-300">
                        {Math.floor(track.duration / 60)}:
                        {String(track.duration % 60).padStart(2, "0")}
                      </span>

                      <TrackActions 
                        track={track} 
                        isOpen={activeTrackMenuId === track.id}
                        setIsOpen={(open) => setActiveTrackMenuId(open ? track.id : null)}
                        isLastItem={index >= currentTracks.length - 2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* COMPONENTE DE PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-indigo-500 to-sky-400 text-white shadow-md scale-105'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </section>
          )}

        </div>
      )}
    </div>
  );
};

export default Search;