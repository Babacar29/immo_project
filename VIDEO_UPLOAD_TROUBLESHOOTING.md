# Guide de Résolution : Upload de Vidéos Longues

## 🎯 Problème : Timeout lors de l'upload de vidéos de 2+ minutes

### ✅ Solutions Implémentées

1. **Timeout Étendu** : 10 minutes au lieu de 30 secondes par défaut
2. **Système de Retry** : 2 tentatives automatiques en cas d'échec
3. **Taille Maximum Augmentée** : 200MB au lieu de 100MB
4. **Meilleur Suivi du Progrès** : Utilisation de XMLHttpRequest
5. **Messages d'Erreur Spécifiques** : Guidance claire selon le type d'erreur

### 🔧 Optimisations Recommandées

#### Pour les Utilisateurs :
1. **Compressez vos vidéos** avant upload :
   - Utilisez HandBrake (gratuit) pour réduire la taille
   - Format recommandé : MP4 avec codec H.264
   - Résolution max recommandée : 1080p
   - Bitrate recommandé : 2-5 Mbps

2. **Connexion Internet** :
   - Utilisez une connexion stable (évitez le WiFi public)
   - Upload de préférence en dehors des heures de pointe
   - Débit minimum recommandé : 10 Mbps en upload

#### Paramètres de Compression Optimaux :
```
Résolution : 1920x1080 (max)
Codec Vidéo : H.264
Codec Audio : AAC
Bitrate Vidéo : 2000-5000 kbps
Bitrate Audio : 128 kbps
Frame Rate : 30 fps (max)
```

### 📊 Limites Actuelles

| Paramètre | Valeur | Note |
|-----------|---------|------|
| Taille Max | 200 MB | Cloudinary gratuit |
| Durée Max | ~10 minutes | Selon qualité |
| Timeout | 10 minutes | Très généreux |
| Retry | 2 tentatives | Automatique |
| Formats | MP4, WebM, MOV, AVI | Recommandé: MP4 |

### 🚨 Dépannage Avancé

#### Erreur "Load failed" / Timeout
1. **Vérifiez la taille** : `console.log(file.size / (1024*1024))` MB
2. **Testez la connexion** : Speedtest.net (besoin >5 Mbps upload)
3. **Compressez la vidéo** : Réduisez qualité/résolution
4. **Essayez à un autre moment** : Évitez les heures de pointe

#### Si le problème persiste :
1. **Format de fichier** : Convertissez en MP4 H.264
2. **Codec audio** : Assurez-vous qu'il soit AAC
3. **Métadonnées** : Supprimez les métadonnées avec un outil comme FFmpeg

### 🔄 Commandes de Compression (optionnel)

#### Avec FFmpeg (ligne de commande) :
```bash
# Compression standard
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4

# Compression agressive (très petite taille)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 96k -vf "scale=1280:720" output.mp4

# Pour vidéos très longues (>5 min)
ffmpeg -i input.mp4 -c:v libx264 -crf 26 -c:a aac -b:a 128k -r 24 output.mp4
```

#### Avec HandBrake (interface graphique) :
1. Preset : "Fast 1080p30"
2. Codec Vidéo : H.264 (x264)
3. Qualité : RF 22-25
4. Audio : AAC, 128 kbps

### 📈 Surveillance et Métriques

Le système log maintenant :
- Temps d'upload total
- Nombre de retry utilisés
- Taille finale vs originale
- Qualité de connexion estimée

### 💡 Conseils Préventifs

1. **Testez avec une vidéo courte** d'abord (30s)
2. **Uploadez pendant les heures creuses** (nuit/matin)
3. **Gardez l'onglet actif** pendant l'upload
4. **Fermez les autres applications** consommatrices de bande passante
5. **Utilisez une connexion filaire** si possible

---

**💬 En cas de problème persistant** : Vérifiez votre upload preset Cloudinary et assurez-vous qu'il accepte les vidéos longues.