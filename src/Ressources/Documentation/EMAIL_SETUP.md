# Configuration EmailJS pour Nomad'immo

## 📧 Installation et Configuration

### 1. Créer un compte EmailJS
1. Rendez-vous sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Créez un compte gratuit
3. Confirmez votre email

### 2. Configurer un service Email SMTP (Hostinger)
1. Dans votre dashboard EmailJS, cliquez sur "Email Services"
2. Cliquez sur "Add New Service" 
3. Sélectionnez **"Custom SMTP Server"**
4. **Essayez ces paramètres Hostinger** (selon votre serveur) :

**Option A - Serveur principal :**
   - **SMTP Server**: `smtp.hostinger.com`
   - **Port**: `587` (TLS recommandé)
   - **Security**: `TLS`

**Option B - Serveur alternatif :**
   - **SMTP Server**: `mail.nomadimmo.org` (votre domaine)
   - **Port**: `587` ou `465`
   - **Security**: `TLS` ou `SSL`

**Option C - Serveur géographique :**
   - **SMTP Server**: `smtp.titan.email` (si vous utilisez Titan Email)
   - **Port**: `587`
   - **Security**: `TLS`

5. **Pour tous** :
   - **Username**: `contact@nomadimmo.org` (email complet)
   - **Password**: Mot de passe de votre email
6. Testez la connexion avec "Test Connection"
7. Notez votre **Service ID** (ex: `service_xhq70h7`) ✅ Déjà configuré

### 3. Créer un template d'email
1. Allez dans "Email Templates"
2. Cliquez sur "Create New Template"
3. Utilisez ce template :

```html
Nouveau message de contact - Nomad'immo

De: {{from_name}}
Email: {{from_email}}
Téléphone: {{phone}}
Sujet: {{subject}}

Message:
{{message}}

---
Ce message a été envoyé depuis le formulaire de contact de nomadimmo.org
Date: {{date}}
```

4. Dans les paramètres du template :
   - **To Email**: `contact@nomadimmo.org`
   - **From Name**: `Nomad'immo - {{from_name}}`
   - **From Email**: `contact@nomadimmo.org` (doit correspondre à votre SMTP)
   - **Reply To**: `{{from_email}}` (email du visiteur pour répondre)
   - **Subject**: `[Contact Nomad'immo] {{subject}}`

5. Notez votre **Template ID** (ex: `template_xyz789`)

### 4. Récupérer votre clé publique
1. Allez dans "Account" > "General"
2. Dans la section "Public Key", copiez votre clé
3. Notez votre **Public Key** (ex: `user_abcdef123456`)

### 5. Mettre à jour la configuration
Ouvrez le fichier `src/lib/emailConfig.js` et remplacez :

```javascript
export const emailConfig = {
  serviceId: 'service_xhq70h7', // ✅ Déjà configuré avec Hostinger SMTP
  templateId: 'votre_template_id_ici', // À remplacer après création du template
  publicKey: 'votre_public_key_ici' // À récupérer dans Account > General
};
```

**Configuration actuelle :**
- ✅ Service ID : `service_xhq70h7` (Hostinger SMTP configuré)
- ⏳ Template ID : À créer et configurer
- ⏳ Public Key : À récupérer dans votre compte EmailJS

## 🏢 Configuration spécifique Hostinger

### Paramètres SMTP Hostinger :
- **Serveur SMTP** : `smtp.hostinger.com`
- **Port SSL** : `465` (recommandé)
- **Port TLS** : `587` (alternative)
- **Authentification** : Oui
- **Username** : Votre email complet (`contact@nomadimmo.org`)
- **Sécurité** : SSL/TLS

### Notes importantes :
- L'email "From" dans EmailJS **doit être** `contact@nomadimmo.org`
- Le "Reply-To" peut être l'email du visiteur pour les réponses
- Activez l'authentification SMTP dans votre panneau Hostinger si nécessaire

## 🧪 Test de fonctionnement

1. Démarrez l'application : `npm run dev`
2. Allez sur la page Contact
3. Remplissez le formulaire et envoyez un message test
4. Vérifiez la réception dans `contact@nomadimmo.org`
5. **Important** : Vérifiez aussi le dossier spam la première fois

