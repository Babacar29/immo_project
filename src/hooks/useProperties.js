import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useProperties = ({ initialFilters = {} } = {}) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    try {
      let favoriteIds = [];
      if (user) {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', user.id);
        if (favoritesError) console.error("Error fetching favorites:", favoritesError);
        else favoriteIds = favoritesData.map(f => f.property_id);
      }

      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (
            image_url,
            is_primary
          ),
          profiles (
            full_name,
            avatar_url
          )
        `);

      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }
      if (filters.isExclusive !== undefined) {
        query = query.eq('is_exclusive', filters.isExclusive);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      // Filtres de prix
      if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
        query = query.gte('price', parseFloat(filters.minPrice));
      }
      if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
        query = query.lte('price', parseFloat(filters.maxPrice));
      }
      
      // Filtres de chambres
      if (filters.minBedrooms && !isNaN(parseInt(filters.minBedrooms))) {
        query = query.gte('bedrooms', parseInt(filters.minBedrooms));
      }
      if (filters.maxBedrooms && !isNaN(parseInt(filters.maxBedrooms))) {
        query = query.lte('bedrooms', parseInt(filters.maxBedrooms));
      }
      
      // Filtres de salles de bain
      if (filters.minBathrooms && !isNaN(parseInt(filters.minBathrooms))) {
        query = query.gte('bathrooms', parseInt(filters.minBathrooms));
      }
      if (filters.maxBathrooms && !isNaN(parseInt(filters.maxBathrooms))) {
        query = query.lte('bathrooms', parseInt(filters.maxBathrooms));
      }
      
      // Filtres de surface
      if (filters.minArea && !isNaN(parseInt(filters.minArea))) {
        query = query.gte('area', parseInt(filters.minArea));
      }
      if (filters.maxArea && !isNaN(parseInt(filters.maxArea))) {
        query = query.lte('area', parseInt(filters.maxArea));
      }
      
      // Filtre de statut
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Filtre de localisation spécifique (en plus de la recherche globale)
      if (filters.location && filters.location.trim()) {
        query = query.ilike('location', `%${filters.location.trim()}%`);
      }
      
      // Hide sold properties by default unless explicitly overridden
      const hideSold = filters.hideSold !== undefined ? filters.hideSold : true;
      if (hideSold && (!filters.status || filters.status === 'all')) {
        query = query.neq('status', 'sold');
      }
      
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,location.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.favorite_of && filters.favorite_of.length > 0) {
        query = query.in('id', filters.favorite_of);
      } else if (filters.favorite_of) {
        setProperties([]);
        setLoading(false);
        return;
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const propertiesWithImagesAndFavorites = data.map(p => {
        const primaryImage = p.property_images.find(img => img.is_primary);
        const fallbackImage = p.property_images[0];
        return {
          ...p,
          main_image_url: primaryImage?.image_url || fallbackImage?.image_url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop',
          agent_name: p.profiles?.full_name || 'Agent non spécifié',
          is_favorited: favoriteIds.includes(p.id)
        };
      });

      setProperties(propertiesWithImagesAndFavorites);

    } catch (err) {
      console.error("Erreur de chargement des propriétés:", JSON.stringify(err, null, 2));
      setError(err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de récupérer les propriétés. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (initialFilters) {
        fetchProperties(initialFilters);
    }
  }, [fetchProperties, JSON.stringify(initialFilters), user]);

  return { properties, loading, error, refetch: fetchProperties };
};