import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, KeyRound } from 'lucide-react';
import { Helmet } from 'react-helmet';

const AccountSettingsPage = () => {
  const { user, userProfile, fetchUserProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setPhoneNumber(userProfile.phone_number || '');
    }
  }, [userProfile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        updated_at: new Date(),
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Erreur',
        description: "La mise à jour du profil a échoué.",
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Votre profil a été mis à jour.',
      });
      await fetchUserProfile(user);
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: 'Erreur',
        description: "La mise à jour du mot de passe a échoué.",
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Votre mot de passe a été mis à jour.',
      });
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };
  
  if (authLoading || !userProfile) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Helmet>
        <title>Paramètres du compte - Nomad'immo</title>
        <meta name="description" content="Gérez vos informations personnelles et vos paramètres de sécurité sur Nomad'immo." />
        <meta property="og:title" content="Paramètres du compte - Nomad'immo" />
        <meta property="og:description" content="Gérez vos informations personnelles et vos paramètres de sécurité sur Nomad'immo." />
      </Helmet>
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres du compte</h1>
              <p className="text-muted-foreground">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <User className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle>Profil public</CardTitle>
                        <CardDescription>Ces informations seront visibles par les agents.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                        <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <Input id="email" type="email" value={user.email} disabled />
                        <p className="text-xs text-muted-foreground">L'adresse e-mail ne peut pas être modifiée.</p>
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer les modifications
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                     <div className="flex items-center space-x-3">
                      <KeyRound className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle>Mot de passe</CardTitle>
                        <CardDescription>Modifiez votre mot de passe ici.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Changer le mot de passe
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AccountSettingsPage;