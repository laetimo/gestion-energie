# Guide Avancé - Personnalisation et Extension

## 🧠 Comprendre le code et l'architecture

Si vous êtes novice, voici l'explication simplifiée des différents éléments et de leurs interactions :

### 🍃 Vue d'ensemble

Le système est divisé en deux grandes parties :

1. **Le cœur Node.js** (dans `src/`) qui fait trois choses :
   - communique avec le compteur Linky (port série)
   - scanne les capteurs Bluetooth
   - expose une API HTTP + WebSocket pour fournir les données au tableau de bord

2. **L'interface Web** (dans `public/`) qui affiche ces données dans le navigateur via une page HTML/JS.

Sur votre tablette ou ordinateur, vous ouvrez un navigateur et tapez l'adresse du serveur (ex. `http://192.168.1.100:3000`). Le navigateur demande les données au serveur et reçoit des mises à jour en direct grâce à Socket.io.

```
Linky module  ---┐
                 ↓               ┌→ base de données SQLite
Bluetooth module -┤ serveur Node ─┤
                 ↑               └→ WebSocket events
Tablette/PC      └→ HTTP API
```

### 🔌 Modules Node.js

- **Database.js** : gère la création et les requêtes des tables SQLite. On l'appelle quand on veut stocker ou lire les mesures.
- **LinkyReader.js** : ouvre le port série (`/dev/ttyUSB0`), lit les lignes envoyées par le compteur et traduit les labels (PAPP, EAST...) en valeurs numériques. Après chaque lecture, il envoie les données à la base et via WebSocket `io.emit('linky:data', data)`.
- **BluetoothScanner.js** : initialise l'adaptateur BLE, effectue un scan périodique, filtre par nom de capteur, et simule (ou lit) la température/humidité. Les mesures sont envoyées à la base et via `io.emit('ble:data', sensor)`.

### 🧩 Comment sont liées les parties entre elles ?

1. `src/server.js` importe et instancie les modules.
2. Il crée le serveur Express et un serveur Socket.io (`io`).
3. Après l'initialisation de la base (`db.init()`), il passe cette instance aux deux modules (`linkyReader.setDatabase(db)` et `bluetoothScanner.setDatabase(db)`).
4. Quand un module lit une donnée, il appelle `db.record...` puis `io.emit(...)`.
5. Le client Web (navigateur) se connecte à Socket.io et reçoit ces événements en temps réel, déclenchant les fonctions de mise à jour graphique.

### 💻 Interface Web (public/)

- `index.html` définit la structure des cartes (Linky, capteurs, graphiques).
- `style.css` donne les couleurs et le layout responsive.
- `dashboard.js` contient la logique :
  - il ouvre une connexion Socket.io (`const socket = io();`)
  - il définit des « listeners » pour les événements (`socket.on('linky:data', updateLinkyDisplay);`)
  - il met à jour les graphiques Chart.js et les éléments DOM.
  - il fait aussi des requêtes régulières à l'API (`/api/data/history`) pour afficher l'historique.

### ⚙️ Déploiement sur la tablette (pas à pas)

#### **Option A : serveur Node.js sur PC/Raspberry Pi + tablette accédant en WiFi**

1. **Préparer le serveur** (PC ou Raspberry Pi) : clonez le repo, installez Node, lancez `npm install` et `npm start` ou `docker-compose up`.
2. Vérifiez que le module Linky est branché au serveur et fonctionne (brancher au port USB, exécuter `minicom` pour voir les flux).
3. Sur la tablette Archos, mettez-la dans le même réseau WiFi que le serveur.
4. Ouvrez le navigateur (Chrome/Firefox) sur la tablette.
5. Tapez l'IP du serveur + :3000, par exemple `http://192.168.0.50:3000`.
6. Le tableau de bord devrait s'afficher, avec les données en direct.

> **Note** : si le serveur est derrière un pare‑feu, autorisez le port 3000.

#### **Option B : serveur installé directement sur la tablette (Termux)**

Lancer le serveur sur la tablette permet de n'utiliser qu'un seul appareil. Termux expose un environnement Linux allégé, parfait pour exécuter Node.js.

