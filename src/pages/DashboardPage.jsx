import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Heart, Eye, MessageSquare, Settings, Shield, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const DashboardPage = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (user) {
      const fetchFavoritesCount = async () => {
        const { count, error } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (!error) {
          setFavoritesCount(count);
        }
      };
      fetchFavoritesCount();
    }
  }, [user, loading, navigate]);

  const handleFeatureClick = (feature) => {
    toast({
      title: "🚧 Cette fonctionnalité n'est pas encore implémentée",
      description: "Mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochaine requête ! 🚀",
    });
  };

  const stats = [
    {
      title: "Propriétés vues",
      value: "24",
      icon: Eye,
      color: "text-blue-500"
    },
    {
      title: "Favoris",
      value: favoritesCount,
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Messages",
      value: "3",
      icon: MessageSquare,
      color: "text-green-500"
    },
    {
      title: "Visites planifiées",
      value: "2",
      icon: Home,
      color: "text-purple-500"
    }
  ];

  // Section "Activités récentes" supprimée selon la demande

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
  }

  const userName = userProfile?.full_name || user.email;

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bonjour, {userName} !
            </h1>
            <p className="text-muted-foreground">
              Bienvenue dans votre espace nomade. Gérez vos propriétés et suivez vos activités.
            </p>
          </motion.div>

           {userProfile?.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="bg-destructive/10 border-destructive">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-destructive" />
                    <div>
                      <p className="font-bold text-destructive">Mode Administrateur</p>
                      <p className="text-sm text-destructive/80">
                        Vous avez des accès privilégiés.
                      </p>
                    </div>
                  </div>
                  <Link to="/admin">
                    <Button variant="destructive" size="sm">
                      Aller au panneau d'administration
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300 bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-accent ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Card className="bg-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-primary" />
                    Actions rapides
                  </CardTitle>
                  <CardDescription>
                    Accédez rapidement aux fonctionnalités principales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/properties')}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Rechercher des propriétés
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/favorites')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Voir mes favoris
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/admin/visits')}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Voir mes plannings de visite
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/messages')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Mes messages
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => navigate('/account-settings')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres du compte
                    </Button>
                  </div>
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

export default DashboardPage;