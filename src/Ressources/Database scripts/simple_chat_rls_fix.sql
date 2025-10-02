-- Script ultra-simple pour corriger les politiques RLS du chat
-- Évite tous les problèmes d'accès aux tables système

-- Supprimer TOUTES les anciennes politiques
DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Enable insert for all users" ON conversations;
DROP POLICY IF EXISTS "Enable select for all users" ON conversations;
DROP POLICY IF EXISTS "Enable all for admins" ON conversations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON conversations;

DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can read messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Admins can read all messages" ON messages;
DROP POLICY IF EXISTS "Admins can update all messages" ON messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON messages;
DROP POLICY IF EXISTS "Enable select for all users" ON messages;
DROP POLICY IF EXISTS "Enable update for admins" ON messages;
DROP POLICY IF EXISTS "Enable delete for admins" ON messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON messages;

-- POLITIQUES ULTRA-SIMPLES POUR CONVERSATIONS
-- Accès complet pour tout le monde (parfait pour le chat public)
CREATE POLICY "conversations_all_access" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- POLITIQUES ULTRA-SIMPLES POUR MESSAGES  
-- Accès complet pour tout le monde (parfait pour le chat public)
CREATE POLICY "messages_all_access" ON messages FOR ALL USING (true) WITH CHECK (true);

-- S'assurer que RLS est activé
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Confirmation
SELECT 'Politiques RLS ultra-simples appliquées ! Le chat devrait maintenant fonctionner.' as result;
SELECT 'Note: Toutes les opérations sont autorisées pour faciliter le développement.' as note;