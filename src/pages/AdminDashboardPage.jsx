import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Home, Users, DollarSign, MessageSquare, BarChart2, CalendarCheck, Settings, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const adminMenuItems = [
    { title: "Gestion Propriétés", icon: Home, link: "/admin/properties" },
    { title: "Gestion Utilisateurs", icon: Users, link: "/admin/users" },
    { title: "Messagerie", icon: MessageSquare, link: "/admin/messages" },
    { title: "Gestion Ventes", icon: DollarSign, link: "/admin/sales" },
    { title: "Statistiques", icon: BarChart2, link: "/admin/stats" },
    { title: "Calendrier Visites", icon: CalendarCheck, link: "/admin/visits" },
    { title: "Paramètres", icon: Settings, link: "/account-settings" },
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />
      <div className="pt-24 pb-12 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton de retour */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Retourner sur la page d'accueil
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-2">
              <LayoutDashboard className="w-8 h-8 text-destructive" />
              <h1 className="text-3xl font-bold text-foreground">
                Panneau d'Administration
              </h1>
            </div>
            <p className="text-muted-foreground">
              Gérez l'ensemble de la plateforme Nomad'immo.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {adminMenuItems.map((item, index) => {
                    const content = (
                      <div className="flex flex-col items-center justify-center p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors h-full">
                        <item.icon className="w-8 h-8 mb-2 text-primary" />
                        <span className="text-sm font-medium text-center text-foreground">{item.title}</span>
                      </div>
                    );

                    if (item.link) {
                      return <Link to={item.link} key={index}>{content}</Link>;
                    }
                    return <button key={index}>{content}</button>;
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboardPage;