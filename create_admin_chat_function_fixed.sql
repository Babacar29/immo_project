-- Version corrigée de la fonction pour l'administration des messages
-- Compatible avec votre table profiles qui utilise 'full_name' au lieu de 'first_name' et 'last_name'

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
    c.guest_identifier::TEXT,              -- Cast explicite vers TEXT
    p.full_name::TEXT as user_first_name,  -- Cast explicite vers TEXT
    NULL::TEXT as user_last_name,          -- Pas de last_name dans votre schéma
    c.created_at,
    (
      SELECT m.content::TEXT 
      FROM messages m 
      WHERE m.conversation_id = c.id 
      ORDER BY m.created_at DESC 
      LIMIT 1
    ) as last_message,
    (
      SELECT m.created_at 
      FROM messages m 
      WHERE m.conversation_id = c.id 
      ORDER BY m.created_at DESC 
      LIMIT 1
    ) as last_message_date,
    (
      SELECT COUNT(*)::BIGINT 
      FROM messages m 
      WHERE m.conversation_id = c.id 
      AND m.sender_role != 'admin' 
      AND (m.is_read IS NULL OR m.is_read = false)
    ) as unread_count
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
SELECT 'Fonction get_conversations_with_user_info créée avec succès !' as result;
SELECT 'Compatible avec votre table profiles utilisant full_name' as note;