# Guide Complet : Configuration Cloudinary pour NomadImmo

## 🚀 Étapes de Configuration

### 1. Création du compte Cloudinary (Gratuit)

1. **Allez sur** [cloudinary.com](https://cloudinary.com)
2. **Cliquez sur** "Sign Up for Free"
3. **Remplissez** le formulaire d'inscription
4. **Confirmez** votre email
5. **Accédez** à votre Dashboard

### 2. Récupération des clés API

Dans votre Dashboard Cloudinary :
1. **Notez** ces informations importantes :
   - **Cloud Name** : `your_cloud_name`
   - **API Key** : `123456789012345`
   - **API Secret** : `your_api_secret` (gardez-le secret !)

### 3. Configuration Upload Preset (IMPORTANT!)

1. **Allez dans** Settings → Upload
2. **Cliquez sur** "Add upload preset"
3. **Configurez** :
   - **Preset name** : `nomadimmo_videos`
   - **Signing Mode** : `Unsigned` (important pour les uploads depuis le frontend)
   - **Folder** : `nomadimmo/property-videos`
   
4. **Dans l'onglet "Media Analysis and AI"** :
   - **Quality** : `Auto`
   - **Format** : `Auto`
   
5. **Dans l'onglet "Eager Transformations"** (pour l'optimisation automatique) :
   - **Cliquez sur** "Add eager transformation"
   - **Ajoutez** : `c_scale,w_1280,h_720,q_auto:good`
   - **Cliquez sur** "Add eager transformation" à nouveau
   - **Ajoutez** : `c_scale,w_854,h_480,q_auto:good` (pour mobile)

6. **Sauvegardez**

⚠️ **IMPORTANT** : Les transformations doivent être configurées dans l'upload preset, pas dans le code, pour les uploads unsigned.

### 4. Configuration des variables d'environnement

Modifiez votre fichier `.env` :

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_API_KEY=your_api_key_here  
VITE_CLOUDINARY_API_SECRET=your_api_secret_here
```

**⚠️ Important :** Remplacez `your_cloud_name_here`, etc. par vos vraies valeurs.

### 5. Installation des dépendances

```bash
npm install @radix-ui/react-tabs @radix-ui/react-progress
```

## 🎯 Utilisation

### Upload de vidéos
1. **Ouvrez** le formulaire d'ajout de propriété
2. **Sélectionnez** l'onglet "Upload direct"
3. **Glissez-déposez** votre vidéo ou cliquez pour sélectionner
4. **Attendez** l'upload et l'optimisation automatique
5. **L'URL** est automatiquement renseignée

### Avantages de cette solution

✅ **25 GB gratuit** pour commencer
✅ **Optimisation automatique** des vidéos
✅ **CDN mondial** pour une lecture rapide
✅ **Compression intelligente** selon l'appareil
✅ **Thumbnails automatiques**
✅ **Support multi-format** (MP4, WebM, MOV, AVI)
✅ **Interface intuitive** avec drag & drop

## 📊 Comparaison des solutions

| Solution | Stockage | Bande passante | Coût | Contrôle | CDN |
|----------|----------|----------------|------|----------|-----|
| **Cloudinary** | 25GB | 25GB/mois | Gratuit | ✅ Total | ✅ Mondial |
| **Streamable** | 10GB | Illimité | Gratuit | ⚠️ Limité | ✅ Oui |
| **Internet Archive** | Illimité | Illimité | Gratuit | ⚠️ Basique | ❌ Non |
| **YouTube** | Illimité | Illimité | Gratuit | ❌ Aucun | ✅ Google |
| **Vimeo** | 500MB/semaine | Illimité | Gratuit | ⚠️ Limité | ✅ Oui |

## 🔧 Dépannage

### Erreur "Configuration Cloudinary manquante"
- Vérifiez que vos variables d'environnement sont correctement configurées
- Redémarrez votre serveur de développement après modification du .env

### Upload qui échoue
- Vérifiez que l'upload preset est bien configuré en "Unsigned"
- Vérifiez la taille du fichier (max 100MB)
- Vérifiez le format (MP4, WebM, MOV, AVI supportés)

### Vidéo ne se charge pas
- Vérifiez l'URL générée par Cloudinary
- Testez l'URL directement dans un navigateur

## 📈 Mise à l'échelle

Quand vous dépasserez les limites gratuites :
- **Cloudinary Pro** : 40€/mois pour 100GB
- **Alternatives** : Bunny Stream, AWS S3 + CloudFront
- **Optimisation** : Compression plus agressive, résolutions multiples

---

**💡 Recommandation :** Commencez avec Cloudinary gratuit, c'est la solution la plus complète et professionnelle pour débuter !