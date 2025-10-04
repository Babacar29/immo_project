import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, Facebook, Instagram, Linkedin } from 'lucide-react';
import { sendContactMessage } from '@/lib/emailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentative d\'envoi du formulaire de contact:', formData);
      
      const result = await sendContactMessage(formData);
      
      if (result.success) {
        toast({
          title: "Message envoyé avec succès !",
          description: "Notre équipe vous répondra dans les plus brefs délais à contact@nomadimmo.org",
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        throw new Error(result.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur lors de l'envoi",
        description: error.message || "Veuillez réessayer ou nous contacter directement à contact@nomadimmo.org",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    { icon: Phone, title: "Hotline internationale", details: "+221 71 032 66 71", description: "Support multilingue" },
    { icon: Mail, title: "Email", details: "contact@nomadimmo.org", description: "Réponse sous 24h" },
    { icon: MapPin, title: "Adresse", details: "Présence mondiale", description: "Bureaux à Dakar, Paris, New York" },
    { icon: Clock, title: "Horaires", details: "24h/24, 7j/7", description: "Nous suivons le soleil" }
  ];

  const socialLinks = [
    { icon: Facebook, url: "https://www.facebook.com/profile.php?id=61578363185474", name: "Facebook" },
    { 
      icon: null, 
      url: "https://x.com/NomadImmo", 
      name: "X (Twitter)",
      svg: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
    { icon: Instagram, url: "https://www.instagram.com/nomad_imo/", name: "Instagram" },
    { 
      icon: null, 
      url: "https://www.tiktok.com/@nomad_immo?lang=fr", 
      name: "TikTok",
      svg: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.169-1.894-1.169-2.894V1h-3.301v8.986c0 .041-.003.082-.009.123v.989c0 1.793-1.539 3.247-3.437 3.247s-3.437-1.454-3.437-3.247 1.539-3.247 3.437-3.247c.384 0 .752.067 1.092.189V4.845c-.341-.041-.693-.062-1.092-.062-3.59 0-6.5 2.596-6.5 5.803s2.91 5.803 6.5 5.803c3.59 0 6.5-2.596 6.5-5.803V8.375c1.419.98 3.156 1.557 5.016 1.557V6.743c-.827 0-1.596-.221-2.251-.614-.549-.331-1.019-.793-1.368-1.346-.349-.553-.549-1.186-.549-1.847V1.444h-.858z"/></svg>
    }
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une question ? Un projet ? Notre équipe d'experts internationaux est à votre écoute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire, nous revenons vers vous rapidement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input id="name" name="name" placeholder="Votre nom" value={formData.name} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="+221 77 123 45 67" value={formData.phone} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet</Label>
                        <Input id="subject" name="subject" placeholder="Objet de votre message" value={formData.subject} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <textarea 
                        id="message" 
                        name="message" 
                        rows={6} 
                        placeholder="Décrivez votre projet..." 
                        value={formData.message} 
                        onChange={handleInputChange} 
                        required 
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full hero-gradient text-primary-foreground">
                      <Send className="w-4 h-4 mr-2" />
                      {isLoading ? 'Envoi en cours...' : 'Envoyer le message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                        <info.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                      <p className="text-foreground font-medium mb-1">{info.details}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle>Suivez-nous</CardTitle>
                  <CardDescription>
                    Restez connecté et découvrez nos dernières propriétés et actualités.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center space-x-6">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors duration-200"
                        aria-label={`Suivez-nous sur ${link.name}`}
                      >
                        {link.icon ? <link.icon className="w-8 h-8" /> : link.svg}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-64 bg-secondary flex items-center justify-center">
                  <img  
                    className="w-full h-full object-cover" 
                    alt="Carte du monde stylisée" 
                    src="https://images.unsplash.com/photo-1486379898267-f195cbfdf55e" 
                  />
                </div>
              </Card>

              <Card className="hero-gradient text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Pourquoi nous choisir ?</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Expertise immobilière globale</li>
                    <li>• Réseau d'agents dans plus de 30 pays</li>
                    <li>• Connaissance des marchés locaux</li>
                    <li>• Transactions sécurisées et transparentes</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
