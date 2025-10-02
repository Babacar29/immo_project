-- Script de mise à jour pour ajouter la colonne last_message_at manquante
-- À exécuter si vous avez déjà créé les tables avec l'ancien script

-- Ajouter la colonne last_message_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'last_message_at'
    ) THEN
        ALTER TABLE conversations 
        ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        -- Mettre à jour la colonne avec les timestamps des derniers messages existants
        UPDATE conversations 
        SET last_message_at = (
            SELECT MAX(created_at) 
            FROM messages 
            WHERE messages.conversation_id = conversations.id
        )
        WHERE EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.conversation_id = conversations.id
        );
        
        RAISE NOTICE 'Colonne last_message_at ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne last_message_at existe déjà';
    END IF;
END $$;

-- Ajouter l'index si il n'existe pas
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Créer la fonction de mise à jour si elle n'existe pas
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer le trigger existant s'il existe et le recréer
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON messages;
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Ajouter le commentaire
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp du dernier message dans cette conversation (mis à jour automatiquement)';

SELECT 'Mise à jour terminée ! La colonne last_message_at est maintenant disponible.' as result;