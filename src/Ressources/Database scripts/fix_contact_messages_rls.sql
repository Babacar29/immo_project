-- Script pour corriger les politiques RLS de la table contact_messages
-- Résout l'erreur "new row violates row-level security policy for table contact_messages"

-- Vérifier si la table existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
        -- Créer la table si elle n'existe pas
        CREATE TABLE contact_messages (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            subject VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'received',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Table contact_messages créée';
    ELSE
        RAISE NOTICE 'Table contact_messages existe déjà';
    END IF;
END $$;

-- Supprimer TOUTES les anciennes politiques RLS
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON contact_messages;
DROP POLICY IF EXISTS "Enable select for all users" ON contact_messages;
DROP POLICY IF EXISTS "Enable all for contact_messages" ON contact_messages;

-- S'assurer que RLS est activé
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- NOUVELLE POLITIQUE ULTRA-SIMPLE pour l'insertion
-- Permet à TOUS (anonymes et authentifiés) d'insérer des messages de contact
CREATE POLICY "contact_messages_insert_all" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Politique pour la lecture (seulement les admins)
CREATE POLICY "contact_messages_select_admins" ON contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Créer les index pour les performances si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Vérifications finales
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Compter les politiques
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'contact_messages';
    
    RAISE NOTICE 'Nombre de politiques RLS pour contact_messages: %', policy_count;
    
    -- Vérifier que RLS est activé
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'contact_messages'
        AND c.relrowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS est activé sur contact_messages';
    ELSE
        RAISE WARNING 'RLS N''EST PAS activé sur contact_messages';
    END IF;
END $$;

-- Message de confirmation
SELECT 'Politiques RLS corrigées pour contact_messages !' as result;
SELECT 'L''envoi de messages depuis la page contact devrait maintenant fonctionner.' as note;