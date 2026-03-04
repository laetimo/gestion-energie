# Créer son système de suivi d'énergie - Guide complet

## 🎯 Objectif

Reproduire et améliorer la solution **Picardie Pass Rénovation** (ancienne app "Quartum" ou parfois appelée "Fludia" sur tablette Archos) avec :
- 📱 Tablette Android (afficheur/contrôleur)
- 🔌 Module Linky (lecture consommation électrique)
- 📡 Capteurs Bluetooth (températures, hygrométrie)

---

## 🏗️ Architecture de la solution

```
┌─────────────────────────────────────────────────────────┐
│         TABLEAU DE BORD - Tablette Android              │
│         (Application web ou native)                     │
└──────────┬────────────────────────┬─────────────────────┘
           │                        │
      WiFi │                        │ Bluetooth
           │                        │
     ┌─────▼──────┐         ┌──────▼─────────────┐
     │ Passerelle │         │  Capteurs BT       │
     │   Linky    │         │  - Temp/Hygro      │
     │  (Module)  │         │  - Autres...       │
     └────────────┘         └────────────────────┘
           │
     ┌─────▼──────────┐
     │ Stockage local │
     │ (Base de données)
     └────────────────┘
```

---

## 📊 Composants à mettre en place

### 1️⃣ **Module de lecture Linky**

> **Historique produit**  
> La solution était commercialisée par Quartum sous le nom **Quart Home**.  
> Elle offrait en option la mesure et l'analyse des consommations de gaz.  
> L'ensemble utilisait un capteur électrique nommé **Fludia**, une tablette Archos et des objets connectés.  
> L'application mobile était développée par **Eco CO2**.



#### Option A : Linky via TIC (Télé-Information Client)

Le compteur Linky expose ses données via une **prise TIC** :
- **Port série** : I1 et I2 du compteur
- **Débit** : 2400 bauds
- **Données disponibles** : 
  - Consommation instantanée (en watts)
  - Index de consommation total
  - Puissance
  - Tensions/Intensités

