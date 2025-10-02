-- Script pour nettoyer les données orphelines et ajouter la clé étrangère
-- Résout l'erreur de violation de contrainte de clé étrangère

-- ÉTAPE 1: Nettoyer les messages orphelins (qui pointent vers des conversations inexistantes)
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Compter les messages orphelins
    SELECT COUNT(*) INTO orphan_count
    FROM messages m
    WHERE NOT EXISTS (
        SELECT 1 FROM conversations c WHERE c.id = m.conversation_id
    );
    
    IF orphan_count > 0 THEN
        RAISE NOTICE 'Trouvé % messages orphelins. Suppression en cours...', orphan_count;
        
        -- Supprimer les messages orphelins
        DELETE FROM messages m
        WHERE NOT EXISTS (
            SELECT 1 FROM conversations c WHERE c.id = m.conversation_id
        );
        
        RAISE NOTICE '% messages orphelins supprimés', orphan_count;
    ELSE
        RAISE NOTICE 'Aucun message orphelin trouvé';
    END IF;
END $$;

-- ÉTAPE 2: Créer les conversations manquantes pour les messages existants
DO $$
DECLARE
    missing_conv_count INTEGER;
    conv_record RECORD;
BEGIN
    -- Compter les conversations manquantes
    SELECT COUNT(DISTINCT m.conversation_id) INTO missing_conv_count
    FROM messages m
    WHERE NOT EXISTS (
        SELECT 1 FROM conversations c WHERE c.id = m.conversation_id
    );
    
    IF missing_conv_count > 0 THEN
        RAISE NOTICE 'Trouvé % conversations manquantes. Création en cours...', missing_conv_count;
        
        -- Créer les conversations manquantes
        FOR conv_record IN 
            SELECT DISTINCT m.conversation_id, MIN(m.created_at) as first_message_date
            FROM messages m
            WHERE NOT EXISTS (
                SELECT 1 FROM conversations c WHERE c.id = m.conversation_id
            )
            GROUP BY m.conversation_id
        LOOP
            INSERT INTO conversations (id, guest_identifier, created_at)
            VALUES (
                conv_record.conversation_id,
                'imported_' || SUBSTRING(conv_record.conversation_id::text FROM 1 FOR 8),
                conv_record.first_message_date
            );
        END LOOP;
        
        RAISE NOTICE '% conversations créées', missing_conv_count;
    ELSE
        RAISE NOTICE 'Aucune conversation manquante';
    END IF;
END $$;

-- ÉTAPE 3: Vérifier et ajouter la clé étrangère
DO $$
BEGIN
    -- Supprimer la contrainte si elle existe déjà (pour éviter les erreurs)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_conversation_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT messages_conversation_id_fkey;
        RAISE NOTICE 'Ancienne contrainte supprimée';
    END IF;
    
    -- Ajouter la nouvelle contrainte
    ALTER TABLE messages 
    ADD CONSTRAINT messages_conversation_id_fkey 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Nouvelle contrainte de clé étrangère ajoutée avec succès';
END $$;

-- ÉTAPE 4: Vérifications finales
DO $$
DECLARE
    total_messages INTEGER;
    total_conversations INTEGER;
    orphan_messages INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_messages FROM messages;
    SELECT COUNT(*) INTO total_conversations FROM conversations;
    
    SELECT COUNT(*) INTO orphan_messages
    FROM messages m
    WHERE NOT EXISTS (
        SELECT 1 FROM conversations c WHERE c.id = m.conversation_id
    );
    
    RAISE NOTICE 'État final:';
    RAISE NOTICE '- Messages total: %', total_messages;
    RAISE NOTICE '- Conversations total: %', total_conversations;
    RAISE NOTICE '- Messages orphelins restants: %', orphan_messages;
    
    IF orphan_messages = 0 THEN
        RAISE NOTICE 'SUCCESS: Toutes les données sont cohérentes !';
    ELSE
        RAISE WARNING 'ATTENTION: Il reste % messages orphelins', orphan_messages;
    END IF;
END $$;

-- Message de confirmation
SELECT 'Données nettoyées et clé étrangère configurée !' as result;
SELECT 'UserMessagesPage devrait maintenant fonctionner correctement.' as note;