1. **Installer Termux**
   - Téléchargez depuis **F-Droid** (la version Play Store est souvent cassée).
   - Accordez les permissions de stockage si demandées.

2. **Préparer l'environnement**
   ```bash
   pkg update && pkg upgrade          # mettre à jour les paquets
   pkg install git nodejs
   ```
   - `node` et `npm` seront disponibles comme sur un PC.

3. **Récupérer le projet**
   ```bash
   cd $HOME
   git clone https://github.com/laetimo/gestion-energie.git
   cd gestion-energie
   npm install
   ```

4. **Configurer**
   - Copiez l'exemple : `cp .env.example .env`
   - Éditez `.env` avec `nano` ou `vim`.
     ```
     LINKY_PORT=/dev/ttyUSB0    # si module branché via câble OTG
     ENABLE_BLUETOOTH=true
     ```
   - Si vous utilisez un adaptateur Bluetooth USB, Termux le verra comme `/dev/ttyUSB*` également.

5. **Branchement matériel**
   - Branchez le module Linky sur la tablette via un câble USB-OTG.
   - En cas de doute, tapez `ls /dev/tty*` pour voir le port.
   - Assurez-vous que la tablette est en **mode développeur** et autorise les connexions USB.

6. **Lancer le serveur**
   ```bash
   node src/server.js
   # ou : npm start
   ```
   - Les logs s'affichent dans Termux.
   - Vérifiez la présence de `📊 Serveur démarré sur http://localhost:3000`.

7. **Accéder au dashboard**
   - Ouvrez Firefox/Chrome sur la tablette et pointez sur `http://localhost:3000`.
   - Le tableau de bord fonctionne entièrement hors réseau.

8. **Autocollants pratiques**
   - Pour laisser tourner en arrière-plan, utilisez `termux-wake-lock` pour empêcher la mise en veille.
   - Pour démarrer automatiquement après redémarrage, ajoutez la commande dans `~/.bashrc` ou un script `termux-boot`.

> **Alternative** : si votre Archos ne supporte pas USB-OTG, branchez le module Linky sur un petit Raspberry Pi (portable) et laissez Termux sur la tablette pointer vers l’IP du Pi.


#### **Option C : application Android native**

L'application Kotlin sert de conteneur natif : elle affiche la version web dans une WebView mais peut évoluer en solution complètement autonome.

1. **Projet Android Studio**
   - Le dossier `android-app/` contient le projet.
   - `MainActivity.kt` hérite de `AppCompatActivity` et charge un `WebView`.
   - Les dépendances gèrent WebKit (WebView), BLE et USB.

2. **Permissions et compatibilité**
   - Android 6+ : les permissions BLE (localisation) sont demandées à l'exécution.
   - Android 12+ : ajoutez `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT` si nécessaire.

3. **WebView**
   - Chargement initial : `webView.loadUrl("http://10.0.2.2:3000")`.
   - En production, remplacez par l'IP du serveur ou un fichier local.
   - Pour une appli totalement offline, copiez les fichiers `public/*` dans `app/src/main/assets/` et utilisez `webView.loadUrl("file:///android_asset/index.html")`.

4. **Communication native → Node.js**
   - Le `WebView` peut exécuter du JavaScript via `webView.evaluateJavascript(...)`.
   - Vous pouvez également définir une interface JavaScript (`webView.addJavascriptInterface`) pour que JS appelle du code Kotlin.

5. **Accès matériel (BLE, USB)**
   - BLE : utilisez la bibliothèque Nordic pour scanner et lire les capteurs directement sans serveur.
   - USB série : la bibliothèque `usb-serial-for-android` permet d'ouvrir le port TIC et de lire les trames.
   - Implémentez ces lectures dans des services ou `ViewModel` et mettez à jour la page Web via l’interface JS ou un simple endpoint HTTP interne.

6. **Déploiement**
   - Branchez la tablette, activez le débogage USB (Paramètres → Options pour les développeurs).
   - Dans Android Studio, sélectionnez l'appareil et cliquez sur **Run**.
   - Un APK sera installé et l’application démarrera automatiquement.

