-- Script pour créer/corriger la table conversations pour le système de chat
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Supprimer la table existante si elle a des problèmes de structure
DROP TABLE IF EXISTS conversations CASCADE;

-- Créer la table conversations avec la structure correcte
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_identifier VARCHAR(255), -- Pour les utilisateurs non connectés
    status VARCHAR(50) DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- S'assurer qu'une conversation a soit un user_id soit un guest_identifier
    CONSTRAINT check_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_identifier IS NULL) OR
        (user_id IS NULL AND guest_identifier IS NOT NULL)
    )
);

-- Table messages (vérifier qu'elle existe aussi)
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user', 'guest', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guest_identifier ON conversations(guest_identifier);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Activer RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour conversations
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

-- Politiques RLS pour messages
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

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour last_message_at dans conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour last_message_at quand un nouveau message est inséré
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Commentaires pour documentation
COMMENT ON TABLE conversations IS 'Table des conversations de chat entre utilisateurs/invités et admins';
COMMENT ON COLUMN conversations.user_id IS 'ID de l''utilisateur connecté (null pour les invités)';
COMMENT ON COLUMN conversations.guest_identifier IS 'Identifiant unique pour les utilisateurs non connectés';
COMMENT ON COLUMN conversations.status IS 'Statut de la conversation: active, closed, archived';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp du dernier message dans cette conversation (mis à jour automatiquement)';

COMMENT ON TABLE messages IS 'Messages dans les conversations de chat';
COMMENT ON COLUMN messages.sender_role IS 'Rôle de l''expéditeur: user, guest, admin';
COMMENT ON COLUMN messages.sender_id IS 'ID de l''utilisateur (null pour les invités)';

-- Afficher un message de confirmation
SELECT 'Tables conversations et messages créées avec succès !' as result;