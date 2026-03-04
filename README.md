# ⚡ Gestion d'Énergie - Alternative Picardie Pass Rénovation

**Un système complet et open-source de suivi d'énergie pour votre tablette Android**

Recréez le système de suivi Picardie Pass Rénovation (anciennement commercialisé par Quartum sous le nom *Quart Home*, développé par Eco CO2 et utilisant le capteur électrique **Fludia** avec des objets connectés Archos) avec :
- 📱 **Tablette Android** comme afficheur/contrôleur
- 🔌 **Module Linky** pour la consommation électrique
- 📡 **Capteurs Bluetooth** pour température et hygrométrie
- 🖥️ **Dashboard web** temps réel avec graphiques
- 💾 **Stockage local** des données historiques

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+ ou Docker
- Module Linky avec adaptateur USB/série
- Capteurs Bluetooth (Xiaomi Mi, LYWSD, etc.)
- Tablette Android avec WiFi

### 1. Installation classique (Node.js)

```bash
# Cloner le projet
git clone https://github.com/laetimo/gestion-energie.git
cd gestion-energie

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
# - LINKY_PORT : port du module Linky
# - Autres ports/configurations

# Démarrer le serveur
npm start
```

Le serveur démarre sur `http://localhost:3000`

### 2. Installation avec Docker (recommandé)

```bash
# Créer le conteneur et démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down
```

---

## ⚙️ Configuration

### Module Linky

1. **Identifier le port série** :
   ```bash
   # Linux
   ls /dev/ttyUSB*
   
   # Windows
   Mode COM3 LIST  # Dans Device Manager
   ```

2. **Editer `.env`** :
   ```
   LINKY_PORT=/dev/ttyUSB0
   LINKY_BAUD=2400
   ```

3. **Câblage TIC** (si module USB custom) :
   - Compteur I1 → Module RX (via résistance 1k)
   - Compteur I2 → Module GND
   - Module à la tablette via USB/WiFi

### Capteurs Bluetooth

1. **Modèles supportés** :
   - Xiaomi Mi Temperature & Humidity Monitor
   - LYWSD03MMC
   - Tado (compatible BLE)
   - Autres capteurs BLE génériques

2. **Configuration** :
   ```
   ENABLE_BLUETOOTH=true
   BLE_SCAN_INTERVAL=30000  # Scan toutes les 30s
   ```

3. **Appairage** :
   - Les capteurs sont scannés automatiquement
   - Aucun appairage préalable nécessaire (broadcast)

---

## 📊 Utilisation

### Accès au dashboard

**Depuis votre ordinateur** :
```
http://localhost:3000
```

**Depuis votre tablette** :
```
http://<adresse-IP-serveur>:3000
```

Remplacez `<adresse-IP-serveur>` par l'IP de votre machine (ex: `192.168.1.100`)

### Affichage

- **Puissance instantanée** (watts)
- **Index de consommation** (kWh)
- **Tension et intensité** (V et A)
- **Températures et hygrométrie** pour chaque capteur
- **Graphiques** sur 24h / 3 jours / 7 jours
- **État de connexion** Linky et Bluetooth

---

## 📁 Structure du projet

```
gestion-energie/
├── src/
│   ├── server.js              # Serveur Express principal
│   └── modules/
│       ├── Database.js        # Gestion SQLite
│       ├── LinkyReader.js     # Lecture données Linky
│       └── BluetoothScanner.js # Scan capteurs BLE
├── public/
│   ├── index.html            # Page web
│   ├── style.css             # Styles
│   └── dashboard.js          # Logique client
├── data/
│   └── energy.db            # Base de données (généré)
├── .env.example             # Configuration
├── Dockerfile               # Conteneur Docker
└── docker-compose.yml       # Orchestration
```

---

## 🔧 API REST

### Endpoints principaux

```
GET  /api/health              # Status du serveur
GET  /api/data/current        # Dernières données Linky + capteurs
GET  /api/data/history?hours=24  # Historique (24, 72, 168h)
GET  /api/sensors             # Liste des capteurs détectés
GET  /api/config              # Configuration active
```

### WebSocket (Socket.io)

```javascript
// Connexion temps réel
socket.on('linky:data', (data) => {
  // Puissance instantanée
  console.log(data.puissance_inst); // watts
});

socket.on('ble:data', (sensor) => {
  // Données capteur
  console.log(sensor.temperature); // °C
  console.log(sensor.humidity);    // %
});
```

---

## 🛠️ Troubleshooting

### Le serveur ne démarre pas

