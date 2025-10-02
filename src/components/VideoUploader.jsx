import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Video, X, Check, AlertCircle, Play } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { uploadVideoToCloudinary } from '@/lib/cloudinaryService';
import { VideoPlayButton } from '@/components/VideoPlayer';

const VideoUploader = ({ onVideoUploaded, currentVideoUrl = null, disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(currentVideoUrl ? { url: currentVideoUrl } : null);
  const fileInputRef = useRef(null);

  // Gestion du drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoUpload(e.target.files[0]);
    }
  };

  const handleVideoUpload = async (file) => {
    if (disabled) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Toast de début d'upload pour les vidéos longues
    const durationMinutes = Math.round(file.size / (1024 * 1024)); // Estimation très approximative
    if (file.size > 50 * 1024 * 1024) { // Plus de 50MB
      toast({
        title: "📤 Upload en cours...",
        description: `Vidéo volumineuse détectée. L'upload peut prendre plusieurs minutes.`,
      });
    }

    try {
      // Utiliser le vrai callback de progrès de Cloudinary
      const result = await uploadVideoToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });
      
      const videoData = {
        url: result.url,
        publicId: result.publicId,
        duration: result.duration,
        thumbnail: result.thumbnail,
        size: result.bytes,
        format: result.format
      };
      
      setUploadedVideo(videoData);
      onVideoUploaded(videoData);
      
      toast({
        title: "✅ Vidéo uploadée avec succès !",
        description: `Durée: ${Math.round(result.duration)}s • Taille: ${(result.bytes / (1024 * 1024)).toFixed(1)}MB`,
      });

    } catch (error) {
      console.error('Erreur upload:', error);
      
      let errorMessage = error.message || "Impossible d'uploader la vidéo";
      let errorTitle = "❌ Erreur d'upload";
      
      // Messages d'erreur plus spécifiques
      if (error.message.includes('Timeout')) {
        errorTitle = "⏱️ Timeout d'upload";
        errorMessage = "L'upload a pris trop de temps. Essayez avec une vidéo plus courte ou vérifiez votre connexion.";
      } else if (error.message.includes('connexion')) {
        errorTitle = "🌐 Problème de connexion";
        errorMessage = "Vérifiez votre connexion internet et réessayez.";
      } else if (error.message.includes('trop volumineux')) {
        errorTitle = "📁 Fichier trop volumineux";
        errorMessage = "Réduisez la taille de votre vidéo ou utilisez un format plus compressé.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeVideo = () => {
    setUploadedVideo(null);
    onVideoUploaded(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!uploadedVideo ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : isUploading 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-muted-foreground/25 hover:border-primary/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {isUploading ? (
              <>
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-orange-200 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-orange-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Upload en cours...
                </h3>
                <Progress value={uploadProgress} className="w-full max-w-xs mb-2" />
                <p className="text-sm text-muted-foreground">
                  {uploadProgress}% • Optimisation automatique en cours
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {dragActive ? 'Déposez votre vidéo ici' : 'Uploadez une vidéo'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Formats supportés: MP4, WebM, MOV, AVI</p>
                  <p>Taille maximale: 100 MB</p>
                  <p>Optimisation automatique incluse</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Vidéo prête</h4>
                  <p className="text-sm text-green-600">
                    Hébergée sur Cloudinary • Optimisée automatiquement
                  </p>
                  {uploadedVideo.duration && (
                    <p className="text-xs text-green-500 mt-1">
                      Durée: {Math.round(uploadedVideo.duration)}s
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <VideoPlayButton 
                  videoUrl={uploadedVideo.url} 
                  propertyTitle="Aperçu vidéo"
                  className="text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeVideo}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Information sur Cloudinary */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-3 h-3" />
          <span className="font-medium">Hébergement Cloudinary</span>
        </div>
        <p>Vos vidéos sont hébergées gratuitement sur Cloudinary avec optimisation automatique et CDN mondial pour une lecture rapide partout dans le monde.</p>
      </div>
    </div>
  );
};

export default VideoUploader;