-- Table pour sauvegarder les messages de contact en cas de problème avec Firebase Functions
CREATE TABLE IF NOT EXISTS contact_messages (
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

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Politique RLS pour permettre l'insertion de messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Permettre à tous les utilisateurs (authentifiés et anonymes) d'insérer des messages
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Permettre seulement aux admins de lire les messages
CREATE POLICY "Only admins can read contact messages" ON contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Commentaires pour documentation
COMMENT ON TABLE contact_messages IS 'Table de fallback pour les messages de contact quand Firebase Functions ne fonctionne pas';
COMMENT ON COLUMN contact_messages.status IS 'Statut du message: received, read, responded, archived';