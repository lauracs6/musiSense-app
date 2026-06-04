/**
 * Determina si una canción se puede reproducir
 * @param {Object} track - El objeto de la canción (debe contener status, album, ...)
 * @param {Object} albumOverride - Opcional
 * @param {boolean} artistActiveOverride - Opcional
 * @returns {boolean}
 */
export const isTrackPlayable = (track, albumOverride = null, artistActiveOverride = null) => {
  // Canción inactiva
  if (track.status === 'n' || track.status === 'inactive') return false;

  // Álbum inactivo
  const album = albumOverride || track.album;
  if (album && (album.status === 'n' || album.status === 'inactive')) return false;

  // Artista principal inactivo
  const artistActive = artistActiveOverride !== undefined 
    ? artistActiveOverride 
    : (album?.artist_active);
  if (artistActive === false) return false;

  return true;
};