```bash
# Vérifier les permissions
sudo chmod 666 /dev/ttyUSB0

# Ou avec Docker
docker-compose logs app
```

### Pas de données Linky

1. Vérifier le **port série** (dmesg | grep ttyUSB)
2. Tester avec minicom/PuTTY :
   ```bash
   minicom -D /dev/ttyUSB0 -b 2400
   ```
3. Vérifier le **câblage TIC**
4. Si ancien module : peut nécessiter adaptation USB-TTL

### Pas de capteurs Bluetooth détectés

1. Vérifier que Bluetooth est **activé** sur la machine
   ```bash
   hciconfig
   ```
2. S'assurer que les capteurs **broadcast** leurs données (mode BLE)
3. Vérifier la **portée** (max 30-100m selon modèle)
4. Activer discovery :
   ```bash
   sudo systemctl restart bluetooth
   ```

### Performance tablette Android

- Réduire `BLE_SCAN_INTERVAL` si données lentes
- Limiter la portée des graphiques
- Utiliser navigateur moderne (Chrome/Firefox)

---

## 📈 Données collectées

### Linky (Compteur électrique)

```json
{
  "timestamp": "2026-03-04 10:30:00",
  "puissance_inst": 2345,    // Watts
  "index_total": 12450000,   // Wh (affichage en kWh)
  "tension": 230,            // Volts
  "intensite": 10.2,         // Ampères
  "periode": "HC"            // Tarification (HC/HP)
}
```

### Capteurs Bluetooth

```json
{
  "deviceId": "4c:65:a8:xx:xx:xx",
  "name": "LYWSD03MMC",
  "type": "BLE",
  "temperature": 21.5,       // °C
  "humidity": 45,            // %
  "battery": 87,             // %
  "rssi": -60,              // Signal (dBm)
  "last_seen": "2026-03-04T10:30:00Z"
}
```

---

## 🔐 Sécurité

- Système **local uniquement** (aucun cloud)
- Pas d'authentification par défaut (réseau privé)
- Pour accès externe : ajouter proxy + authentification

### Exemple avec auth basique

```javascript
// Dans server.js
import basicAuth from 'express-basic-auth';

app.use(basicAuth({
  users: { 'admin': 'password' },
  challenge: true
}));
```

---

## 🚀 Déploiement sur tablette Android

### Option 1 : Serveur local (recommandé)

1. Réinitialiser la tablette (voir [REINITIALISER_TABLETTE.md](REINITIALISER_TABLETTE.md))
2. Installer **Docker/Docker Desktop** sur tablette
3. Cloner ce projet
4. Lancer `docker-compose up`
5. Accéder via Firefox sur la tablette

### Option 2 : Serveur sur PC/Raspberry Pi

1. Installer Node.js ou Docker sur votre serveur
2. Brancher le module Linky au serveur
3. Accéder depuis la tablette via WiFi
4. **Avantage** : Serveur toujours allumé

### Option 3 : App Android native

À développer : wrapper Kotlin/Java qui appelle l'API web

---

## 📚 Ressources

### Linky / TIC
- [ENEDIS - Linky API](https://enedis.fr/linky-api)
- [Téléinfo Spec](https://www.enedis.fr/sites/default/files/pdf/Enedis-NOI-CPL_02E.pdf)
- [Serial Port node.js](https://serialport.io/)

### Bluetooth
- [Noble.js](https://github.com/abandonware/noble)
- [Mi Sensor Protocol](https://github.com/mkedarv/mi-home-sensorkit)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

### Dashboard
- [Chart.js](https://www.chartjs.org/)
- [Socket.io](https://socket.io/)
- [Express.js](https://expressjs.com/)

---

## 📝 Licence

MIT - Libre d'utilisation et de modification

---

## 👨‍💻 Contribution

Les contributions sont bienvenues ! Pour proposer des améliorations :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## ❓ FAQ

**Q: Puis-je utiliser ceci sans module Linky?**
- R: Oui, activez juste les capteurs Bluetooth (`ENABLE_LINKY=false`)

**Q: Est-ce compatible avec d'autres compteurs (Gazpar, etc.)?**
- R: Non actuellement, mais le code est modulable pour ajouter d'autres lecteurs

**Q: Peut-on synchroniser avec un cloud?**
- R: À implémenter : exporter les données via API externe (Grafana, InfluxDB, etc.)

**Q: La tablette doit rester allumée 24/7?**
- R: Non si le serveur est sur un autre appareil (PC, Raspberry Pi, NAS)

---

**Besoin d'aide ?** Ouvrez une issue ou consultez la [documentation complète](./SOLUTION_COMPLETE.md)