## 📊 Monitoring et limites

### Plan gratuit EmailJS :
- 200 emails/mois
- 2 services email
- Templates illimités

### Sécurité :
- Les clés sont publiques (côté client)
- EmailJS gère l'anti-spam
- Limitez le nombre de requêtes si nécessaire

## 🛠 Dépannage

### Erreurs courantes :

#### ❌ **Erreur 412 "EBADNAME smtp.hostinger.com"**
**Problème** : Serveur SMTP Hostinger non reconnu par EmailJS
**Solutions** :
1. **Essayer `mail.nomadimmo.org`** au lieu de `smtp.hostinger.com`
2. **Utiliser `smtp.titan.email`** si vous avez Titan Email
3. **Passer à Gmail** (recommandé) : Plus fiable avec EmailJS
4. **Vérifier dans Hostinger** : Panel > Email > Paramètres SMTP

#### 🔧 **Autres erreurs** :
1. **Service ID invalide** : Vérifiez dans EmailJS dashboard
2. **Template ID invalide** : Vérifiez le nom du template  
3. **Public Key invalide** : Vérifiez dans Account > General
4. **Emails non reçus** : Vérifiez les spams, la configuration du service
5. **Erreur SMTP générale** :
   - Port 465 (SSL) ou 587 (TLS)
   - Username = email complet (`contact@nomadimmo.org`)
   - Mot de passe correct
6. **"From Email" non autorisé** : Doit être identique à votre email SMTP

### Variables du template :
- `{{from_name}}` : Nom du contact
- `{{from_email}}` : Email du contact  
- `{{phone}}` : Téléphone du contact
- `{{subject}}` : Sujet du message
- `{{message}}` : Corps du message
- `{{to_email}}` : Email de destination (contact@nomadimmo.org)

## 🔄 Alternative recommandée : Gmail (Plus fiable)

Si les serveurs SMTP Hostinger continuent à poser problème, utilisez Gmail :

### Configuration Gmail :
1. **Créer un compte Gmail** dédié (ex: `nomadimmo.contact@gmail.com`)
2. **Activer l'authentification à 2 facteurs**
3. **Générer un mot de passe d'application** :
   - Allez dans Paramètres Google > Sécurité
   - "Mots de passe des applications"
   - Sélectionnez "Autre" et nommez "EmailJS"
4. **Dans EmailJS, sélectionnez "Gmail"** au lieu de Custom SMTP
5. **Configurez** :
   - Email : `nomadimmo.contact@gmail.com`
   - Mot de passe : Le mot de passe d'application généré

### Avantages Gmail :
- ✅ Fiabilité maximale avec EmailJS
- ✅ Configuration simple
- ✅ Pas de problèmes DNS
- ✅ Support EmailJS optimal

### Redirection automatique :
Configurez Gmail pour transférer automatiquement vers `contact@nomadimmo.org`

## 🔧 Alternative : Serveur Backend

Si vous préférez une solution serveur, vous pouvez :
1. Créer une API backend (Node.js, PHP, Python)
2. Utiliser un service comme SendGrid, Mailgun, ou AWS SES
3. Configurer un serveur SMTP

Cela nécessite plus de configuration mais offre plus de contrôle et de sécurité.

## ✅ Checklist de configuration

### Étapes terminées :
- [x] ✅ Compte EmailJS créé
- [x] ✅ Service SMTP Hostinger configuré (`service_xhq70h7`)
- [x] ✅ EmailJS installé dans l'application
- [x] ✅ Code d'envoi intégré dans ContactPage.jsx

### Étapes restantes :
- [ ] ⏳ Créer le template d'email avec les bonnes variables
- [ ] ⏳ Récupérer le Template ID et l'ajouter dans `emailConfig.js`
- [ ] ⏳ Récupérer la Public Key et l'ajouter dans `emailConfig.js`
- [ ] ⏳ Tester l'envoi d'un message depuis le formulaire

### Une fois terminé :
Les messages du formulaire de contact arriveront automatiquement dans `contact@nomadimmo.org` ! 🎉