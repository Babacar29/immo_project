# Guide de Diagnostic : Problèmes d'Envoi de Messages

## 🔍 Diagnostic Rapide

### 1. ChatWidget (Messages en temps réel)

#### Ouvrir la console du navigateur et vérifier :

**Tests à effectuer :**
1. Ouvrir le chat et regarder les logs dans la console
2. Essayer d'envoyer un message
3. Vérifier les messages d'erreur

**Messages de log à rechercher :**
- `Tentative d'envoi de message:` - Confirme que la fonction est appelée
- `Données du message à envoyer:` - Vérifie le format des données
- `Message envoyé avec succès:` - Confirme l'insertion en base
- `Erreur lors de l'envoi du message:` - Indique un problème Supabase

**Problèmes courants :**
- **Pas de conversation ID** : Vérifier localStorage et génération UUID
- **Erreur Supabase** : Vérifier les credentials et les politiques RLS
- **Messages dupliqués** : Vérifier la logique de déduplication

### 2. Page de Contact (Email via Firebase)

#### Ouvrir la console et vérifier :

**Messages de log à rechercher :**
- `Tentative d'envoi d'email avec les données:` - Confirme l'appel
- `Données d'email préparées:` - Vérifie le format
- `Résultat de l'envoi d'email:` - Confirme Firebase Functions
- `Firebase Functions a échoué, utilisation du fallback Supabase` - Utilise le plan B

**Codes d'erreur Firebase courants :**
- `functions/not-found` : Cloud Function n'existe pas
- `functions/unauthenticated` : Problème d'auth
- `functions/permission-denied` : Permissions insuffisantes
- `functions/unavailable` : Service indisponible

## 🛠️ Solutions par Problème

### ChatWidget ne fonctionne pas

#### Vérification Supabase :
1. **Connexion** : Vérifier les variables d'environnement
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. **Tables** : Vérifier que les tables existent
   - `conversations`
   - `messages`

3. **Politiques RLS** : S'assurer que les utilisateurs peuvent insérer
   ```sql
   -- Vérifier les politiques
   SELECT * FROM pg_policies WHERE tablename = 'messages';
   SELECT * FROM pg_policies WHERE tablename = 'conversations';
   ```

4. **Test manuel** :
   ```javascript
   // Dans la console du navigateur
   const { supabase } = await import('/src/lib/customSupabaseClient.js');
   const result = await supabase.from('messages').select('*').limit(1);
   console.log(result);
   ```

### Page de Contact ne fonctionne pas

#### Vérification Firebase :
1. **Configuration** : Vérifier `src/lib/firebaseConfig.js`
2. **Cloud Functions** : Vérifier si elles sont déployées
3. **Fallback Supabase** : Créer la table `contact_messages`

#### Créer la table de fallback :
```bash
# Exécuter le script SQL fourni
psql -h [SUPABASE_HOST] -U [USER] -d [DATABASE] -f contact_messages_table.sql
```

## 🔧 Actions Correctives Appliquées

### Améliorations ChatWidget :
- ✅ Logging détaillé pour diagnostic
- ✅ Gestion d'erreurs améliorée avec toasts
- ✅ Vérification de l'état de la conversation
- ✅ Déduplication des messages

### Améliorations Page de Contact :
- ✅ Logging détaillé Firebase
- ✅ Messages d'erreur spécifiques par code
- ✅ Système de fallback vers Supabase
- ✅ Sauvegarde automatique si Firebase échoue

### Système de Fallback :
- ✅ Table `contact_messages` dans Supabase
- ✅ Fonction `sendContactEmailWithFallback`
- ✅ Transition transparente pour l'utilisateur

## 📊 Monitoring

### Métriques à surveiller :
1. **Taux de succès des messages** (ChatWidget)
2. **Taux d'utilisation du fallback** (Contact)
3. **Erreurs fréquentes** dans les logs
4. **Temps de réponse** des services

### Tests de régression :
1. **Utilisateur connecté** : Envoyer message via chat
2. **Utilisateur non connecté** : Envoyer message via chat
3. **Page contact** : Envoyer avec Firebase actif
4. **Page contact** : Forcer le fallback Supabase

## 🚨 En Cas d'Urgence

Si tous les systèmes échouent :
1. **Contact direct** : Afficher email contact@nomadimmo.org
2. **Notification admin** : Log dans Supabase
3. **Message utilisateur** : "Contactez-nous directement à [email]"

---

**💡 Conseils :**
- Toujours tester avec utilisateur connecté ET non connecté
- Vérifier les logs en temps réel pendant les tests
- Garder les messages d'erreur utilisateur-friendly