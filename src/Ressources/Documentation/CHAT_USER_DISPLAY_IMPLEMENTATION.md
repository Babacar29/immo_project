# Implementation des noms d'utilisateurs dans le chat

## Modifications apportées

### 1. ChatWidget.jsx
- **Fonction mise à jour** : `ensureConversationExists()`
- **Changements** : Ajout du `user_id` lors de la création des conversations
- **Avant** : `[{ id: conversationId, guest_identifier: guestIdentifier }]`
- **Après** : `[{ id: conversationId, guest_identifier: guestIdentifier, user_id: userId }]`

### 2. AdminMessagesPage.jsx
- **Fonction mise à jour** : `fetchConversations()`
- **Changements** : Utilise maintenant `get_conversations_with_user_info()` au lieu de `get_conversations_with_last_message()`
- **Fonction ajoutée** : `getConversationDisplayName(conversation)`
- **Logique** : Affiche le prénom de l'utilisateur si disponible, sinon "Visiteur {id}"
- **Zones d'affichage mises à jour** :
  - Liste des conversations
  - En-tête de conversation sélectionnée

### 3. Base de données (fix_chat_rls.sql)
- **Colonne ajoutée** : `user_id UUID` dans la table `conversations`
- **Fonction créée** : `get_conversations_with_user_info()`
  - Joint les tables `conversations`, `profiles`, et `messages`
  - Retourne les infos utilisateur (prénom, nom) et le dernier message
  - Supporte à la fois les utilisateurs connectés et les invités

## Actions nécessaires pour finaliser

### 1. Exécuter le SQL sur Supabase
Le fichier `fix_chat_rls.sql` doit être exécuté dans le SQL Editor de Supabase Dashboard :
1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet
3. Aller dans "SQL Editor"
4. Coller le contenu de `fix_chat_rls.sql`
5. Exécuter

### 2. Vérifier la table profiles
S'assurer que la table `profiles` contient bien :
- Une colonne `first_name`
- Une colonne `last_name`
- Un trigger qui crée automatiquement un profil lors de l'inscription

### 3. Test de fonctionnement
Après l'exécution SQL :
1. Créer une nouvelle conversation en tant qu'utilisateur connecté
2. Vérifier que `user_id` est bien sauvegardé dans la table `conversations`
3. Vérifier que l'AdminMessagesPage affiche le prénom au lieu de "Visiteur"

## Résultat attendu

**Avant** :
- Toutes les conversations affichent "Visiteur 12345678"

**Après** :
- Utilisateurs connectés : "Marie", "Pierre", etc.
- Utilisateurs invités : "Visiteur 12345678"

## Structure de données

### Nouvelle structure de la table conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_identifier TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NOUVEAU
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Retour de get_conversations_with_user_info()
```typescript
{
  conversation_id: UUID,
  user_id: UUID | null,
  guest_identifier: string | null,
  user_first_name: string | null,  -- NOUVEAU
  user_last_name: string | null,   -- NOUVEAU
  created_at: timestamp,
  last_message: string | null,
  last_message_date: timestamp | null
}
```

## Notes importantes

1. **Rétrocompatibilité** : Les conversations existantes continueront de fonctionner (elles n'auront pas de user_id et s'afficheront comme "Visiteur")

2. **UserMessagesPage** : Pas de changements nécessaires car cette page affiche simplement "Conversation" (l'utilisateur sait que c'est sa propre conversation)

3. **Test de logique** : Le fichier `test_user_display.js` a été créé pour tester la logique d'affichage des noms