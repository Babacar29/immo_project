-- Version ultra-corrigée de la fonction pour l'administration des messages
-- Résout les problèmes de types de données avec des casts explicites

CREATE OR REPLACE FUNCTION get_conversations_with_user_info()
RETURNS TABLE (
  conversation_id UUID,
  user_id UUID,
  guest_identifier TEXT,
  user_first_name TEXT,
  user_last_name TEXT,
  created_at TIMESTAMPTZ,
  last_message TEXT,
  last_message_date TIMESTAMPTZ,
  unread_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (c.id)
    c.id as conversation_id,
    c.user_id,
    COALESCE(c.guest_identifier, '')::TEXT as guest_identifier,  -- Cast vers TEXT avec fallback
    COALESCE(p.full_name, '')::TEXT as user_first_name,          -- Cast vers TEXT avec fallback
    ''::TEXT as user_last_name,                                  -- Chaîne vide au lieu de NULL
    c.created_at,
    COALESCE((
      SELECT m.content 
      FROM messages m 
      WHERE m.conversation_id = c.id 
      ORDER BY m.created_at DESC 
      LIMIT 1
    ), '')::TEXT as last_message,                                -- Cast vers TEXT avec fallback
    (
      SELECT m.created_at 
      FROM messages m 
      WHERE m.conversation_id = c.id 
      ORDER BY m.created_at DESC 
      LIMIT 1
    ) as last_message_date,
    COALESCE((
      SELECT COUNT(*) 
      FROM messages m 
      WHERE m.conversation_id = c.id 
      AND m.sender_role != 'admin' 
      AND (m.is_read IS NULL OR m.is_read = false)
    ), 0)::BIGINT as unread_count                                -- Cast vers BIGINT avec fallback
  FROM conversations c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE EXISTS (
    SELECT 1 FROM messages m2 WHERE m2.conversation_id = c.id
  )
  ORDER BY c.id, (
    SELECT m.created_at 
    FROM messages m 
    WHERE m.conversation_id = c.id 
    ORDER BY m.created_at DESC 
    LIMIT 1
  ) DESC NULLS LAST;
END;
$$;

-- Message de confirmation
SELECT 'Fonction get_conversations_with_user_info créée avec TOUS les casts de types !' as result;
SELECT 'Résout les erreurs de structure et types de données' as note;