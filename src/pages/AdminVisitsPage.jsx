import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import Navbar from '@/components/Navbar';
import { Calendar as CalendarIcon, Loader2, Check, X, User, Home as HomeIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: fr }),
  getDay,
  locales,
});

const AdminVisitsPage = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        properties (title),
        profiles!visits_user_id_profiles_fkey (full_name, email_from_auth)
      `)
      .order('visit_date', { ascending: true });

    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les visites.", variant: "destructive" });
      console.error(error);
    } else {
      const formattedEvents = data.map(visit => ({
        id: visit.id,
        title: visit.properties ? visit.properties.title : "Propriété supprimée",
        start: new Date(visit.visit_date),
        end: new Date(new Date(visit.visit_date).getTime() + 60 * 60 * 1000), // 1 hour duration
        resource: visit,
      }));
      setVisits(formattedEvents);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  const handleUpdateVisitStatus = async (visitId, status) => {
    const { error } = await supabase
      .from('visits')
      .update({ status })
      .eq('id', visitId);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `Visite ${status === 'confirmed' ? 'confirmée' : 'annulée'}.` });
      setSelectedEvent(null);
      fetchVisits();
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor;
    switch (event.resource.status) {
      case 'confirmed':
        backgroundColor = 'hsl(var(--primary))';
        break;
      case 'cancelled':
        backgroundColor = 'hsl(var(--destructive))';
        break;
      case 'pending':
      default:
        backgroundColor = 'hsl(var(--secondary))';
        break;
    }
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: event.resource.status === 'pending' ? 'hsl(var(--secondary-foreground))' : 'hsl(var(--primary-foreground))',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
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
            className="flex justify-between items-center mb-8"
          >
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Calendrier des Visites
              </h1>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div
              className="bg-card p-4 rounded-lg shadow-lg h-[70vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Calendar
                localizer={localizer}
                events={visits}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                messages={{
                  next: "Suivant",
                  previous: "Précédent",
                  today: "Aujourd'hui",
                  month: "Mois",
                  week: "Semaine",
                  day: "Jour",
                  agenda: "Agenda",
                  date: "Date",
                  time: "Heure",
                  event: "Événement",
                }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
              />
            </motion.div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la visite</DialogTitle>
              <DialogDescription>
                Demande de visite pour le {format(new Date(selectedEvent.visit_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center">
                <HomeIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{selectedEvent.properties?.title || 'Propriété non disponible'}</p>
                  <p className="text-sm text-muted-foreground">Propriété</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{selectedEvent.profiles?.full_name || 'Utilisateur inconnu'}</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.profiles?.email_from_auth || 'Email non disponible'}</p>
                </div>
              </div>
              {selectedEvent.message && (
                <div>
                  <p className="font-semibold">Message du client :</p>
                  <p className="text-sm text-muted-foreground p-2 bg-accent rounded-md">{selectedEvent.message}</p>
                </div>
              )}
              <div>
                <p className="font-semibold">Statut : <span className={`capitalize font-bold ${
                  selectedEvent.status === 'confirmed' ? 'text-green-500' :
                  selectedEvent.status === 'cancelled' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>{selectedEvent.status}</span></p>
              </div>
            </div>
            <DialogFooter>
              {selectedEvent.status === 'pending' && (
                <>
                  <Button variant="outline" onClick={() => handleUpdateVisitStatus(selectedEvent.id, 'cancelled')}>
                    <X className="mr-2 h-4 w-4" /> Annuler
                  </Button>
                  <Button onClick={() => handleUpdateVisitStatus(selectedEvent.id, 'confirmed')}>
                    <Check className="mr-2 h-4 w-4" /> Confirmer
                  </Button>
                </>
              )}
              {selectedEvent.status === 'confirmed' && (
                 <Button variant="destructive" onClick={() => handleUpdateVisitStatus(selectedEvent.id, 'cancelled')}>
                    <X className="mr-2 h-4 w-4" /> Annuler la visite
                  </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminVisitsPage;