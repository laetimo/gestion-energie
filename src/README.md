# Architecture du Serveur

## Vue d'ensemble

Le serveur Node.js est organisé en couches :

```
HTTP/WebSocket (Socket.io)
        ↓
   Routes REST
        ↓
  Module Manager
   (Database, Linky, BLE)
        ↓
   Base de données SQLite
   + Ports série/USB
   + Adaptateurs Bluetooth
```

---

## Fichiers principaux

### `server.js`

**Point d'entrée de l'application**

Responsabilités:
- ✅ Créer le serveur Express/http
- ✅ Initialiser Socket.io
- ✅ Setup des routes REST
- ✅ Initialiser les modules (DB, Linky, BLE)
- ✅ Gestion des WebSocket
- ✅ Gestion gracieuse des arrêts (SIGINT)

**Points clés** :
- Import des modules
- Middleware (CORS, JSON)
- Routes `/api/*`
- Événements WebSocket
- Startup sequence

---

## Modules

### `modules/Database.js`

**Gestion de la persistance des données**

**Tables SQLite** :

```sql
-- Données du compteur Linky
CREATE TABLE linky_data (
  id INTEGER PRIMARY KEY,
  timestamp DATETIME,
  puissance_inst INTEGER,    -- watts
  index_total INTEGER,      -- Wh
  tension INTEGER,          -- volts
  intensite REAL,           -- ampères
  periode CHAR(2)           -- HC/HP
);

-- Capteurs Bluetooth
CREATE TABLE sensors (
  id INTEGER PRIMARY KEY,
  device_id TEXT UNIQUE,    -- adresse MAC
  name TEXT,
  type TEXT,                -- "BLE", "WiFi", etc.
  last_seen DATETIME,
  battery_level INTEGER
);

-- Historique des capteurs
CREATE TABLE sensor_data (
  id INTEGER PRIMARY KEY,
  sensor_id INTEGER,
  timestamp DATETIME,
  temperature REAL,         -- °C
  humidity REAL,           -- %
  pressure REAL
);
```

**Méthodes publiques** :
- `init()` - créer les tables
- `recordLinkyData(data)` - enregistrer puissance
- `recordSensorData(deviceId, ...)` - enregistrer capteur
- `getCurrentData()` - dernières données
- `getHistory(hours)` - historique
- `getSensors()` - liste des capteurs
- `getClosed()` - fermer la BD

**Exemple d'utilisation** :
```javascript
const db = new Database();
await db.init();
await db.recordLinkyData({ puissance_inst: 2345, ... });
const current = await db.getCurrentData();
```

---

### `modules/LinkyReader.js`

**Lecture des données du compteur via TIC**

**Flux de données** :
```
Port série (/dev/ttyUSB0)
    ↓
SerialPort + Readline Parser
    ↓
Parser TIC (LABEL VALUE)
    ↓
Validation + Accumulation
    ↓
Base de données + WebSocket
```

**Protocole TIC** :
- Vitesse: 2400 bauds
- Format: `LABEL VALUE CRC`
- Exemples:
  - `ADSC 031528506511 C` (serial)
  - `EAST 001234567 D` (index)
  - `PAPP 002345 A` (puissance)

**Méthodes publiques** :
- `start()` - démarrer la lecture
- `stop()` - arrêter
- `setDatabase(db)` - injecter la BD

**Événements WebSocket émis** :
- `linky:status` - état de connexion
- `linky:data` - nouvelles données

**Exemple d'utilisation** :
```javascript
const linky = new LinkyReader(io);
linky.setDatabase(db);
await linky.start();
```

---

### `modules/BluetoothScanner.js`

**Découverte et lecture des sensors Bluetooth Low Energy**

**Flux** :
```
Adaptateur Bluetooth
    ↓
Discovery d'appareils
    ↓
Filtrage (nom/UUID)
    ↓
Connexion + Lecture GATT
    ↓
Base de données + WebSocket
```

**Appareils supportés** :
- Xiaomi Mi Temperature Humidity Monitor
- LYWSD03MMC
- Autres capteurs BLE generiques

**Méthodes publiques** :
- `start()` - démarrer le scan
- `stop()` - arrêter
- `setDatabase(db)` - injecter la BD

**Événements WebSocket émis** :
- `ble:status` - état adaptateur BLE
- `ble:data` - nouvelles données capteur

**Exemple d'utilisation** :
```javascript
const ble = new BluetoothScanner(io);
ble.setDatabase(db);
await ble.start();
```

---

## Routes REST API

### Données

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Santé du serveur |
| GET | `/api/data/current` | Dernières données |
| GET | `/api/data/history?hours=24` | Historique |
| GET | `/api/sensors` | Capteurs connectés |
| GET | `/api/config` | Configuration active |

