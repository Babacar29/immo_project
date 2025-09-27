// Utilitaires pour la gestion des vidéos de propriétés
// Validation et manipulation des URLs vidéo

/**
 * Valide si une URL est une URL vidéo supportée
 * @param {string} url - L'URL à valider
 * @returns {boolean} - True si l'URL est valide et supportée
 */
export const isValidVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;
  
  // YouTube
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
  
  // Vimeo
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+(\?[\w=&]*)?$/;
  
  // Dailymotion
  const dailymotionRegex = /^(https?:\/\/)?(www\.)?dailymotion\.com\/video\/[\w-]+(\?[\w=&]*)?$/;
  
  // URL directe (MP4, WebM, OGG)
  const directVideoRegex = /^(https?:\/\/).+\.(mp4|webm|ogg)(\?[\w=&]*)?$/i;
  
  return youtubeRegex.test(trimmedUrl) || 
         vimeoRegex.test(trimmedUrl) || 
         dailymotionRegex.test(trimmedUrl) || 
         directVideoRegex.test(trimmedUrl);
};

/**
 * Extrait l'ID de la vidéo depuis l'URL
 * @param {string} url - L'URL de la vidéo
 * @returns {object} - Objet avec le type de plateforme et l'ID
 */
export const extractVideoInfo = (url) => {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      platform: 'youtube',
      id: youtubeMatch[1],
      thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
    };
  }
  
  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      platform: 'vimeo',
      id: vimeoMatch[1],
      thumbnail: null // Vimeo nécessite une API call pour le thumbnail
    };
  }
  
  // Dailymotion
  const dailymotionRegex = /(?:dailymotion\.com\/video\/)([a-zA-Z0-9]+)/;
  const dailymotionMatch = url.match(dailymotionRegex);
  if (dailymotionMatch) {
    return {
      platform: 'dailymotion',
      id: dailymotionMatch[1],
      thumbnail: `https://www.dailymotion.com/thumbnail/video/${dailymotionMatch[1]}`
    };
  }
  
  // URL directe
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return {
      platform: 'direct',
      id: url,
      thumbnail: null
    };
  }
  
  return null;
};

/**
 * Génère l'URL d'embed pour une vidéo
 * @param {string} url - L'URL originale de la vidéo
 * @returns {string|null} - L'URL d'embed ou null si non supportée
 */
export const getEmbedUrl = (url) => {
  const videoInfo = extractVideoInfo(url);
  if (!videoInfo) return null;
  
  switch (videoInfo.platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&rel=0&modestbranding=1`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoInfo.id}?autoplay=1&title=0&byline=0&portrait=0`;
    case 'dailymotion':
      return `https://www.dailymotion.com/embed/video/${videoInfo.id}?autoplay=1`;
    case 'direct':
      return videoInfo.id;
    default:
      return null;
  }
};