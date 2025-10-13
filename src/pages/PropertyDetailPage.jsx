import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, MapPin, Bed, Bath, Square, Building, Calendar, Tag, Mail, Phone, ExternalLink, Clock, Heart, ArrowLeft, Navigation } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { VideoPlayButton } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ScheduleVisitDialog = ({ property, agent }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visitDate, setVisitDate] = useState(null);
  const [visitTime, setVisitTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleScheduleVisit = async () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Vous devez être connecté pour planifier une visite.", variant: "destructive" });
      navigate('/login');
      return;
    }
    if (!visitDate || !visitTime) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une date et une heure.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = visitTime.split(':');
      const visitDateTime = new Date(visitDate);
      visitDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      const { error } = await supabase.from('visits').insert({
        user_id: user.id,
        property_id: property.id,
        agent_id: agent.id,
        visit_date: visitDateTime.toISOString(),
        message: message,
        status: 'pending'
      });

      if (error) throw error;

      toast({ title: "Succès", description: "Votre demande de visite a été envoyée." });
      setIsOpen(false);
      setVisitDate(null);
      setVisitTime('');
      setMessage('');
    } catch (error) {
      console.error("Erreur lors de la planification de la visite:", error);
      toast({ title: "Erreur", description: "Impossible de planifier la visite.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-6 hero-gradient text-primary-foreground">
          <Calendar className="w-4 h-4 mr-2" />
          Planifier une visite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Planifier une visite pour "{property.title}"</DialogTitle>
          <DialogDescription>Choisissez une date et une heure qui vous conviennent.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="col-span-3 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {visitDate ? format(visitDate, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={visitDate}
                  onSelect={setVisitDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">Heure</Label>
            <Input
              id="time"
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message optionnel pour l'agent..."
              className="col-span-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleScheduleVisit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            Confirmer la visite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const fetchProperty = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images ( id, image_url, is_primary ),
          profiles ( id, full_name, avatar_url, email_from_auth, phone_number )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Propriété non trouvée");

      setProperty(data);
      const primaryImage = data.property_images.find(img => img.is_primary) || data.property_images[0];
      setSelectedImage(primaryImage);

      if (user) {
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('favorites')
          .select('property_id')
          .eq('user_id', user.id)
          .eq('property_id', id)
          .single();
        if (favoriteError && favoriteError.code !== 'PGRST116') { // Ignore 'not found' error
            console.error(favoriteError);
        }
        setIsFavorited(!!favoriteData);
      }

    } catch (err) {
      console.error("Erreur de chargement de la propriété:", err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la propriété.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);
  
  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Vous devez être connecté pour gérer vos favoris.", variant: "destructive"});
      navigate('/login');
      return;
    }
    
    const previousState = isFavorited;
    setIsFavorited(!previousState);

    if (previousState) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', id);
      if (error) {
        toast({ title: "Erreur", description: "Impossible de supprimer le favori.", variant: "destructive"});
        setIsFavorited(previousState);
      } else {
        toast({ title: "Favori supprimé", description: "La propriété a été retirée de vos favoris."});
      }
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, property_id: id });
      if (error) {
        toast({ title: "Erreur", description: "Impossible d'ajouter le favori.", variant: "destructive"});
        setIsFavorited(previousState);
      } else {
        toast({ title: "Favori ajouté", description: "La propriété a été ajoutée à vos favoris."});
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erreur</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link to="/properties">
            <Button className="mt-4">Retour aux propriétés</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const lat = property?.latitude != null ? parseFloat(property.latitude) : null;
  const lng = property?.longitude != null ? parseFloat(property.longitude) : null;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : null;

  const handleOpenDirections = () => {
    if (!hasCoords) return;
    const destination = `${lat},${lng}`;
    // Try to use the user's current position for origin
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const oLat = pos.coords.latitude;
          const oLng = pos.coords.longitude;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLng}&destination=${destination}&travelmode=driving`;
          window.open(directionsUrl, '_blank', 'noopener,noreferrer');
        },
        () => {
          // Fallback: open directions without explicit origin (Maps will prompt)
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
          window.open(directionsUrl, '_blank', 'noopener,noreferrer');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${property.title} - Nomad'immo`}</title>
        <meta name="description" content={property.description.substring(0, 160)} />
        <meta property="og:title" content={`${property.title} - Nomad'immo`} />
        <meta property="og:description" content={property.description.substring(0, 160)} />
        <meta property="og:image" content={selectedImage?.image_url} />
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
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-8">
                <div className="h-[500px] rounded-lg overflow-hidden mb-4 relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-300"
                    alt={property.title}
                    src={selectedImage?.image_url}
                   />
                   <Button onClick={handleFavoriteToggle} variant="secondary" size="icon" className="absolute top-4 right-4">
                      <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-foreground/70'}`} />
                   </Button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {property.property_images.map(image => (
                    <button key={image.id} onClick={() => setSelectedImage(image)} className={`rounded-lg overflow-hidden border-2 ${selectedImage?.id === image.id ? 'border-primary' : 'border-transparent'}`}>
                      <img 
                        className="w-full h-24 object-cover"
                        alt={`Miniature de ${property.title}`}
                        src={image.image_url}
                       />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">{property.title}</h1>
                        <div className="flex items-center text-muted-foreground mt-2">
                          <MapPin className="w-5 h-5 mr-2" />
                          <span>{property.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {new Intl.NumberFormat('fr-FR').format(property.price)} F CFA
                        </div>
                        <div className="text-lg font-medium text-muted-foreground">
                          ~ {new Intl.NumberFormat('fr-FR').format(Math.round(property.price / 655.957))} €
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="secondary" className="capitalize"><Building className="w-4 h-4 mr-1"/>{property.type}</Badge>
                        <Badge variant="secondary" className="capitalize"><Tag className="w-4 h-4 mr-1"/>{property.status.replace('_', ' ')}</Badge>
                        {property.is_featured && <Badge variant="destructive">En vedette</Badge>}
                    </div>

                    <h2 className="text-2xl font-semibold text-foreground mb-4">Détails</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-foreground">
                      <div className="flex items-center"><Bed className="w-5 h-5 mr-2 text-primary"/> {property.bedrooms} Chambres</div>
                      <div className="flex items-center"><Bath className="w-5 h-5 mr-2 text-primary"/> {property.bathrooms} Salles de bain</div>
                      <div className="flex items-center"><Square className="w-5 h-5 mr-2 text-primary"/> {property.area} m²</div>
                    </div>

                    <h2 className="text-2xl font-semibold text-foreground mb-4">Description</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
                    
                    {property.address && (
                      <>
                        <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4">Adresse</h2>
                        <p className="text-muted-foreground">{property.address}</p>
                      </>
                    )}

                    {googleMapsUrl && (
                      <div className="mt-6 flex flex-wrap gap-3">
                       
                        <Button variant="outline" onClick={handleOpenDirections}>
                          <Navigation className="w-4 h-4 mr-2" />
                          Itinéraire depuis ma position
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Contacter l'agent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                          <img 
                            className="w-full h-full object-cover"
                            alt={property.profiles?.full_name || 'Agent'}
                            src={property.profiles?.avatar_url}
                           />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{property.profiles?.full_name || 'Agent Nomad\'immo'}</h3>
                          <p className="text-sm text-muted-foreground">Agent immobilier</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        {property.profiles?.email_from_auth && (
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2"/>
                            <span>{property.profiles.email_from_auth}</span>
                          </div>
                        )}
                        {property.profiles?.phone_number && (
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="w-4 h-4 mr-2"/>
                            <span>{property.profiles.phone_number}</span>
                          </div>
                        )}
                      </div>
                      {property.video_url && (
                        <div className="mt-4">
                          <VideoPlayButton 
                            videoUrl={property.video_url} 
                            propertyTitle={property.title}
                            className="w-full"
                          />
                        </div>
                      )}
                      <ScheduleVisitDialog property={property} agent={property.profiles} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default PropertyDetailPage;