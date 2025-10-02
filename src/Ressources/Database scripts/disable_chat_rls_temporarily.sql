-- Script d'urgence : Désactiver temporairement RLS pour déboguer
-- ATTENTION: À utiliser seulement pour le débogage en développement
-- NE PAS utiliser en production pour des raisons de sécurité

-- Désactiver RLS temporairement
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

SELECT 'RLS désactivé temporairement. Le chat devrait fonctionner maintenant.' as result;
SELECT 'IMPORTANT: Réactivez RLS avec enable_chat_rls.sql après les tests !' as warning;

-- Pour réactiver RLS plus tard, utilisez:
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;