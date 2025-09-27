-- Script SQL pour ajouter le support des vidéos aux propriétés
-- Date: 2025-09-27
-- Fonctionnalité: Ajout d'URLs de vidéos externes (YouTube, Vimeo, etc.)

-- Ajouter la colonne video_url à la table properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.properties.video_url IS 'URL de la vidéo de présentation de la propriété (YouTube, Vimeo, etc.)';

-- Afficher la structure mise à jour de la table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'properties' 
ORDER BY ordinal_position;