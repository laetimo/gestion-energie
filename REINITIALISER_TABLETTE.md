# Guide de Réinitialisation de la Tablette Android - Picardie Pass Rénovation

## 📋 Contexte

Votre tablette Android fournie par **Picardie Pass Rénovation** est verrouillée sur l'ancienne application de suivi d'énergie. Ce guide vous explique comment la réinitialiser pour la réutiliser.

---

## ✅ Avant de commencer

- **Chargez complètement la tablette** (très important pour éviter les interruptions)
- **Sauvegardez toute donnée importante** car elle sera complètement effacée
- Notez le **numéro exact du modèle** (souvent au dos : Samsung, Lenovo, etc.)
- **Du temps** : l'opération peut prendre 20-30 minutes

---

## 🔄 Méthode 1 : Réinitialisation simple (si accessible)

### Via les paramètres Android

1. Ouvrez **Paramètres**
2. Allez dans **Système** (ou **À propos du téléphone**)
3. Cherchez **Options de réinitialisation** ou **Réinitialiser**
4. Sélectionnez **"Réinitialiser aux paramètres d'usine"** ou **"Effacer toutes les données"**
5. Confirmez et entrez votre **code PIN/mot de passe** si demandé
6. Attendez la réinitialisation (quelques minutes)
7. La tablette redémarrera et proposera une configuration initiale

⚠️ **Attention** : Cette méthode peut vous demander le compte Google associé après le redémarrage (FRP - Factory Reset Protection)

---

## 🔧 Méthode 2 : Recovery Mode (si bloquée)

### Accès au Recovery Mode avec les touches

1. **Éteignez complètement** la tablette
2. **Maintenez les boutons** simultanément (selon le modèle) :
   - **Samsung** : `Power + Volume Down`
   - **Lenovo** : `Power + Volume Up`
   - **Autres** : Essayez `Power + Volume Down` ou consultez le manuel
3. Attendez **10-15 secondes** jusqu'à voir le logo du fabricant
4. **Relâchez** les boutons
5. Naviguez avec les **touches de volume** pour monter/descendre
6. Appuyez sur **Power** pour sélectionner
7. Cherchez l'option **"Wipe data/factory reset"** ou **"Effacer les données"**
8. Confirmez et attendez

---

## 🖥️ Méthode 3 : ADB (Android Debug Bridge)

### Sur votre ordinateur

#### Installer ADB

**Linux/Mac :**
```bash
# Linux
sudo apt-get install android-tools-adb

# Mac
brew install android-platform-tools
```

**Windows :**
- Téléchargez : https://developer.android.com/tools/adb
- Ou via Chocolatey : `choco install adb`

#### Utiliser ADB

1. **Connectez la tablette** en USB à votre ordinateur
2. **Activez le débogage USB** sur la tablette :
   - Allez dans `Paramètres > À propos > Numéro de build`
   - Appuyez 7 fois rapidement sur "Numéro de build"
   - Retournez en arrière et cherchez `Options de développeur`
   - Activez `Débogage USB`
3. **Confirmez** la connexion USB sur la tablette
4. Sur votre ordinateur, ouvrez un terminal et lancez :

```bash
# Vérifier la connexion
adb devices

# Redémarrer en mode recovery
adb reboot recovery

# OU réinitialiser directement
adb shell wipe data
adb shell wipe cache
adb reboot
```

---

## ⚡ Méthode 4 : FastBoot (accès au bootloader)

### Pour réinitialisation avancée

```bash
# Redémarrer en bootloader
fastboot reboot bootloader

# Effacer les données utilisateur
fastboot erase userdata

# Effacer le cache
fastboot erase cache

# Redémarrer
fastboot reboot
```

---

## 🚨 Si complètement verrouillée : Flasher la ROM

### Pour les cas extrêmes

1. **Téléchargez la ROM officielle** du fabricant :
   - **Samsung** : SmartSwitch ou findmymobile.samsung.com
   - **Lenovo** : support.lenovo.com
   - **Autres marques** : site officiel du constructeur

2. **Installez l'outil de flashage** :
   - **Samsung** : [Odin](https://odin3download.com/)
   - **Autres** : [TWRP](https://twrp.me/) (dépend du modèle)

3. **Suivez le guide spécifique** à votre modèle (très technique)

---

## 🔐 Après la réinitialisation : Bypass FRP (si bloqué par compte Google)

### Si vous êtes demandé un compte Google

**Option 1 : Vous avez l'accès**
- Entrez simplement vos identifiants Google

**Option 2 : Compte oublié ou inconnu**
- Essayez : `gmail.com`  /  `password` (ancien compte par défaut)
- Contact le **support Samsung/fabricant** avec preuve d'achat
- Utilisez une **clé USB OTG** pour transférer les fichiers et contourner FRP

---

## 📱 Après réussite : Configuration initiale

1. ✅ Démarrage complété
2. Créez un **compte Google personnel** (optionnel)
3. Connectez-vous au **WiFi**
4. Installez les **mises à jour système**
5. Votre tablette est prête à être réutilisée ! 🎉

---

## 📞 Besoin d'aide ?

| Problème | Solution |
|----------|----------|
| Écran figé | Maintenez Power 30 sec pour forcer l'arrêt |
| Not found ou erreur ADB | Activez le débogage USB, reconnectez le câble |
| Reste sur logo de démarrage | Laissez passer 5 min, puis réessayez |
| FRP Google bloquée | Contactez le fabricant ou utilisez **FRP bypass** |
| Batterie faible pendant opération | Rechargez et recommencez |

---

## 🔗 Ressources utiles

- [Android Recovery Mode](https://support.google.com/android/answer/6008563)
- [ADB Documentation](https://developer.android.com/tools/adb)
- [TWRP Recovery](https://twrp.me/)
- Support par marque :
  - [Samsung Support](https://www.samsung.com/fr/support/)
  - [Lenovo Support](https://support.lenovo.com/fr/)

---

**Bonne chance ! 🚀** Une fois réinitialisée, votre tablette sera comme neuve et prête pour vos projets de suivi d'énergie. 💡