**Matériel nécessaire :**
- Câble USB-série adaptateur TIC → USB
- **Module Wemos D1 mini** ou **Raspberry Pi** (c'est le "module" mentionné)
- Résistances pour convertion de niveau (3.3V ↔ 5V)

**Connecter le Linky :**
```
Compteur Linky (TIC)
    ↓
    I1 (A+) ─── Gnd (via résistance 10kΩ)
    ↓
    I2 (A-) ─── GPIO RX (via résistance série)
    ↓
Module (ESP32/RPi) ─── Tablette (WiFi)
```

#### Option B : TéléInfo via produit commercial

- **Produits existants** : TIC Reader, JEEDOM, TIC Box
- Plus facile, vrai plug-and-play
- ~50-150€

### 2️⃣ **Capteurs Bluetooth**

**Type de capteurs à utiliser :**
- **Mi Temperature & Humidity Monitor** (Xiaomi) - très courant
- **LYWSD03MMC** (Bluetooth Low Energy)
- **Tado** (thermostats intelligents)
- Autres **capteurs BLE** compatibles

**Portée Bluetooth :**
- Jusqu'à **30-100 mètres** selon les modèles
- Peut couvrir une maison entière

### 3️⃣ **Passerelle Bluetooth → WiFi**

La tablette doit pouvoir :
1. Recevoir les données Bluetooth des capteurs
2. Les transmettre au serveur
3. Les afficher en temps réel

**Options :**
- **App Android native** (Kotlin/Java)
- **Progressive Web App** (HTML/CSS/JS)
- **Home Assistant** sur la tablette
- **Node.js** + interface web

---

## 💾 Flux de données proposé

```
Linky (TIC)
    ↓ (Série)
Module (ESP32/RPi) ← collecte consommation
    ↓ (WiFi / MQTT)
Base de données locale ou cloud
    ↓
Application Tablette
    ↓
Affichage en temps réel
```

**Alternatives :**

```
Capteurs Bluetooth
    ↓
Tablette (BLE directe)
    ↓
Application
    ↓
Affichage + Stockage
```

---

## 🛠️ Solutions techniques clé en main

### Solution 1 : **Home Assistant** (Recommandée - la plus simple)

**Avantages :**
- ✅ Gestion Bluetooth native
- ✅ Interface web prête
- ✅ Historique automatique
- ✅ Graphiques
- ✅ Open-source gratuit

**Installation :**
- Installer **Home Assistant** sur la tablette (via Docker ou apk)
- Ajouter **intégration Linky** (via API Enedis)
- Ajouter **capteurs Bluetooth** (auto-découverte)
- Créer **tableaux de bord personnalisés**

**Coût :** Gratuit

---

### Solution 2 : **Développement personnalisé Node.js**

**Stack proposé :**
```
Frontend :
  - React/Vue.js
  - Charts.js pour les graphiques
  - Material Design

Backend :
  - Node.js + Express
  - SQLite (local) ou PostgreSQL
  - Socket.io (temps réel)
  - Noble.js (Bluetooth)

Module Linky :
  - ESP32 + code C/Arduino
  - Ou Raspberry Pi + Python
```

**Architecture :**
```
Tablette Android
  ├─ WebView (Application web)
  └─ Server Node.js (local)

Module Linky
  └─ Envoie données via MQTT/HTTP
```

---

### Solution 3 : **Application Android native**

**Technologie :**
- Kotlin/Java
- Android BLE API
- SQLite local
- Material Design

**Avantages :**
- Performance maximale
- Intégration OS complète
- Pas besoin de serveur

**Inconvénient :**
- Plus à coder

---

## 📋 Plan d'action recommandé

### **Étape 1 : Préparer le matériel** (1-2 jours)
- [ ] Récupérer/identifier le module Linky existant
- [ ] Vérifier qu'il a une interface USB ou WiFi
- [ ] Recalibrer/tester les capteurs Bluetooth
- [ ] Charger et réinitialiser la tablette Android

### **Étape 2 : Choisir la solution** (30 min)
**Je recommande Home Assistant** car :
- Pas de développement nécessaire
- Configuration par interface
- Supporte Linky + Bluetooth
- Visuals sympas

**OU Solution Node.js** si vous voulez plus de flexibilité

### **Étape 3 : Mettre en place Linky** (1-2 jours)
- Accéder aux données TIC du compteur
- Configurer le module pour envoyer les données
- Tester la transmission

### **Étape 4 : Connecter les capteurs** (1 jour)
- Appairer les capteurs Bluetooth
- Vérifier les remontées de données
- Calibrer si nécessaire

### **Étape 5 : Créer le dashboard** (2-3 jours)
- Graphiques de consommation
- Affichage température/hygrométrie
- Alertes si besoin
- Historique

---

## 📲 Données à capturer

### **Du compteur Linky :**
```json
{
  "timestamp": "2026-03-04 10:30:00",
  "puissance_inst": 2345,  // Watts
  "index_total": 12450,    // kWh
  "tension": 230,          // Volts
  "intensite": 10.2,       // Ampères
  "periodes_tarifaires": "HC"  // HC ou HP
}
```

### **Des capteurs Bluetooth :**
```json
{
  "deviceId": "sensor_room1",
  "temperature": 21.5,     // °C
  "humidity": 45,          // %
  "battery": 87,           // %
  "timestamp": "2026-03-04 10:30:00"
}
```

---

## 🔌 Schéma électrique Linky

```
⚠️  ATTENTION - Manipuler avec prudence !

Compteur Linky (TIC sur port I1/I2)
│
├─ I1 (A+) → Résistance 10k → GND
├─ I2 (A-) → Résistance 1k → RX Module
│
Module ESP32/RPi
│
├─ 5V ← Alimentation externe (≠ du compteur)
├─ GND
└─ TX/RX ← Connecté au compteur

WiFi vers routeur/tablette
```

**⚠️ Conseil :** Utilisez un **module USB commercial** type "Linky USB" plutôt que de bricoler si vous n'êtes pas électronicien.

---

## 📚 Ressources par composant

### **Linky + TIC :**
- [Enedis - Linky API](https://enedis.fr/linky-api)
- [JEEDOM Linky Plugin](https://doc.jeedom.com)
- [Project TeleInfo](https://github.com/fredferoc/Teleinfoplayer)

### **Capteurs Bluetooth :**
- [Mi Sensor Plugin](https://github.com/mkedarv/mi-home-sensorkit)
- [Passive BLE Monitor](https://github.com/Ernst79/BLE_gap_scanner)

### **Home Assistant :**
- [Home Assistant on Android](https://www.home-assistant.io)
- [MQTT Integration](https://www.home-assistant.io/integrations/mqtt/)

### **Node.js pour BLE :**
- [Noble.js](https://github.com/abandonware/noble)
- [MQTT.js](https://github.com/mqttjs/MQTT.js)

---

## 💡 Prochaines étapes

**Quelle solution vous tente le plus ?**

1. **Home Assistant** - La plus simple, prête à l'emploi
2. **Node.js + Web** - Plus de contrôle, modulable
3. **App Kotlin/Android** - Meilleure intégration OS

Dites-moi :
- [ ] Avez-vous encore le **module Linky** et ses accessoires ?
- [ ] Quel **modèle de capteurs Bluetooth** avez-vous ?
- [ ] **Combien de capteurs** à gérer ?
- [ ] Préférez-vous une **solution clé en main** ou **du développement** ?

Je peux créer un **prototype fonctionnel** selon votre réponse ! 🚀
