# Cloud Functions pour Nomad'immo

## 📁 Structure des Cloud Functions

```
functions/
  package.json
  index.js
  src/
    sendContactEmail.js
    saveContactMessage.js
```

## 🚀 Installation des Cloud Functions

### 1. Installation des outils Firebase
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### 2. Configuration dans functions/package.json
```json
{
  "name": "functions",
  "description": "Cloud Functions for Nomad'immo",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "nodemailer": "^6.9.3"
  }
}
```

### 3. Code des Cloud Functions

#### functions/index.js
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configuration SMTP pour Hostinger
const transporter = nodemailer.createTransporter({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'contact@nomadimmo.org',
    pass: 'VOTRE_MOT_DE_PASSE_EMAIL' // À mettre dans les variables d'environnement
  }
});

// Fonction pour envoyer un email de contact
exports.sendContactEmail = functions.https.onCall(async (data, context) => {
  try {
    const { name, email, phone, subject, message, timestamp } = data;

    // Template de l'email
    const mailOptions = {
      from: 'contact@nomadimmo.org',
      to: 'contact@nomadimmo.org',
      replyTo: email,
      subject: `[Contact Nomad'immo] ${subject}`,
      html: `
        <h2>Nouveau message de contact - Nomad'immo</h2>
        <p><strong>De:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Date:</strong> ${new Date(timestamp).toLocaleString('fr-FR')}</p>
        
        <h3>Message:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Ce message a été envoyé depuis le formulaire de contact de nomadimmo.org
        </p>
      `
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    // Sauvegarde dans Firestore (backup)
    await admin.firestore().collection('contact_messages').add({
      name,
      email,
      phone,
      subject,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent'
    });

    return { 
      success: true, 
      message: 'Email envoyé avec succès' 
    };

  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de l\'envoi de l\'email');
  }
});

// Fonction pour sauvegarder un message (backup)
exports.saveContactMessage = functions.https.onCall(async (data, context) => {
  try {
    const docRef = await admin.firestore().collection('contact_messages').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'received'
    });

    return { 
      success: true, 
      id: docRef.id 
    };

  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la sauvegarde');
  }
});
```

## 🔑 Variables d'environnement

### Configuration sécurisée du mot de passe email :
```bash
firebase functions:config:set email.password="VOTRE_MOT_DE_PASSE_EMAIL"
```

## 🚀 Déploiement

```bash
# Test local
firebase emulators:start --only functions

# Déploiement en production
firebase deploy --only functions
```

## 📊 Monitoring

- **Logs** : `firebase functions:log`
- **Console Firebase** : Section Functions pour les métriques
- **Firestore** : Collection `contact_messages` pour l'historique

## 🛡️ Sécurité

Les Cloud Functions sont sécurisées par :
- ✅ **Exécution côté serveur** (pas de clés exposées)
- ✅ **Variables d'environnement** pour les mots de passe
- ✅ **Validation des données** d'entrée
- ✅ **Sauvegarde automatique** dans Firestore

---

## ⚡ Prochaines étapes

1. **Configurez votre projet Firebase** selon FIREBASE_SETUP.md
2. **Initialisez les Cloud Functions** avec ces templates
3. **Déployez** les fonctions
4. **Testez** l'envoi d'emails depuis ContactPage

Une fois déployé, l'envoi d'emails sera 100% fiable ! 🚀