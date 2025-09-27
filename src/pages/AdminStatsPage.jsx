import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { BarChart2, DollarSign, Home, Users, ArrowUp, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { toast } from '@/components/ui/use-toast';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const StatCard = ({ title, value, icon: Icon, change, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p className="text-xs text-muted-foreground flex items-center">
          <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
          {change} {description}
        </p>
      )}
    </CardContent>
  </Card>
);

const AdminStatsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('sale_price, created_at')
          .eq('status', 'completed');
        
        const { count: propertiesCount, error: propertiesError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { data: newUsersData, error: newUsersError } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', thirtyDaysAgoISO);
          
        if (salesError || propertiesError || usersError || newUsersError) throw salesError || propertiesError || usersError || newUsersError;
        
        const totalRevenue = salesData.reduce((sum, sale) => sum + sale.sale_price, 0);
        const salesLast30Days = salesData.filter(s => new Date(s.created_at) > thirtyDaysAgo).length;

        const salesByDay = salesData
          .filter(s => new Date(s.created_at) > thirtyDaysAgo)
          .reduce((acc, sale) => {
            const day = new Date(sale.created_at).toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {});

        const usersByDay = (newUsersData || [])
          .reduce((acc, user) => {
            const day = new Date(user.created_at).toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {});

        const chartData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayString = d.toISOString().split('T')[0];
            chartData.push({
                name: d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
                ventes: salesByDay[dayString] || 0,
                utilisateurs: usersByDay[dayString] || 0,
            });
        }
        
        setStats({
          totalRevenue,
          totalSales: salesData.length,
          totalProperties: propertiesCount,
          totalUsers: usersCount,
          salesLast30Days,
          chartData
        });
        
      } catch (error) {
        console.error("Erreur de chargement des statistiques:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton de retour */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Retourner sur la page d'administration
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-2">
              <BarChart2 className="w-8 h-8 text-destructive" />
              <h1 className="text-3xl font-bold text-foreground">
                Statistiques
              </h1>
            </div>
            <p className="text-muted-foreground">
              Aperçu des performances de la plateforme.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard
              title="Revenu Total"
              value={`${new Intl.NumberFormat('fr-FR').format(stats?.totalRevenue || 0)} F CFA`}
              icon={DollarSign}
            />
            <StatCard
              title="Ventes Totales"
              value={stats?.totalSales || 0}
              icon={ShoppingCart}
              change={`+${stats?.salesLast30Days || 0}`}
              description="ces 30 derniers jours"
            />
            <StatCard
              title="Propriétés"
              value={stats?.totalProperties || 0}
              icon={Home}
            />
            <StatCard
              title="Utilisateurs"
              value={stats?.totalUsers || 0}
              icon={Users}
            />
          </motion.div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
             <Card>
                <CardHeader>
                    <CardTitle>Activité des 30 derniers jours</CardTitle>
                    <CardDescription>Nouvelles ventes et inscriptions d'utilisateurs.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stats?.chartData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                color: "hsl(var(--card-foreground))"
                              }}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar dataKey="ventes" fill="hsl(var(--primary))" name="Ventes" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="utilisateurs" fill="hsl(var(--destructive))" name="Utilisateurs" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminStatsPage;