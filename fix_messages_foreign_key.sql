-- Script pour ajouter la clé étrangère manquante entre messages et conversations
-- Résout l'erreur "Could not find a relationship between 'messages' and 'conversation_id'"

-- Vérifier et ajouter la clé étrangère si elle n'existe pas
DO $$
BEGIN
    -- Vérifier si la clé étrangère existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_conversation_id_fkey' 
        AND table_name = 'messages'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Ajouter la clé étrangère
        ALTER TABLE messages 
        ADD CONSTRAINT messages_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Clé étrangère messages_conversation_id_fkey ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Clé étrangère messages_conversation_id_fkey existe déjà';
    END IF;
END $$;

-- Vérifier que les tables existent et ont les bonnes colonnes
DO $$
BEGIN
    -- Vérifier table conversations
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
        RAISE EXCEPTION 'Table conversations n''existe pas. Exécutez d''abord create_chat_tables.sql';
    END IF;
    
    -- Vérifier table messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE EXCEPTION 'Table messages n''existe pas. Exécutez d''abord create_chat_tables.sql';
    END IF;
    
    -- Vérifier colonne conversation_id dans messages
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'conversation_id'
    ) THEN
        RAISE EXCEPTION 'Colonne conversation_id manquante dans table messages';
    END IF;
    
    RAISE NOTICE 'Toutes les vérifications sont OK';
END $$;

-- Message de confirmation
SELECT 'Clé étrangère ajoutée ! UserMessagesPage devrait maintenant fonctionner.' as result;
SELECT 'PostgREST peut maintenant faire les jointures automatiques.' as note;