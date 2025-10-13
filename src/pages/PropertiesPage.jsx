import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Loader2, ArrowLeft, X, Euro, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { useDebounce } from '@/hooks/useDebounce';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { VideoPlayButton } from '@/components/VideoPlayer';

const PropertiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialiser les filtres depuis les paramètres URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get('type') || 'all');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // États pour les filtres avancés
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: '',
    minArea: '',
    maxArea: '',
    status: 'all',
    location: ''
  });

  const { properties, loading, refetch } = useProperties();
  const [favorites, setFavorites] = useState(new Set());

  const refetchPropertiesAndFavorites = useCallback(() => {
    // Combiner tous les filtres pour la requête
    const combinedFilters = {
      type: selectedFilter,
      searchTerm: debouncedSearchTerm,
      ...advancedFilters
    };
    refetch(combinedFilters);
  }, [selectedFilter, debouncedSearchTerm, advancedFilters, refetch]);
  
  useEffect(() => {
    refetchPropertiesAndFavorites();
  }, [refetchPropertiesAndFavorites]);
  
  useEffect(() => {
    setFavorites(new Set(properties.filter(p => p.is_favorited).map(p => p.id)));
  }, [properties]);


  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'villa', label: 'Villas' },
    { id: 'apartment', label: 'Appartements' },
    { id: 'house', label: 'Maisons' },
    { id: 'penthouse', label: 'Penthouses' },
    { id: 'riad', label: 'Riads' },
    { id: 'chalet', label: 'Chalets' },
  ];

  const handleFavoriteToggle = async (propertyId, isFavorited) => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Vous devez être connecté pour gérer vos favoris.", variant: "destructive"});
      navigate('/login');
      return;
    }
    
    // Optimistic UI update
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);

    if (isFavorited) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
      if (error) {
        toast({ title: "Erreur", description: "Impossible de supprimer le favori.", variant: "destructive"});
        newFavorites.add(propertyId); // Revert
        setFavorites(newFavorites);
      } else {
        toast({ title: "Favori supprimé", description: "La propriété a été retirée de vos favoris."});
      }
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId });
      if (error) {
        toast({ title: "Erreur", description: "Impossible d'ajouter le favori.", variant: "destructive"});
        newFavorites.delete(propertyId); // Revert
        setFavorites(newFavorites);
      } else {
        toast({ title: "Favori ajouté", description: "La propriété a été ajoutée à vos favoris."});
      }
    }
  };


  // Fonctions pour gérer les filtres avancés
  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minArea: '',
      maxArea: '',
      status: 'all',
      location: ''
    });
  };

  const applyAdvancedFilters = () => {
    setShowAdvancedFilters(false);
    // Le refetch sera automatiquement déclenché par le useEffect qui observe advancedFilters
  };

  const updateAdvancedFilter = (key, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Vérifier si des filtres avancés sont actifs
  const hasActiveAdvancedFilters = () => {
    return Object.entries(advancedFilters).some(([key, value]) => {
      if (key === 'status') return value !== 'all';
      return value !== '';
    });
  };

  // Compter le nombre de filtres actifs
  const getActiveFiltersCount = () => {
    return Object.entries(advancedFilters).filter(([key, value]) => {
      if (key === 'status') return value !== 'all';
      return value !== '';
    }).length;
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Nos propriétés à travers le monde
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explorez une collection unique de biens d'exception, où que vos rêves vous mènent.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 p-6 bg-card rounded-lg shadow"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Rechercher par pays, ville, type de bien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <DialogTrigger asChild>
                  <Button 
                    variant={hasActiveAdvancedFilters() ? "default" : "outline"} 
                    className={`flex items-center relative ${hasActiveAdvancedFilters() ? "hero-gradient text-primary-foreground" : ""}`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres avancés
                    {hasActiveAdvancedFilters() && (
                      <span className="ml-2 bg-primary-foreground text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtres avancés
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid gap-6 py-4">
                    {/* Section Prix */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Prix</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minPrice">Prix minimum (F CFA)</Label>
                          <Input
                            id="minPrice"
                            type="number"
                            placeholder="Ex: 50000000"
                            value={advancedFilters.minPrice}
                            onChange={(e) => updateAdvancedFilter('minPrice', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxPrice">Prix maximum (F CFA)</Label>
                          <Input
                            id="maxPrice"
                            type="number"
                            placeholder="Ex: 200000000"
                            value={advancedFilters.maxPrice}
                            onChange={(e) => updateAdvancedFilter('maxPrice', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section Chambres et Salles de bain */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Chambres et Salles de bain</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minBedrooms">Chambres min</Label>
                          <Input
                            id="minBedrooms"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={advancedFilters.minBedrooms}
                            onChange={(e) => updateAdvancedFilter('minBedrooms', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxBedrooms">Chambres max</Label>
                          <Input
                            id="maxBedrooms"
                            type="number"
                            min="0"
                            placeholder="10+"
                            value={advancedFilters.maxBedrooms}
                            onChange={(e) => updateAdvancedFilter('maxBedrooms', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minBathrooms">SDB min</Label>
                          <Input
                            id="minBathrooms"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={advancedFilters.minBathrooms}
                            onChange={(e) => updateAdvancedFilter('minBathrooms', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxBathrooms">SDB max</Label>
                          <Input
                            id="maxBathrooms"
                            type="number"
                            min="0"
                            placeholder="5+"
                            value={advancedFilters.maxBathrooms}
                            onChange={(e) => updateAdvancedFilter('maxBathrooms', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section Surface */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Surface</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minArea">Surface minimum (m²)</Label>
                          <Input
                            id="minArea"
                            type="number"
                            placeholder="Ex: 50"
                            value={advancedFilters.minArea}
                            onChange={(e) => updateAdvancedFilter('minArea', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxArea">Surface maximum (m²)</Label>
                          <Input
                            id="maxArea"
                            type="number"
                            placeholder="Ex: 300"
                            value={advancedFilters.maxArea}
                            onChange={(e) => updateAdvancedFilter('maxArea', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section Statut et Localisation */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Statut et Localisation</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Statut</Label>
                          <Select value={advancedFilters.status} onValueChange={(value) => updateAdvancedFilter('status', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="for_sale">À vendre</SelectItem>
                              <SelectItem value="for_rent">À louer</SelectItem>
                              <SelectItem value="coming_soon">Bientôt disponible</SelectItem>
                              <SelectItem value="off_plan">Sur plan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Localisation spécifique</Label>
                          <Input
                            id="location"
                            placeholder="Ex: Paris, Lyon, Marseille..."
                            value={advancedFilters.location}
                            onChange={(e) => updateAdvancedFilter('location', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={resetAdvancedFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Réinitialiser
                    </Button>
                    <Button
                      onClick={applyAdvancedFilters}
                      className="flex items-center gap-2 hero-gradient"
                    >
                      <Search className="w-4 h-4" />
                      Appliquer les filtres
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={selectedFilter === filter.id ? "hero-gradient text-primary-foreground" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Indicateur de résultats et filtres actifs */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-lg font-semibold text-foreground">
                  {properties.length}
                </span>
                <span>
                  propriété{properties.length > 1 ? 's' : ''} trouvée{properties.length > 1 ? 's' : ''}
                </span>
                {(searchTerm || hasActiveAdvancedFilters()) && (
                  <span className="text-sm">
                    avec les filtres appliqués
                  </span>
                )}
              </div>
              
              {(searchTerm || hasActiveAdvancedFilters()) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    resetAdvancedFilters();
                    setSelectedFilter('all');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Effacer tous les filtres
                </Button>
              )}
            </motion.div>
          )}
          
          {loading ? (
             <div className="flex justify-center items-center h-96">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => {
                  const isFavorited = favorites.has(property.id);
                  return (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Card className="property-card overflow-hidden group bg-card h-full flex flex-col">
                        <div className="relative h-64">
                          <Link to={`/properties/${property.id}`}>
                            <img 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              alt={property.title}
                              src={property.main_image_url} />
                          </Link>
                          <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-md">
                            <div className="text-sm font-semibold text-foreground">
                              <div className="flex items-center gap-1">
                                <span>{new Intl.NumberFormat('fr-FR').format(property.price)} F CFA</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ~ {new Intl.NumberFormat('fr-FR').format(Math.round(property.price / 655.957))} €
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                            {property.is_exclusive && (
                              <Badge className="bg-primary text-primary-foreground shadow-md">Exclusif</Badge>
                            )}
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleFavoriteToggle(property.id, isFavorited)}
                              className="bg-card/80 backdrop-blur-sm shadow-md hover:bg-accent transition-colors w-9 h-9 p-0"
                            >
                              <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-foreground/70'}`} />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-6 flex-grow flex flex-col">
                          <h3 className="text-xl font-semibold text-foreground mb-2 truncate">
                            <Link to={`/properties/${property.id}`} className="hover:text-primary transition-colors">{property.title}</Link>
                          </h3>
                          <div className="flex items-center text-muted-foreground mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{property.location}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mb-6">
                            <div className="flex items-center"><Bed className="w-4 h-4 mr-1" /><span>{property.bedrooms}</span></div>
                            <div className="flex items-center"><Bath className="w-4 h-4 mr-1" /><span>{property.bathrooms}</span></div>
                            <div className="flex items-center"><Square className="w-4 h-4 mr-1" /><span>{property.area} m²</span></div>
                          </div>
                          <div className="mt-auto">
                            <div className="space-y-2 min-h-[5rem] flex flex-col justify-end">
                              {property.video_url && (
                                <VideoPlayButton 
                                  videoUrl={property.video_url} 
                                  propertyTitle={property.title}
                                  className="w-full"
                                />
                              )}
                              <Link to={`/properties/${property.id}`} className="w-full">
                                <Button className="w-full hero-gradient text-primary-foreground">
                                  Voir les détails
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {properties.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground text-lg">
                    Aucune propriété ne correspond à vos critères de recherche.
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertiesPage;