import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2, Search, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddPropertyForm from '@/components/AddPropertyForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';

const AdminPropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [saleForm, setSaleForm] = useState({ price: '', date: new Date().toISOString().slice(0, 10) });
  const [saleSubmitting, setSaleSubmitting] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        price,
        status,
        type,
        is_featured,
        is_exclusive,
        profiles (full_name)
      `)
      .order('created_at', { ascending: false });

    if (debouncedSearchTerm) {
      query = query.ilike('title', `%${debouncedSearchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les propriétés.', variant: 'destructive' });
    } else {
      setProperties(data);
    }
    setLoading(false);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.')) {
      
      const { error: imagesError } = await supabase.from('property_images').delete().eq('property_id', propertyId);
      if (imagesError) {
        toast({ title: 'Erreur', description: "Impossible de supprimer les images associées.", variant: 'destructive' });
        return;
      }

      const { error: favoritesError } = await supabase.from('favorites').delete().eq('property_id', propertyId);
      if (favoritesError) {
        toast({ title: 'Erreur', description: "Impossible de supprimer les favoris associés.", variant: 'destructive' });
        return;
      }
      
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de supprimer la propriété.', variant: 'destructive' });
      } else {
        toast({ title: 'Succès', description: 'Propriété supprimée avec succès.' });
        fetchProperties();
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchProperties();
  };

  const openSaleDialog = (property) => {
    setEditingProperty(property);
    setSaleForm({ price: property.price || '', date: new Date().toISOString().slice(0, 10) });
    setSaleDialogOpen(true);
  };

  const handleCreateSale = async () => {
    if (!editingProperty) return;
    const priceNum = saleForm.price === '' ? null : Number(saleForm.price);
    if (!priceNum || Number.isNaN(priceNum)) {
      toast({ title: 'Prix invalide', description: 'Veuillez saisir un montant valide.', variant: 'destructive' });
      return;
    }
    setSaleSubmitting(true);
    try {
      const { error } = await supabase.from('sales').insert({
        property_id: editingProperty.id,
        sale_price: priceNum,
        sale_date: new Date(saleForm.date).toISOString(),
        status: 'completed'
      });
      if (error) throw error;
      toast({ title: 'Vente enregistrée', description: 'La propriété a été marquée comme vendue.' });
      setSaleDialogOpen(false);
      setEditingProperty(null);
      fetchProperties();
    } catch (e) {
      console.error('Erreur création vente:', e);
      toast({ title: 'Erreur', description: "Impossible d'enregistrer la vente.", variant: 'destructive' });
    } finally {
      setSaleSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      {/* Bouton de retour */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Retourner sur la page d'administration
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Propriétés</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProperty}>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une propriété
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProperty ? 'Modifier la propriété' : 'Ajouter une nouvelle propriété'}</DialogTitle>
            </DialogHeader>
            <AddPropertyForm propertyToEdit={editingProperty} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par titre..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 font-medium">Titre</th>
                  <th className="p-4 font-medium">Lieu</th>
                  <th className="p-4 font-medium">Prix</th>
                  <th className="p-4 font-medium">Statut</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">En vedette</th>
                  <th className="p-4 font-medium">Exclusive</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b">
                    <td className="p-4 font-semibold">{property.title}</td>
                    <td className="p-4 text-muted-foreground">{property.location}</td>
                    <td className="p-4">{new Intl.NumberFormat('fr-FR').format(property.price)} F CFA</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        property.status === 'for_sale' ? 'bg-green-100 text-green-800' :
                        property.status === 'for_rent' ? 'bg-blue-100 text-blue-800' :
                        property.status === 'sold' ? 'bg-red-100 text-red-800' :
                        property.status === 'rented' ? 'bg-purple-100 text-purple-800' :
                        property.status === 'off_plan' ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status === 'for_sale' ? 'À vendre' :
                         property.status === 'for_rent' ? 'À louer' :
                         property.status === 'sold' ? 'Vendu' :
                         property.status === 'rented' ? 'Loué' :
                         property.status === 'off_plan' ? 'En VEFA' : 'Bientôt disponible'}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{property.type}</td>
                    <td className="p-4">{property.is_featured ? 'Oui' : 'Non'}</td>
                    <td className="p-4">{property.is_exclusive ? 'Oui' : 'Non'}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProperty(property)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openSaleDialog(property)} title="Marquer comme vendu">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProperty(property.id)} title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && properties.length === 0 && (
          <p className="text-center p-10 text-muted-foreground">Aucune propriété trouvée.</p>
        )}
      </div>

      {/* Dialog: Mark as sold */}
      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Marquer comme vendu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sale-price">Prix de vente (F CFA)</Label>
              <Input id="sale-price" type="number" value={saleForm.price}
                     onChange={(e) => setSaleForm(f => ({ ...f, price: e.target.value }))}
                     placeholder="Ex: 150000000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-date">Date de vente</Label>
              <Input id="sale-date" type="date" value={saleForm.date}
                     onChange={(e) => setSaleForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSaleDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateSale} disabled={saleSubmitting}>
              {saleSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer la vente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminPropertiesPage;