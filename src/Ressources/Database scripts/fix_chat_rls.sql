-- Mise à jour des politiques RLS pour corriger le problème de chat des utilisateurs connectés
-- Date: 2025-09-24
-- Problème: Les utilisateurs connectés ne peuvent pas créer de conversations à cause des politiques RLS

-- Supprimer l'ancienne politique de lecture restrictive
DROP POLICY IF EXISTS "Conversations: select pour admins" ON public.conversations;

-- Créer une nouvelle politique de lecture permissive pour tous
CREATE POLICY "Conversations: select pour tous"
ON public.conversations FOR SELECT
USING (true);

-- Vérifier que les autres politiques sont correctes
-- (Ces politiques devraient déjà exister, mais on les recrée par sécurité)

-- Supprimer et recréer les politiques pour être sûr
DROP POLICY IF EXISTS "Conversations: insert pour tous" ON public.conversations;
DROP POLICY IF EXISTS "Conversations: update pour tous" ON public.conversations;

-- Autoriser la création/upsert de conversations pour tout le monde
CREATE POLICY "Conversations: insert pour tous"
ON public.conversations FOR INSERT
WITH CHECK (true);

-- Autoriser l'update pour supporter l'UPSERT côté client
CREATE POLICY "Conversations: update pour tous"
ON public.conversations FOR UPDATE
USING (true)
WITH CHECK (true);

-- Ajouter la colonne user_id aux conversations si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fonction pour récupérer les conversations avec les infos utilisateur
CREATE OR REPLACE FUNCTION get_conversations_with_user_info()
RETURNS TABLE (
  conversation_id UUID,
  user_id UUID,
  guest_identifier TEXT,
  user_first_name TEXT,
  user_last_name TEXT,
  created_at TIMESTAMPTZ,
  last_message TEXT,
  last_message_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.user_id,
    c.guest_identifier,
    p.first_name as user_first_name,
    p.last_name as user_last_name,
    c.created_at,
    m.content as last_message,
    m.created_at as last_message_date
  FROM public.conversations c
  LEFT JOIN public.profiles p ON c.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM public.messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON true
  ORDER BY COALESCE(m.created_at, c.created_at) DESC;
END;
$$;

-- Afficher les politiques actuelles pour vérification
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'conversations'
ORDER BY policyname;