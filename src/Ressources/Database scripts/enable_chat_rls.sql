-- Script pour réactiver RLS avec les bonnes politiques
-- À utiliser après avoir testé avec RLS désactivé

-- Réactiver RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Appliquer les bonnes politiques (copiées du script principal)
-- Supprimer les anciennes politiques au cas où
DROP POLICY IF EXISTS "Enable insert for all users" ON conversations;
DROP POLICY IF EXISTS "Enable select for all users" ON conversations;
DROP POLICY IF EXISTS "Enable all for admins" ON conversations;

DROP POLICY IF EXISTS "Enable insert for all users" ON messages;
DROP POLICY IF EXISTS "Enable select for all users" ON messages;
DROP POLICY IF EXISTS "Enable update for admins" ON messages;
DROP POLICY IF EXISTS "Enable delete for admins" ON messages;

-- Recréer les politiques correctes
CREATE POLICY "Enable insert for all users" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON conversations
    FOR SELECT USING (true);

CREATE POLICY "Enable all for admins" ON conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Enable insert for all users" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Enable update for admins" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Enable delete for admins" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

SELECT 'RLS réactivé avec les bonnes politiques !' as result;