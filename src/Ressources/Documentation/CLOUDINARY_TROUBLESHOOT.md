# 🚨 Fix Rapide : Erreur Cloudinary Upload

## Erreur rencontrée
```
Transformation parameter is not allowed when using unsigned upload
```

## ✅ Solution en 3 étapes

### 1. Créer/Configurer l'Upload Preset
1. Allez sur [Cloudinary Dashboard](https://console.cloudinary.com)
2. **Settings** → **Upload** → **Add upload preset**
3. Configurez :
   - **Preset name** : `nomadimmo_videos`
   - **Signing Mode** : **Unsigned** ✅
   - **Folder** : `nomadimmo/property-videos`

### 2. Ajouter les Transformations dans le Preset
Dans l'onglet **"Eager Transformations"** :
- Transformation 1 : `c_scale,w_1280,h_720,q_auto:good`
- Transformation 2 : `c_scale,w_854,h_480,q_auto:good`

### 3. Sauvegarder et Tester
1. **Cliquez sur "Save"**
2. **Redémarrez votre serveur de dev** : `npm run dev`
3. **Testez l'upload** d'une vidéo

## 🔍 Vérification
Si ça marche toujours pas :
1. Vérifiez que le preset s'appelle exactement `nomadimmo_videos`
2. Vérifiez qu'il est bien en mode `Unsigned`
3. Regardez dans la console du navigateur pour d'autres erreurs

## 💡 Pourquoi cette erreur ?
Pour la sécurité, Cloudinary ne permet pas de passer des transformations directement dans les uploads unsigned. Elles doivent être prédéfinies dans l'upload preset.

---

**Status** : ✅ Corrigé dans le code - Testez maintenant !