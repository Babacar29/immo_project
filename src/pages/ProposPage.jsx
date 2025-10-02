import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building, MapPin, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const ProposPage = () => {
  const activities = [
    {
      icon: MapPin,
      title: "Vente de terrains",
      description: "Nous proposons une sélection rigoureuse de terrains à bâtir, viabilisés ou non, pour des projets résidentiels ou commerciaux."
    },
    {
      icon: Home,
      title: "Vente de villas",
      description: "Des biens de qualité, exceptionnels, ou un havre de paix dans des emplacements stratégiques, pour ceux qui recherchent confort, espace et valeur patrimoniale."
    },
    {
      icon: Building,
      title: "Vente d'appartements",
      description: "Du pied à terre pour vos déplacements pro, au studio moderne pour du locatif, en passant par l'appartement familial, nous offrons des biens adaptés à tous les styles de vie et à tous les budgets."
    },
    {
      icon: Key,
      title: "Gestion locative",
      description: "Confiez-nous la gestion de vos biens : mise en location, suivi administratif, entretien, gestion des loyers. Nous assurons la tranquillité d'esprit des propriétaires."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              NOMAD'IMMO <span className="text-primary">« L'immobilier sans frontières »</span>
            </h1>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none space-y-8"
          >
            <div className="bg-card rounded-lg p-6 shadow-md">
              <p className="text-lg leading-relaxed">
                Chez NOMAD'IMMO, nous croyons que l'immobilier ne connaît pas de frontières. Que ce soit en ville, à la campagne, ou même au-delà des limites géographiques traditionnelles, notre ambition est de vous accompagner partout où vos projets vous mènent.
              </p>
              <p className="text-lg leading-relaxed mt-4">
                Le mot "Nomad" fait référence à une vision moderne, libre et mobile de l'immobilier. À l'image des nomades qui traversent les territoires sans se limiter à un seul lieu, nous proposons une approche flexible et ouverte du marché immobilier, adaptée aux besoins d'une clientèle locale et internationale.
              </p>
            </div>

            <section className="mt-12">
              <h2 className="text-3xl font-bold mb-6">Pourquoi "Nomad" dans l'immobilier ?</h2>
              <p className="text-lg mb-4">Parce que l'immobilier d'aujourd'hui est en mouvement :</p>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li>Le Monde d'aujourd'hui pousse les acquéreurs à élargir leurs recherches dans plusieurs régions et parfois même d'autres pays</li>
                <li>Les investisseurs veulent diversifier, parfois à distance, dans des marchés variés.</li>
                <li>Les besoins évoluent : résidence principale, secondaire, investissement locatif, mobilité professionnelle…</li>
              </ul>
              <p className="text-lg mt-4">
                NOMAD'IMMO répond à cette nouvelle façon de penser l'immobilier : mobile, connectée, sans limites.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-3xl font-bold mb-8">Nos activités</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-primary/10 p-3">
                            <activity.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                            <p className="text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="mt-12 bg-card rounded-lg p-8 shadow-md">
              <h2 className="text-3xl font-bold mb-6">Notre expertise</h2>
              <div className="space-y-4 text-lg">
                <p>
                  Nomad'Immo s'est distinguée par son professionnalisme et son expertise dans le secteur immobilier au Sénégal.
                  Composée d'une équipe de spécialistes expérimentés, l'agence met un point d'honneur à comprendre en profondeur les besoins de chaque client afin d'y répondre de manière précise et personnalisée.
                </p>
                <p>
                  Grâce à une parfaite maîtrise des biens proposés, rompus aux réalités et aux difficultés du marché Nomad'Immo anticipe et élimine les détails susceptibles de freiner une vente, un achat ou une location. Attaché au respect des règles, des normes et des horaires, Nomad'immo mettra tout en œuvre pour que votre satisfaction soit totale.
                </p>
                <p>
                  L'agence accompagne ses clients à chaque étape du processus d'acquisition, en leur offrant des conseils avisés et un suivi rigoureux jusqu'à la concrétisation de leur projet immobilier.
                </p>
              </div>

              <div className="mt-8 flex justify-center">
                <Link to="/contact">
                  <Button size="lg" className="hero-gradient text-primary-foreground">
                    Contactez-nous
                  </Button>
                </Link>
              </div>
            </section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProposPage;