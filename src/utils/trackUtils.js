// src/utils/trackUtils.js

/**
 * Determina si una canción se puede reproducir
 * @param {Object} track - El objeto de la canción (debe contener status, album, etc.)
 * @param {Object} albumOverride - Opcional, si quieres pasar el álbum manualmente
 * @param {boolean} artistActiveOverride - Opcional, si quieres pasar el estado del artista manualmente
 * @returns {boolean}
 */
export const isTrackPlayable = (track, albumOverride = null, artistActiveOverride = null) => {
  // 1. Canción inactiva
  if (track.status === 'n' || track.status === 'inactive') return false;

  // 2. Álbum inactivo
  const album = albumOverride || track.album;
  if (album && (album.status === 'n' || album.status === 'inactive')) return false;

  // 3. Artista principal inactivo
  const artistActive = artistActiveOverride !== undefined 
    ? artistActiveOverride 
    : (album?.artist_active);
  if (artistActive === false) return false;

  return true;
};