7. **Mise à jour**
   - Pour distribuer aux autres tablettes Archos, générez un APK signé (`Build > Generate Signed Bundle / APK`).
   - Vous pouvez side-loader l’APK via USB ou héberger sur un serveur privé.

8. **Extension future**
   - Ajouter un écran de configuration pour l’adresse du serveur ou activer « mode autonome ».
   - Stocker localement les données dans Room et les synchroniser avec la base SQLite du serveur si nécessaire.

---

Ces deux sections enrichissent l’explication ; elles donnent également une feuille de route pour transformer l’app en solution complète Android. Vous souhaitez que je développe un exemple de code pour lire le flux Linky via USB dans l’app Kotlin, ou un script Termux plus automatisé ?
#### **Option C : application Android native**

1. Suivez le README du dossier `android-app` pour ouvrir et compiler avec Android Studio.
2. Branchez la tablette Archos en USB et activez le mode développeur (Paramètres → Options pour les développeurs → Débogage USB).
3. Lancez l'application depuis Android Studio, elle s'installera sur la tablette.
4. Au lancement, l'appli affiche un WebView pointant vers `http://10.0.2.2:3000` (pour l'émulateur) ; remplacez l'URL par l'adresse de votre serveur (ou `http://localhost:3000` si le serveur est sur la tablette via Termux).
5. Donnez les permissions lorsque l'appli les demande (localisation/Bluetooth).

Pour aller plus loin, vous pouvez coder la lecture BLE et USB directement dans l’appli, ce que nous pourrons faire ensemble si vous souhaitez.

---

Cette section devrait vous donner une base claire et guidée pour comprendre l’architecture et déployer étape‑par étape. Si vous avez besoin d’une feuille de route plus visuelle ou de commentaires dans le code, je peux également vous aider à annoter les fichiers source. Voulez-vous que je rajoute des commentaires explicatifs dans `src/server.js` ou ailleurs ?

### Structure du serveur

**src/server.js** - Point d'entrée
- Initialise Express, Socket.io, les modules
- Définit les routes REST

**src/modules/Database.js** - Gestion des données
- Tables SQLite
- Méthodes d'enregistrement/récupération
- À étendre pour ajouter d'autres capteurs

**src/modules/LinkyReader.js** - Lecture Linky
- Connecte au port série
- Parse les données TIC
- Envoie via Socket.io

**src/modules/BluetoothScanner.js** - Scan Bluetooth
- Découverte d'appareils
- Traitement des données BLE

### Structure du front-end

**public/index.html** - Interface
- Layout des cartes
- Sections Linky, Capteurs, Graphiques

**public/style.css** - Styling
- Design responsive
- Thème couleur personnalisable

**public/dashboard.js** - Logique client
- Socket.io WebSocket
- Mise à jour des graphiques
- Formatage des données

---

## 📊 Ajouter un nouveau capteur Bluetooth

### Cas d'usage : Capteur Xiaomi LYWSD03MMC

1. **Identifier le capteur** :
   ```bash
   sudo hcitool lescan
   # Vous verrez:
   # 4C:65:A8:XX:XX:XX LYWSD03MMC
   ```

2. **Adapter BluetoothScanner.js** :
   ```javascript
   if (name && name.includes('LYWSD03MMC')) {
     const temp = await readCharacteristic(device, 'temp_uuid');
     const humid = await readCharacteristic(device, 'humidity_uuid');
     this.recordSensorData({
       deviceId: address,
       name: 'Chambre',
       temperature: temp,
       humidity: humid,
       battery: 100
     });
   }
   ```

3. **Enregistrer dans la DB** : 
   Déjà géré par `recordSensorData()`

4. **Afficher sur le dashboard** :
   `public/dashboard.js` - Déjà géré par `updateSensorDisplay()`

---

## 🌐 Ajouter une API externe

### Exemple : Envoyer les données à InfluxDB

1. **Installer le client** :
   ```bash
   npm install @influxdata/influxdb-client
   ```

