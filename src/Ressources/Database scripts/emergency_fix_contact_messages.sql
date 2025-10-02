-- Solution d'urgence pour la table contact_messages
-- Désactive complètement RLS sur cette table pour permettre l'insertion

-- OPTION 1: Désactiver RLS complètement (solution rapide)
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- Message de confirmation
SELECT 'RLS désactivé sur contact_messages - Solution d''urgence appliquée !' as result;
SELECT 'L''envoi de messages depuis la page contact devrait maintenant fonctionner.' as note;
SELECT 'ATTENTION: Cette solution désactive la sécurité sur cette table.' as warning;

-- Si vous voulez réactiver RLS plus tard avec des politiques corrigées:
-- ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- Puis recréer les bonnes politiques