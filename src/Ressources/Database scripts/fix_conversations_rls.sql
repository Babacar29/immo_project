-- Script pour corriger les politiques RLS sur conversations et messages
-- Exécuter dans l'éditeur SQL de Supabase

-- Désactiver RLS temporairement pour modifier les politiques
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Enable insert for all users" ON conversations;
DROP POLICY IF EXISTS "Enable select for all users" ON conversations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON conversations;

DROP POLICY IF EXISTS "Enable insert for all users" ON messages;
DROP POLICY IF EXISTS "Enable select for all users" ON messages;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON messages;

-- Réactiver RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Nouvelles politiques pour conversations - PERMISSIVES
-- Permettre à TOUS d'insérer des conversations
CREATE POLICY "conversations_insert" ON conversations
    FOR INSERT WITH CHECK (true);

-- Permettre à TOUS de lire toutes les conversations
CREATE POLICY "conversations_select" ON conversations
    FOR SELECT USING (true);

-- Permettre à TOUS de mettre à jour (nécessaire pour on_conflict)
CREATE POLICY "conversations_update" ON conversations
    FOR UPDATE USING (true);

-- Permettre à TOUS de supprimer
CREATE POLICY "conversations_delete" ON conversations
    FOR DELETE USING (true);

-- Nouvelles politiques pour messages - PERMISSIVES
-- Permettre à TOUS d'insérer des messages
CREATE POLICY "messages_insert" ON messages
    FOR INSERT WITH CHECK (true);

-- Permettre à TOUS de lire tous les messages
CREATE POLICY "messages_select" ON messages
    FOR SELECT USING (true);

-- Permettre à TOUS de mettre à jour
CREATE POLICY "messages_update" ON messages
    FOR UPDATE USING (true);

-- Permettre à TOUS de supprimer
CREATE POLICY "messages_delete" ON messages
    FOR DELETE USING (true);

SELECT 'Politiques RLS corrigées avec succès !' as result;