2. **Créer un module** - `src/modules/InfluxExporter.js` :
   ```javascript
   import { InfluxDB, Point } from '@influxdata/influxdb-client';
   
   class InfluxExporter {
     constructor() {
       this.client = new InfluxDB({
         url: 'http://localhost:8086',
         token: process.env.INFLUX_TOKEN,
         org: process.env.INFLUX_ORG,
         bucket: process.env.INFLUX_BUCKET
       });
     }

     async writeLinkyData(data) {
       const point = new Point('linky')
         .intField('puissance_inst', data.puissance_inst)
         .intField('index_total', data.index_total)
         .tag('periode', data.periode)
         .timestamp(new Date());
       
       // Écrire dans InfluxDB
       await this.write(point);
     }

     async write(point) {
       const writeApi = this.client.getWriteApi(
         process.env.INFLUX_ORG,
         process.env.INFLUX_BUCKET
       );
       writeApi.writePoint(point);
       await writeApi.flush();
     }
   }

   export default InfluxExporter;
   ```

3. **Intégrer dans server.js** :
   ```javascript
   import InfluxExporter from './modules/InfluxExporter.js';
   
   const influx = new InfluxExporter();
   
   // Émettre quand données Linky reçues
   io.on('linky:data', (data) => {
     influx.writeLinkyData(data);
   });
   ```

---

## 📈 Créer des graphiques personnalisés

### Ajouter un graphique de consommation quotidienne

1. **Ajouter une API** - `src/server.js` :
   ```javascript
   app.get('/api/data/daily', async (req, res) => {
     const data = await db.getDailyConsumption();
     res.json(data);
   });
   ```

2. **Implémenter dans Database.js** :
   ```javascript
   getDailyConsumption() {
     return new Promise((resolve, reject) => {
       this.db.all(
         `SELECT 
           DATE(timestamp) as day,
           AVG(puissance_inst) as avg_power,
           MAX(puissance_inst) as max_power,
           COUNT(*) as nb_measures
          FROM linky_data
          WHERE timestamp > datetime('now', '-30 days')
          GROUP BY DATE(timestamp)
          ORDER BY day DESC`,
         (err, rows) => {
           if (err) reject(err);
           else resolve(rows || []);
         }
       );
     });
   }
   ```

3. **Ajouter dans le HTML** - `public/index.html` :
   ```html
   <section class="card">
     <h2>Consommation quotidienne</h2>
     <canvas id="dailyChart"></canvas>
   </section>
   ```

4. **Créer le graphique** - `public/dashboard.js` :
   ```javascript
   async function loadDailyChart() {
     const response = await fetch('/api/data/daily');
     const data = await response.json();
     
     const ctx = document.getElementById('dailyChart').getContext('2d');
     new Chart(ctx, {
       type: 'bar',
       data: {
         labels: data.map(d => d.day),
         datasets: [{
           label: 'Puissance moyenne (W)',
           data: data.map(d => d.avg_power),
           borderColor: '#667eea'
         }]
       }
     });
   }
   ```

---

## 🔔 Ajouter des alertes

### Exemple : Alerte si puissance > 3000W

1. **Créer un service d'alertes** - `src/modules/AlertService.js` :
   ```javascript
   class AlertService {
     constructor(io) {
       this.io = io;
       this.thresholds = {
         maxPower: 3000,
         minTemp: 10,
         maxTemp: 30
       };
     }

     checkLinkyAlert(data) {
       if (data.puissance_inst > this.thresholds.maxPower) {
         this.sendAlert({
           type: 'power_high',
           message: `⚠️ Consommation élevée: ${data.puissance_inst}W`,
           severity: 'warning',
           data: data
         });
       }
     }

     checkSensorAlert(sensor) {
       if (sensor.temperature < this.thresholds.minTemp) {
         this.sendAlert({
           type: 'temp_low',
           message: `❄️ Température basse chez ${sensor.name}: ${sensor.temperature}°C`,
           severity: 'info',
           data: sensor
         });
       }
     }

     sendAlert(alert) {
       // Envoyer aux clients WebSocket
       this.io.emit('alert', alert);
       
       // Logger
       console.warn(`[ALERT] ${alert.message}`);
       
       // Sauvegarder en base si nécessaire
       // await db.recordAlert(alert);
     }
   }

   export default AlertService;
   ```

