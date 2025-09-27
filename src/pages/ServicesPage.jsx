
import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Building, Key, Users, ArrowRight, Globe, HeartHandshake as Handshake, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet';

const ServicesPage = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: Home,
      title: "Achat international",
      description: "Que vous cherchiez une villa en bord de mer, un appartement en centre-ville ou un chalet à la montagne, nous vous donnons accès à un portefeuille mondial de propriétés d'exception. Notre équipe vous guide à chaque étape, de la recherche à la signature.",
      image: "https://i.postimg.cc/Kzw3kk71/temp-Imagem-Pli-BT.avif"
    },
    {
      icon: Building,
      title: "Vente sans frontières",
      description: "Vendez votre bien au meilleur prix grâce à notre réseau international d'acheteurs qualifiés. Nous mettons en place une stratégie de marketing sur-mesure pour une visibilité maximale et gérons l'ensemble du processus de vente pour une transaction fluide.",
      image: "https://i.postimg.cc/q7m3rZzX/temp-Imagef-V7-PWr.avif"
    },
    {
      icon: Key,
      title: "Location de prestige",
      description: "Pour vos vacances ou un séjour prolongé, découvrez notre sélection de biens en location dans les destinations les plus prisées. Profitez d'un service de conciergerie et de prestations haut de gamme pour une expérience inoubliable.",
      image: "https://i.postimg.cc/L5PYz9vN/temp-Imagedah-AHK.avif"
    },
    {
      icon: Users,
      title: "Gestion locative globale",
      description: "Confiez-nous la gestion de vos biens locatifs et profitez de vos revenus en toute sérénité. Nous nous occupons de tout : recherche de locataires, gestion des contrats, maintenance et optimisation de la rentabilité de votre investissement.",
      image: "https://i.postimg.cc/76fTZMzv/temp-Image-BCEZSv.avif"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Nos Services - Nomad'immo</title>
        <meta name="description" content="Découvrez en détail les services d'excellence de Nomad'immo : achat, vente, location et gestion locative à l'international." />
      </Helmet>
      <Navbar />


      <main>
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex items-center justify-center text-center bg-secondary">
           <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40"></div>
           <img class="absolute inset-0 w-full h-full object-cover" alt="Bureau moderne d'architecture avec vue panoramique" src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2940&auto=format&fit=crop" />
          <div className="relative z-10 px-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-bold mb-4 text-primary"
              >
                Nos Services d'Excellence
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl max-w-3xl mx-auto text-primary"
              >
                Un accompagnement sur-mesure pour tous vos projets immobiliers, partout dans le monde.
              </motion.p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
                >
                  {/* Pour les index pairs (0, 2) : texte à gauche, image à droite */}
                  {/* Pour les index impairs (1, 3) : image à gauche, texte à droite */}
                  
                  {index % 2 === 0 ? (
                    <>
                      {/* Texte à gauche */}
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 hero-gradient rounded-lg flex items-center justify-center mr-4">
                            <service.icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                            {service.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-lg">
                          {service.description}
                        </p>
                      </div>
                      {/* Image à droite */}
                      <div className="relative rounded-lg overflow-hidden shadow-2xl">
                        <img src={service.image} alt={service.title} className="w-full h-80 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Image à gauche */}
                      <div className="relative rounded-lg overflow-hidden shadow-2xl">
                        <img src={service.image} alt={service.title} className="w-full h-80 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      {/* Texte à droite */}
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 hero-gradient rounded-lg flex items-center justify-center mr-4">
                            <service.icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                            {service.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-lg">
                          {service.description}
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Globe className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Prêt à franchir le pas ?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Notre équipe d'experts est prête à vous aider à concrétiser votre projet immobilier international. Contactez-nous dès aujourd'hui pour une consultation personnalisée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="hero-gradient text-primary-foreground">
                    <Handshake className="w-5 h-5 mr-2" />
                    Nous Contacter
                  </Button>
                </Link>
                <Link to="/properties">
                  <Button size="lg" className="hero-gradient text-primary-foreground">
                    <Search className="w-5 h-5 mr-2" />
                    Voir nos propriétés
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