### Exemple de réponse

**GET /api/data/current** :
```json
{
  "linky": {
    "id": 123,
    "timestamp": "2026-03-04 10:30:00",
    "puissance_inst": 2345,
    "index_total": 12450000,
    "tension": 230,
    "intensite": 10.2,
    "periode": "HC"
  },
  "sensors": [
    {
      "id": 1,
      "device_id": "4c:65:a8:xx:xx:xx",
      "name": "Salon",
      "type": "BLE",
      "temperature": 21.5,
      "humidity": 45,
      "battery": 87,
      "last_seen": "2026-03-04T10:30:00Z"
    }
  ]
}
```

---

## WebSocket Events

### Envoyés par le serveur (→ client)

```javascript
socket.on('linky:status', { connected: boolean });
socket.on('linky:data', { puissance_inst, index_total, ... });
socket.on('ble:status', { enabled: boolean });
socket.on('ble:data', { deviceId, temperature, humidity, ... });
socket.on('message', 'texte');
```

### Reçus par le serveur (← client)

Actuellement: aucun (lecture seule)

Possibilités futures:
- Commandes de contrôle
- Configuration dynamique
- Alertes personnalisées

---

## Flux de démarrage

```
1. Charger .env
   ↓
2. Initialiser Database
   ├─ Créer les tables SQLite
   └─ ✅ Prêt
   ↓
3. Initialiser LinkyReader
   ├─ Ouvrir port série
   └─ ✅ Émettre linky:status
   ↓
4. Initialiser BluetoothScanner
   ├─ Adaptateur Bluetooth
   ├─ Démarrer scan
   └─ ✅ Émettre ble:status
   ↓
5. Démarrer serveur HTTP
   ├─ Écouter sur PORT
   └─ ✅ Prêt pour clients
   ↓
6. Attendre reqûtes + WebSocket
   ├─ Répondre API
   ├─ Emettre mises à jour
   └─ Enregistrer en BD
```

---

## Gestion des erreurs

Chaque module gère ses erreurs :

```javascript
try {
  // Opération
} catch (error) {
  console.error('❌ Message d\'erreur');
  // Émettre WebSocket
  io.emit('error', { type: 'module', message: error.message });
  // Continuer (ne pas bloquer les autres modules)
}
```

---

## Dépendances clés

| Package | Rôle |
|---------|------|
| `express` | Framework HTTP |
| `socket.io` | WebSocket temps réel |
| `sqlite3` | Base de données |
| `serialport` | Lecture port série (Linky) |
| `noble` | Bluetooth Low Energy |
| `dotenv` | Configuration d'environnement |

---

## Performance

### Optimisations appliquées

1. **Connexion série asynchrone** : Ne bloque pas le serveur
2. **Scan BLE asynchrone** : Interval configurable
3. **Base de données locale** : Pas de latence réseau
4. **WebSocket** : Push des données (pas polling)
5. **INDEX SQL** : Sur timestamp et device_id

### Métriques

- ⚡ Latence API : < 50ms
- 📊 Graphique 24h : ~1500 points
- 🔋 RAM utilisée : ~80-150 MB
- 💾 Base de données : ~100KB/jour

---

## Extension du code

### Ajouter un nouveau capteur

1. Créer `modules/MonCapteur.js`
2. Implémenter interface :
   ```javascript
   class MyCapteur {
     constructor(io) { this.io = io; }
     setDatabase(db) { this.db = db; }
     async start() { /* ... */ }
     stop() { /* ... */ }
   }
   ```
3. L'intégrer dans `server.js`

### Ajouter une nouvelle table

1. Éditer `Database.js` - méthode `init()`
2. Ajouter CREATE TABLE et drop condition
3. Ajouter getters/setters
4. Émettre depuis le module

---

## Débogage

### Logs détaillés

```bash
# Tous les console.log/error s'affichent
npm start

# Ou rediriger dans un fichier
npm start > server.log 2>&1
tail -f server.log
```

### Vérifier les connexions

```bash
# Port série
lsof -i :3000            # Port HTTP
ls /dev/ttyUSB*          # Port Linky
hciconfig                # Adaptateur BLE
```

### Profiling

Ajouter dans server.js :
```javascript
console.time('startup');
// ... code
console.timeEnd('startup');  // Affiche le temps écoulé
```

---

## Ressources

- [Express.js Docs](https://expressjs.com/)
- [Socket.io Docs](https://socket.io/docs/)
- [SQLite3 npm](https://github.com/TryGhost/node-sqlite3)
- [SerialPort npm](https://serialport.io/)
- [Noble.js](https://github.com/abandonware/noble)

---

**Besoin de comprendre une partie spécifique?** Lisez le code source commenté ou consultez les docs des dépendances! 🚀