2. **Intégrer** dans `server.js` et utiliser :
   ```javascript
   const alertService = new AlertService(io);
   
   socket.on('linky:data', (data) => {
     alertService.checkLinkyAlert(data);
   });
   ```

---

## 🔒 Ajouter une authentification

### Authentification basique

```bash
npm install express-basic-auth
```

**Dans server.js** :
```javascript
import basicAuth from 'express-basic-auth';

const users = {
  'admin': process.env.AUTH_PASSWORD || 'password'
};

app.use(basicAuth({
  users: users,
  challenge: true,
  realm: 'Gestion Énergie'
}));
```

### Authentification avec JWT

```bash
npm install jsonwebtoken
```

Voir documentation : https://github.com/auth0/node-jsonwebtoken

---

## 📤 Exporter les données

### Exporter en CSV

```javascript
app.get('/api/export/csv', async (req, res) => {
  const data = await db.getHistory(168); // 7 jours
  
  let csv = 'timestamp,puissance,index,tension,courant\n';
  data.forEach(row => {
    csv += `${row.timestamp},${row.puissance_inst},${row.index_total},${row.tension},${row.intensite}\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=energie.csv');
  res.send(csv);
});
```

### Exporter en JSON

```javascript
app.get('/api/export/json', async (req, res) => {
  const data = await db.getHistory(168);
  res.json(data);
});
```

---

## 🎨 Personnaliser le thème

### Changer les couleurs

Éditer `public/style.css` :

```css
:root {
  --color-primary: #667eea;    /* Violet actuel */
  --color-secondary: #764ba2;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
}
```

Puis utiliser dans le CSS :

```css
.metric {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}
```

### Changer le design

- Remplacer Chart.js par D3.js pour plus de flexibilité
- Ajouter des animations avec Framer Motion
- Utiliser une librairie UI (Bootstrap, Material, Tailwind)

---

## 🧪 Tests

### Test unitaire (Node.js)

```bash
npm install --save-dev jest
```

Créer `src/modules/__tests__/Database.test.js` :

```javascript
import Database from '../Database.js';

describe('Database', () => {
  let db;

  beforeEach(async () => {
    db = new Database(':memory:');
    await db.init();
  });

  test('should record linky data', async () => {
    await db.recordLinkyData({
      puissance_inst: 2000,
      index_total: 123456,
      tension: 230,
      intensite: 8.7
    });

    const current = await db.getCurrentData();
    expect(current.linky.puissance_inst).toBe(2000);
  });
});
```

Lancer avec `npm test`

---

## 📦 Déploiement avancé

### Sur Heroku

```bash
# Créer un Procfile
echo "web: npm start" > Procfile

# Déployer
git push heroku main
```

### Sur Railway

```bash
# CLI deployment
railway link
railway up
```

### Sur un NAS Synology

- SSH dans le NAS
- Installer Node.js via Package Center
- Cloner le repo
- `npm install && npm start`

---

## 🐛 Debugging avancé

### Logs détaillés

```bash
# Même console
export DEBUG=*
npm start

# Sauvetage dans un fichier
npm start > server.log 2>&1 &
tail -f server.log
```

### Profiling

```javascript
// Ajouter dans server.js
console.time('linky-parse');
// ... code
console.timeEnd('linky-parse');

// Affiche: linky-parse: 15.234ms
```

### Monitoring

```bash
npm install pm2
pm2 start src/server.js --watch
pm2 logs
pm2 monit
```

---

## 🚀 Performance

### Optimisations

1. **Cache les requêtes fréquentes** : 
   ```javascript
   const cache = new Map();
   const getCached = (key, fn, ttl = 60000) => {
     if (cache.has(key)) return cache.get(key);
     const result = fn();
     cache.set(key, result);
     setTimeout(() => cache.delete(key), ttl);
     return result;
   };
   ```

2. **Compression des réponses** :
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

3. **Limiter la fréquence d'enregistrement** :
   ```javascript
   let lastRecord = Date.now();
   if (Date.now() - lastRecord > 5000) { // max 1 fois par 5s
     recordData();
     lastRecord = Date.now();
   }
   ```

---

**Vous avez un cas d'usage non couvert ?** Ouvrez une issue ou consultez la documentation officielle des technologies utilisées ! 🚀
