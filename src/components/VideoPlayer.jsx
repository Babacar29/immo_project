import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const VideoPlayer = ({ videoUrl, isOpen, onClose, propertyTitle }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour convertir l'URL en URL d'embed
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`;
    }

    // Dailymotion
    const dailymotionRegex = /(?:dailymotion\.com\/video\/)([a-zA-Z0-9]+)/;
    const dailymotionMatch = url.match(dailymotionRegex);
    if (dailymotionMatch) {
      return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}?autoplay=1`;
    }

    // URL directe (MP4, etc.)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }

    return null;
  };

  // Fonction pour détecter le type de plateforme
  const getPlatformName = (url) => {
    if (!url) return 'Vidéo';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('vimeo.com')) return 'Vimeo';
    if (url.includes('dailymotion.com')) return 'Dailymotion';
    return 'Vidéo';
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const platformName = getPlatformName(videoUrl);
  const isDirectVideo = videoUrl && videoUrl.match(/\.(mp4|webm|ogg)$/i);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const openExternalLink = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full p-0 bg-black border-0">
        <div className="relative">
          {/* Header avec titre et boutons */}
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <DialogTitle className="text-lg font-semibold truncate pr-4">
                {propertyTitle ? `Vidéo - ${propertyTitle}` : `Vidéo ${platformName}`}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {videoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openExternalLink}
                    className="text-white hover:bg-white/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Contenu vidéo */}
          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
            {embedUrl ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                    />
                  </div>
                )}
                
                {isDirectVideo ? (
                  <video
                    src={embedUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                    onLoadedData={handleLoad}
                    onError={() => setIsLoading(false)}
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                ) : (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={handleLoad}
                    onError={() => setIsLoading(false)}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <X className="w-16 h-16 mb-4 text-red-500" />
                <h3 className="text-xl font-semibold mb-2">Vidéo non disponible</h3>
                <p className="text-gray-300 text-center max-w-md">
                  L'URL de la vidéo n'est pas valide ou la plateforme n'est pas supportée.
                </p>
                {videoUrl && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={openExternalLink}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ouvrir le lien original
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Composant bouton pour déclencher la lecture vidéo
export const VideoPlayButton = ({ videoUrl, propertyTitle, className = '' }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  if (!videoUrl) return null;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsVideoOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Play className="w-4 h-4" />
        Voir la vidéo
      </Button>
      
      <VideoPlayer
        videoUrl={videoUrl}
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        propertyTitle={propertyTitle}
      />
    </>
  );
};

export default VideoPlayer;