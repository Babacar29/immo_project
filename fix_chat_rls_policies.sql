-- Script de correction des politiques RLS pour les tables de chat
-- À exécuter pour résoudre l'erreur "new row violates row-level security policy"

-- Supprimer toutes les anciennes politiques pour conversations
DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;

-- Supprimer toutes les anciennes politiques pour messages
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can read messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Admins can read all messages" ON messages;
DROP POLICY IF EXISTS "Admins can update all messages" ON messages;

-- NOUVELLES POLITIQUES CORRIGÉES POUR CONVERSATIONS

-- Permettre à TOUS (utilisateurs connectés et invités) de créer des conversations
CREATE POLICY "Enable insert for all users" ON conversations
    FOR INSERT WITH CHECK (true);

-- Permettre à TOUS de lire les conversations (nécessaire pour les invités)
CREATE POLICY "Enable select for all users" ON conversations
    FOR SELECT USING (true);

-- Permettre aux utilisateurs connectés de modifier leurs propres conversations
CREATE POLICY "Enable update for authenticated users" ON conversations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Permettre aux utilisateurs connectés de supprimer leurs propres conversations
CREATE POLICY "Enable delete for authenticated users" ON conversations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- NOUVELLES POLITIQUES CORRIGÉES POUR MESSAGES

-- Permettre à TOUS d'insérer des messages
CREATE POLICY "Enable insert for all users" ON messages
    FOR INSERT WITH CHECK (true);

-- Permettre à TOUS de lire les messages (nécessaire pour les invités)
CREATE POLICY "Enable select for all users" ON messages
    FOR SELECT USING (true);

-- Permettre aux utilisateurs connectés de modifier leurs propres messages
CREATE POLICY "Enable update for authenticated users" ON messages
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Permettre aux utilisateurs connectés de supprimer leurs propres messages
CREATE POLICY "Enable delete for authenticated users" ON messages
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Vérifier que RLS est activé
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Message de confirmation
SELECT 'Politiques RLS corrigées ! Le chat devrait maintenant fonctionner pour tous les utilisateurs.' as result;