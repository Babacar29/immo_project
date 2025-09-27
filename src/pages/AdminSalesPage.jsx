import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { DollarSign, Home, User, Calendar, Tag, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminSalesPage = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('pending');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        created_at,
        sale_price,
        sale_date,
        status,
        properties (id, title),
        buyer:profiles!sales_buyer_id_fkey (id, full_name, email_from_auth)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur de chargement des ventes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des ventes.",
        variant: "destructive",
      });
    } else {
      setSales(data);
    }
    setLoading(false);
  };
  
  const openDetails = (sale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  const openChangeStatus = (sale) => {
    setSelectedSale(sale);
    setStatusValue(sale.status);
    setStatusOpen(true);
  };

  const applyStatusChange = async () => {
    if (!selectedSale) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: statusValue })
        .eq('id', selectedSale.id);
      if (error) throw error;
      toast({ title: 'Statut mis à jour' });
      setStatusOpen(false);
      setSelectedSale(null);
      fetchSales();
    } catch (e) {
      console.error('Erreur de mise à jour du statut:', e);
      toast({ title: 'Erreur', description: "Impossible de mettre à jour le statut.", variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const cancelSale = async (sale) => {
    if (!sale) return;
    if (!window.confirm('Confirmer l\'annulation de cette vente ?')) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('sales')
        .update({ status: 'cancelled' })
        .eq('id', sale.id);
      if (error) throw error;
      toast({ title: 'Vente annulée' });
      fetchSales();
    } catch (e) {
      console.error('Erreur annulation vente:', e);
      toast({ title: 'Erreur', description: "Impossible d'annuler la vente.", variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Complétée</Badge>;
      case 'pending':
        return <Badge variant="warning">En attente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
              <DollarSign className="w-8 h-8 text-destructive" />
              <h1 className="text-3xl font-bold text-foreground">
                Gestion des Ventes
              </h1>
            </div>
            <p className="text-muted-foreground">
              Suivez et gérez toutes les transactions de la plateforme.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Historique des Ventes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center p-8">Chargement des ventes...</div>
                ) : sales.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">Aucune vente enregistrée pour le moment.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Propriété</TableHead>
                          <TableHead>Acheteur</TableHead>
                          <TableHead className="text-right">Prix</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Home className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="font-medium">{sale.properties?.title || "Propriété supprimée"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{sale.buyer?.full_name || "Utilisateur inconnu"}</p>
                                  <p className="text-xs text-muted-foreground">{sale.buyer?.email_from_auth}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {new Intl.NumberFormat('fr-FR').format(sale.sale_price)} F CFA
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(sale.status)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Ouvrir le menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openDetails(sale)}>Voir détails</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openChangeStatus(sale)}>Modifier le statut</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => cancelSale(sale)} className="text-destructive">
                                    Annuler la vente
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Détails de la vente</DialogTitle>
                  <DialogDescription>Informations complètes sur la transaction.</DialogDescription>
                </DialogHeader>
                {selectedSale && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">ID de la vente</span><span className="font-mono">{selectedSale.id}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Propriété</span><span>{selectedSale.properties?.title || 'Propriété supprimée'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Acheteur</span><span>{selectedSale.buyer?.full_name || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedSale.buyer?.email_from_auth || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Prix</span><span className="font-mono">{new Intl.NumberFormat('fr-FR').format(selectedSale.sale_price)} F CFA</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Date de vente</span><span>{new Date(selectedSale.sale_date).toLocaleDateString('fr-FR')}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><span>{selectedSale.status}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Créée le</span><span>{new Date(selectedSale.created_at).toLocaleString('fr-FR')}</span></div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier le statut</DialogTitle>
                  <DialogDescription>Choisissez le nouveau statut de la vente.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={statusValue} onValueChange={setStatusValue}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="completed">Complétée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setStatusOpen(false)}>Annuler</Button>
                    <Button onClick={applyStatusChange} disabled={updating}>{updating ? 'Enregistrement…' : 'Enregistrer'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminSalesPage;