# Application Android Kotlin - Gestion Énergie

Ce dossier contient un projet Android minimal en Kotlin qui peut servir de base pour
une application native de suivi d'énergie.

## 📱 But

- Fournir une interface mobile native affichant le dashboard Node.js précédemment développé.
- Permettre l'accès direct aux ressources matérielles de la tablette (Bluetooth, USB).
- Être livré sur une tablette Archos (ou toute autre Android 6.0+).

## 🛠️ Installation

### Prérequis

- Android Studio (version 2023+ recommandée)
- SDK Android (API 33 ou supérieur)
- Kotlin plugin (inclus dans Android Studio)

### Ouvrir le projet

1. Lancez Android Studio.
2. Choisissez **Open an existing project** et sélectionnez le dossier `android-app`.
3. Laissez Android Studio synchroniser Gradle et télécharger les dépendances.

### Exécuter

- Branchez votre tablette Archos en mode développeur ou lancez un émulateur.
- Appuyez sur **Run** (ou `Shift+F10`).
- L'application s'installera et démarrera.

## 🔧 Architecture initiale

- `MainActivity.kt` : activité principale qui contient un `WebView`.
- `AndroidManifest.xml` : permissions nécessaires (Internet, Bluetooth, localisation, USB).
- `build.gradle` (niveau application) : configuration Kotlin, dépendances BLE/USB.
- `activity_main.xml` : layout simplifié avec un unique `WebView`.

## 🔗 Chargement du dashboard

La WebView pointe par défaut vers `http://10.0.2.2:3000` (adresse de l'hôte depuis
l'émulateur). Changez l'URL pour l'IP de votre serveur si nécessaire.

Pour une installation autonome, vous pouvez imbriquer les fichiers `public/` dans
un asset local et charger `file:///android_asset/index.html`.

## 📶 Ajout de fonctionnalités natives

- 📡 **Bluetooth** : utiliser l'API Android BLE ou une librairie comme [Nordic BLE](https://github.com/NordicSemiconductor/Android-BLE-Library).
- 🔌 **USB / Série** : bibliothèque [usb-serial-for-android](https://github.com/mik3y/usb-serial-for-android).
- ⚙️ **Interactions** : contacts du serveur Node.js via WebSocket ou HTTP.

## 📝 Permissions

L'appli demande :

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Android 12+ requiert également `BLUETOOTH_SCAN` et `BLUETOOTH_CONNECT` (ajoutez-les si besoin).

## 📸 Captures d'écran (emplacement)
Vous pouvez placer des captures dans `app/src/main/res/drawable/` et les référencer dans
la mise en page.

## ⚠️ Notes

- Cette application est un squelette ; elle ne lit pas encore les données Linky ou BLE.
- Pour rendre l'application totalement autonome, implémentez la logique de lecture
  (port série/USB et BLE) directement dans l'activité ou dans des services.

## 🛣️ Prochaines étapes possibles

1. **Lecture série** : ajouter gestion de l'USB pour récupérer le flux TIC Linky.
2. **Scan BLE** : intégrer la librairie Nordic et parser les capteurs Xiaomi.
3. **Stockage local** : SQLite ou Room pour conserver l'historique.
4. **Notifications** : push en cas d'alerte (puissance élevée, température).
5. **Widgets** : créer un widget Android montrant les dernières mesures.

---

Cette base est prête pour un développement plus poussé. Vous pouvez l'intégrer à votre
service ou la publier sur un store privé pour déployer sur votre tablette.
