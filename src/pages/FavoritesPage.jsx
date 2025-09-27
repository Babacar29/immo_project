import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Loader2, Home, MapPin, Bed, Bath, Square, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useProperties } from '@/hooks/useProperties';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchFavoriteIds = async () => {
      if (user) {
        setInitialLoading(true);
        const { data, error } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error fetching favorite ids", error);
          toast({ title: "Erreur", description: "Impossible de charger vos favoris.", variant: "destructive" });
        } else {
          setFavoriteIds(data.map(f => f.property_id));
        }
        setInitialLoading(false);
      }
  };

  useEffect(() => {
    fetchFavoriteIds();
  }, [user]);
  
  const { properties, loading: propertiesLoading, refetch } = useProperties({ initialFilters: { favorite_of: favoriteIds } });
  
  useEffect(() => {
    if (!initialLoading) {
      refetch({ favorite_of: favoriteIds });
    }
  }, [initialLoading, favoriteIds, refetch]);
  
  const loading = initialLoading || propertiesLoading;

  const handleRemoveFavorite = async (propertyId) => {
    const previousFavorites = [...favoriteIds];
    setFavoriteIds(favoriteIds.filter(id => id !== propertyId));

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);

    if (error) {
      setFavoriteIds(previousFavorites);
      toast({ title: "Erreur", description: "Impossible de supprimer le favori.", variant: "destructive" });
    } else {
      toast({ title: "Favori supprimé" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Mes Favoris - Nomad'immo</title>
        <meta name="description" content="Consultez et gérez vos propriétés favorites sur Nomad'immo." />
      </Helmet>
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Bouton de retour */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Button 
                variant="outline" 
                onClick={() => navigate('/properties')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Retourner sur la page des propriétés
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center space-x-3 mb-8"
            >
              <Heart className="w-8 h-8 text-destructive" />
              <h1 className="text-3xl font-bold text-foreground">
                Mes Favoris
              </h1>
            </motion.div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : properties.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <Card className="property-card overflow-hidden group bg-card h-full flex flex-col">
                        <div className="relative h-64">
                            <Link to={`/properties/${property.id}`}>
                            <img 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                alt={property.title}
                                src={property.main_image_url} />
                            </Link>
                            <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                            <span className="text-sm font-semibold text-foreground">
                                {new Intl.NumberFormat('fr-FR').format(property.price)} F CFA
                            </span>
                            </div>
                            <Button
                                onClick={() => handleRemoveFavorite(property.id)}
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 left-4"
                            >
                                <Heart className="w-4 h-4" />
                            </Button>
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
                                <Link to={`/properties/${property.id}`} className="w-full">
                                    <Button className="w-full hero-gradient text-primary-foreground">
                                        Voir les détails
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-card rounded-lg"
                >
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">Vous n'avez pas encore de favoris</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Parcourez nos propriétés et cliquez sur le cœur pour les enregistrer ici.</p>
                    <div className="mt-6">
                        <Link to="/properties">
                            <Button>
                                <Home className="mr-2 h-4 w-4" />
                                Découvrir les propriétés
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default FavoritesPage;