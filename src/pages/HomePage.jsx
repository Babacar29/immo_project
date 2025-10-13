import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Home, Building, Key, Users, Bed, Bath, Square, Loader2, Star, Award, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { useProperties } from '@/hooks/useProperties';
import ChatWidget from '@/components/ChatWidget';
import VideoPlayer from '@/components/VideoPlayer';

const PropertyList = ({ properties, loading }) => {
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const handleVideoPlay = (videoUrl) => {
    setSelectedVideoUrl(videoUrl);
    setIsVideoPlayerOpen(true);
  };

  const handleVideoClose = () => {
    setIsVideoPlayerOpen(false);
    setSelectedVideoUrl(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <Card className="property-card overflow-hidden bg-card h-full flex flex-col">
              <div className="relative h-64">
                <Link to={`/properties/${property.id}`}>
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    alt={property.title}
                    src={property.main_image_url} />
                </Link>
                {property.is_exclusive && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground shadow-md">Exclusif</Badge>
                  </div>
                )}
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
                  <div className="flex items-center"><Bed className="w-4 h-4 mr-1"/><span>{property.bedrooms}</span></div>
                  <div className="flex items-center"><Bath className="w-4 h-4 mr-1"/><span>{property.bathrooms}</span></div>
                  <div className="flex items-center"><Square className="w-4 h-4 mr-1"/><span>{property.area} m²</span></div>
                </div>
                <div className="mt-auto">
                  <div className="space-y-2 min-h-[5rem] flex flex-col justify-end">
                    {property.video_url && (
                      <Button 
                        onClick={() => handleVideoPlay(property.video_url)}
                        variant="outline"
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Voir la vidéo
                      </Button>
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
        ))}
      </div>
      
      {/* Modal vidéo */}
      <VideoPlayer 
        videoUrl={selectedVideoUrl}
        isOpen={isVideoPlayerOpen}
        onClose={handleVideoClose}
      />
    </>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Créer les paramètres de recherche
    const searchParams = new URLSearchParams();
    
    if (searchTerm.trim()) {
      searchParams.set('search', searchTerm.trim());
    }
    
    if (propertyType !== 'all') {
      searchParams.set('type', propertyType);
    }
    
    // Naviguer vers la page des propriétés avec les filtres
    const queryString = searchParams.toString();
    navigate(`/properties${queryString ? `?${queryString}` : ''}`);
  };

  const { properties: featuredProperties, loading: featuredLoading } = useProperties({ 
    initialFilters: { isFeatured: true, limit: 6 }
  });

  const { properties: exclusiveProperties, loading: exclusiveLoading } = useProperties({ 
    initialFilters: { isExclusive: true, limit: 6 }
  });

  const services = [
    { icon: Home, title: "Achat international", description: "Trouvez la propriété de vos rêves, où que ce soit dans le monde" },
    { icon: Building, title: "Vente sans frontières", description: "Vendez votre bien à une clientèle internationale" },
    { icon: Key, title: "Location de prestige", description: "Découvrez nos biens en location dans les destinations les plus prisées" },
    { icon: Users, title: "Gestion locative globale", description: "Nous gérons vos biens locatifs à distance, en toute sérénité" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover" 
            alt="Maison moderne avec vue sur un paysage montagneux" src="https://images.unsplash.com/photo-1564501049559-0b54b6f0dc1b" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
            style={{
              textShadow: '2px 2px 0 hsl(20, 34%, 35%), -2px -2px 0 hsl(20, 34%, 35%), 2px -2px 0 hsl(20, 34%, 35%), -2px 2px 0 hsl(20, 34%, 35%)'
            }}
          >
            L'immobilier
            <span className="block text-white">sans frontières</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-[hsl(20,34%,35%)]"
            style={{
              textShadow: '1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white'
            }}
          >
            Découvrez une sélection de biens d'exception à travers le monde.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl mx-auto mb-12"
          >
            {/* Interface de recherche */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-primary mb-4 text-center">
                Trouvez votre propriété idéale
              </h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Champ de recherche */}
                  <div className="space-y-2">
                    <label htmlFor="search" className="text-sm font-medium text-primary">
                      Localisation ou mot-clé
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="search"
                        type="text"
                        placeholder="Ex: Paris, villa, appartement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 text-primary placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  
                  {/* Type de propriété */}
                  <div className="space-y-2">
                    <label htmlFor="property-type" className="text-sm font-medium text-primary">
                      Type de propriété
                    </label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger className="h-12 text-primary">
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Appartement</SelectItem>
                        <SelectItem value="house">Maison</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="riad">Riad</SelectItem>
                        <SelectItem value="chalet">Chalet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    type="submit"
                    size="lg" 
                    className="flex-1 hero-gradient text-primary-foreground hover:opacity-90 h-12 text-lg font-medium"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Rechercher
                  </Button>
                  <Link to="/properties" className="flex-1">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="lg" 
                      className="w-full border-primary text-primary hover:bg-primary/10 h-12 text-lg font-medium whitespace-nowrap"
                    >
                      Voir toutes les propriétés
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 pulse-animation"></div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nos services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nous vous accompagnons à chaque étape de votre projet immobilier international.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="pt-6 flex flex-col items-center">
                    <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                      <service.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center items-center gap-3 mb-4">
              <Star className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Propriétés en Vedette
              </h2>
              <Star className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nos coups de cœur du moment, sélectionnés spécialement pour vous.
            </p>
          </motion.div>
          <PropertyList properties={featuredProperties} loading={featuredLoading} />
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Propriétés Exclusives
              </h2>
              <Award className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto"
               >
              Découvrez nos dernières pépites et biens uniques disponibles uniquement ici.
            </p>
          </motion.div>
          <PropertyList properties={exclusiveProperties} loading={exclusiveLoading} />
          <div className="text-center mt-16">
            <Link to="/properties">
              <Button size="lg" variant="outline" className="px-8 whitespace-nowrap">
                Voir toutes les propriétés
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} >
              <div className="text-4xl font-bold mb-2">30+</div>
              <div className="text-lg">Pays couverts</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} >
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-lg">Mandats exclusifs</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} >
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg">Clients nomades</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} >
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-lg">Langues parlées</div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default HomePage;