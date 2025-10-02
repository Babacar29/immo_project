import { toast } from '@/components/ui/use-toast';

// Configuration Cloudinary
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = 'nomadimmo_videos'; // À créer dans votre dashboard Cloudinary

/**
 * Upload une vidéo vers Cloudinary avec gestion avancée des timeouts et retry
 * @param {File} file - Le fichier vidéo à uploader
 * @param {function} onProgress - Callback pour le progrès d'upload (optionnel)
 * @param {number} retryCount - Nombre de tentatives restantes
 * @returns {Promise<Object>} - Objet avec l'URL de la vidéo et autres métadonnées
 */
export const uploadVideoToCloudinary = async (file, onProgress = null, retryCount = 2) => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Configuration Cloudinary manquante. Vérifiez vos variables d\'environnement.');
  }

  // Validation du fichier
  const maxSize = 200 * 1024 * 1024; // Augmenté à 200 MB pour vidéos plus longues
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/mov'];
  
  if (file.size > maxSize) {
    throw new Error('Le fichier est trop volumineux. Taille maximale : 200 MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format de fichier non supporté. Formats acceptés : MP4, WebM, MOV, AVI');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('resource_type', 'video');
  
  // Pour unsigned upload, les transformations doivent être configurées dans l'upload preset
  // Pas de paramètres de transformation ici

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Timeout très long pour les vidéos longues (10 minutes)
    xhr.timeout = 10 * 60 * 1000; // 10 minutes en millisecondes
    
    // Gestion du progrès d'upload
    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });
    }
    
    // Gestion de la réponse réussie
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            thumbnail: result.secure_url.replace(/\.[^/.]+$/, '.jpg'), // Auto-thumbnail
          });
        } catch (parseError) {
          console.error('Erreur parsing réponse Cloudinary:', parseError);
          reject(new Error('Erreur de traitement de la réponse du serveur'));
        }
      } else {
        console.error('Erreur HTTP:', xhr.status, xhr.responseText);
        reject(new Error(`Erreur d'upload: ${xhr.status} - ${xhr.statusText}`));
      }
    });
    
    // Gestion des erreurs
    xhr.addEventListener('error', async () => {
      console.error('Erreur réseau lors de l\'upload');
      
      // Tentative de retry si il en reste
      if (retryCount > 0) {
        console.log(`Tentative de retry... (${retryCount} restantes)`);
        try {
          // Attendre 2 secondes avant retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          const result = await uploadVideoToCloudinary(file, onProgress, retryCount - 1);
          resolve(result);
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(new Error('Erreur de connexion lors de l\'upload. Vérifiez votre connexion internet.'));
      }
    });
    
    // Gestion du timeout
    xhr.addEventListener('timeout', async () => {
      console.error('Timeout lors de l\'upload');
      
      // Tentative de retry si il en reste
      if (retryCount > 0) {
        console.log(`Timeout - Tentative de retry... (${retryCount} restantes)`);
        try {
          // Attendre 3 secondes avant retry
          await new Promise(resolve => setTimeout(resolve, 3000));
          const result = await uploadVideoToCloudinary(file, onProgress, retryCount - 1);
          resolve(result);
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(new Error('Timeout lors de l\'upload. La vidéo est peut-être trop volumineuse ou votre connexion trop lente.'));
      }
    });
    
    // Gestion de l'abandon
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload annulé'));
    });
    
    // Démarrer l'upload
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);
    xhr.send(formData);
  });
};

/**
 * Génère une URL de thumbnail pour une vidéo Cloudinary
 * @param {string} publicId - L'ID public de la vidéo sur Cloudinary
 * @param {Object} options - Options de transformation
 * @returns {string} - URL du thumbnail
 */
export const getVideoThumbnail = (publicId, options = {}) => {
  const { width = 400, height = 300, quality = 'auto' } = options;
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/c_scale,w_${width},h_${height},q_${quality}/${publicId}.jpg`;
};

/**
 * Génère différentes qualités d'une vidéo
 * @param {string} publicId - L'ID public de la vidéo
 * @returns {Object} - URLs pour différentes qualités
 */
export const getVideoVariants = (publicId) => {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;
  
  return {
    // Qualité originale
    original: `${baseUrl}/${publicId}`,
    
    // HD (720p)
    hd: `${baseUrl}/c_scale,w_1280,h_720,q_auto:good/${publicId}`,
    
    // SD (480p)
    sd: `${baseUrl}/c_scale,w_854,h_480,q_auto:good/${publicId}`,
    
    // Mobile (360p)
    mobile: `${baseUrl}/c_scale,w_640,h_360,q_auto:eco/${publicId}`,
    
    // Thumbnail
    thumbnail: `${baseUrl}/c_scale,w_400,h_300,q_auto/${publicId}.jpg`
  };
};

/**
 * Supprime une vidéo de Cloudinary
 * @param {string} publicId - L'ID public de la vidéo à supprimer
 * @returns {Promise<boolean>} - True si suppression réussie
 */
export const deleteVideoFromCloudinary = async (publicId) => {
  // Note: Cette fonction nécessite un appel backend pour des raisons de sécurité
  // L'API secret ne doit pas être exposée côté client
  
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erreur suppression vidéo:', error);
    return false;
  }
};