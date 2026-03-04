# Guide De Démarrage - Projet Node.js

## 🎯 Votre configuration

Basé sur votre situation :
- ✅ Vous avez le **module Linky**
- ✅ Vous cherchez une solution **Node.js/avancée**
- ⏳ Capteurs Bluetooth à configurer plus tard

---

## 📦 Étape 1 : Installation initiale

### Sur votre ordinateur pour tester

```bash
# 1. Cloner le projet (ou le télécharger)
git clone https://github.com/laetimo/gestion-energie.git
cd gestion-energie

# 2. Installer Node.js (si pas déjà fait)
# Depuis : https://nodejs.org (recommandé LTS 18+)

# 3. Installer les dépendances
npm install

# 4. Créer le fichier de configuration
cp .env.example .env

# 5. Éditer .env pour ajouter votre port Linky
# Sur Linux:   /dev/ttyUSB0 ou /dev/ttyUSB1
# Sur Windows: COM3, COM4, etc.
# Sur Mac:     /dev/tty.usbserial-xxxxx
nano .env
```

### Variante avec Docker

```bash
cd gestion-energie
docker-compose up -d

# Voir les logs
docker-compose logs -f app
```

---

## 🔌 Étape 2 : Connecter le module Linky

### Identifier le port série

**Linux/Mac :**
```bash
# Lister les ports
ls -la /dev/tty*

# Ou après branchement USB
dmesg | grep -i ttyUSB

# Vous verrez quelque chose comme:
# ttyUSB0: USB UART Device
```

**Windows :**
- Ouvrir **Gestionnaire des appareils**
- Chercher **"Ports (COM et LPT)"**
- Votre adaptateur USB sera listé (ex: COM3)

### Configuration

Éditer `.env` :

```
# Adapter le port à votre système
LINKY_PORT=/dev/ttyUSB0    # Linux
# LINKY_PORT=COM3           # Windows

LINKY_BAUD=2400
```

### Test de connexion

```bash
# Linux - Tester la connexion série
sudo apt install minicom
minicom -D /dev/ttyUSB0 -b 2400

# Windows - Utiliser PuTTY
# https://www.putty.org/

# Vous devriez voir des données du type:
# ADSC 031528506511 C
# VTIN 002 B
# EAST 001234567 D
# PAPP 012345 A
```

---

## 🚀 Étape 3 : Démarrer le serveur

```bash
# Développement (avec rechargement auto)
npm run dev

# Ou production
npm start

# Vous devriez voir:
# ✅ Base de données initialisée
# ✅ Lecteur Linky démarré
# 📊 Serveur démarré sur http://localhost:3000
```

### Accéder au dashboard

Ouvrir votre navigateur :
- **PC** : http://localhost:3000
- **Tablette (même WiFi)** : http://192.168.1.100:3000 (adapter l'IP)

---

## 📊 Étape 4 : Vérifier les données

### Via le dashboard web

Vous devriez voir :
- 🟢 Indicateur Linky (vert si connecté)
- ⚡ Puissance instantanée (en W)
- 📈 Graphique temps réel
- 💾 Historique sur 24h / 3j / 7j

### Via l'API (pour debug)

```bash
# Données actuelles
curl http://localhost:3000/api/data/current

# Historique (24 heures)
curl http://localhost:3000/api/data/history?hours=24

# Santé du serveur
curl http://localhost:3000/api/health
```

---

## 📱 Étape 5 : Installation sur la tablette

### Préalable : Réinitialiser la tablette

Voir : [REINITIALISER_TABLETTE.md](REINITIALISER_TABLETTE.md)

### Option A : Via Firefox sur la tablette (simple)

1. Sur la tablette, ouvrir **Firefox**
2. Aller à : `http://<IP-de-votre-routeur>:3000`
3. Mettre en favori pour accès rapide

### Option B : Serveur sur la tablette (avancé)

1. Installer **Termux** (terminal Linux sur Android)
2. `apt install node`
3. Cloner ce projet dans Termux
4. `npm install && npm start`
5. Accéder via `http://localhost:3000` dans Firefox

### Option C : App Android native (très avancé)

À faire : wrapper Kotlin/Android
- Plus tard si nécessaire

---

## 🔧 Ajouter vos capteurs Bluetooth

Quand vous aurez récupéré vos capteurs :

1. **Identifier le type** :
   - Marque / Modèle
   - Comment ils envoient les données (BLE broadcast, WiFi, etc.)

2. **Adapter le code** dans `src/modules/BluetoothScanner.js` :

```javascript
// Exemple pour Xiaomi Mi Sensor
if (name && name.includes('MHO-C401')) {
  // Vos données ici
}
```

3. Ou utiliser **Home Assistant** comme bridge Bluetooth (plus facile)

---

## 📂 Structure créée

```
📁 gestion-energie/
  ├─ 📄 README.md (documentation générale)
  ├─ 📄 SOLUTION_COMPLETE.md (architecture)
  ├─ 📄 REINITIALISER_TABLETTE.md (guide tablette)
  ├─ 📄 DEMARRAGE_RAPIDE.md (ce fichier)
  ├─ 📄 .env.example (configuration)
  ├─ 📄 package.json (dépendances)
  ├─ 📄 Dockerfile (si Docker)
  │
  ├─ 📁 src/
  │   ├─ 📄 server.js (serveur principal)
  │   └─ 📁 modules/
  │       ├─ 📄 Database.js
  │       ├─ 📄 LinkyReader.js
  │       └─ 📄 BluetoothScanner.js
  │
  ├─ 📁 public/
  │   ├─ 📄 index.html
  │   ├─ 📄 style.css
  │   └─ 📄 dashboard.js
  │
  └─ 📁 data/ (créé au premier démarrage)
      └─ 📄 energy.db (base de données)
```

---

## 🐛 Problèmes courants

### ❌ "Error: Cannot find module 'express'"

```bash
# Réinstaller les dépendances
npm install
```

### ❌ "EACCES: permission denied /dev/ttyUSB0"

```bash
# Donner les permissions
sudo chmod 666 /dev/ttyUSB0

# Ou ajouter l'utilisateur au groupe dialout
sudo usermod -a -G dialout $USER
# Puis relancer le terminal
```

### ❌ "Port already in use"

```bash
# Trouver le processus qui utilise le port 3000
lsof -i :3000

# Terminer le processus
kill -9 <PID>

# Ou changer de port dans .env
# PORT=3001
```

### ❌ "Aucunes données Linky"

1. ✅ Vérifier le **port série** : `ls /dev/ttyUSB*`
2. ✅ Vérifier la **connexion USB** (LED du module clignote?)
3. ✅ Tester avec **minicom/PuTTY**
4. ✅ Vérifier le **câblage TIC** du compteur
5. ✅ Redémarrer le serveur

---

## 📚 Fichiers de documentation

| Fichier | Contenu |
|---------|---------|
| [README.md](README.md) | Vue d'ensemble complète |
| [SOLUTION_COMPLETE.md](SOLUTION_COMPLETE.md) | Architecture technique détaillée |
| [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md) | Ce guide |
| [REINITIALISER_TABLETTE.md](REINITIALISER_TABLETTE.md) | Réinitialiser votre tablette |

---

## 🎓 Prochaines étapes

### Court terme (1-2 jours)
- [x] Installer et tester Node.js
- [x] Connecter le module Linky
- [x] Voir les données en temps réel
- [ ] Configurer la tablette

### Moyen terme (1-2 semaines)
- [ ] Récupérer les capteurs Bluetooth
- [ ] Les ajouter à la solution
- [ ] Tester sur la tablette en WiFi
- [ ] Peaufiner le design du dashboard

### Long terme
- [ ] Ajouter des alertes
- [ ] Exporter les données (CSV, API)
- [ ] Intégrer d'autres capteurs
- [ ] App Android native optionnelle

---

## 💡 Conseils

1. **Sauvegardez !** Votre base de données SQLite est dans `data/energy.db`
   ```bash
   cp -r data data.backup
   ```

2. **Documentez vos modifications** pour ne pas les perdre

3. **Testez en WiFi** avant de déployer sur la tablette

4. **Maintenez à jour** Node.js et les dépendances
   ```bash
   npm outdated
   npm update
   ```

---

## ✅ Checklist de vérification

Avant de considérer le projet comme "prêt" :

- [ ] Serveur démarre sans erreur
- [ ] Dashboard accessible sur http://localhost:3000
- [ ] Données Linky s'affichent
- [ ] Graphique se met à jour
- [ ] Base de données créée (data/energy.db)
- [ ] Tablette réinitialisée
- [ ] Tablette connectée au WiFi
- [ ] Tablette accède au dashboard via son IP

---

**Besoin d'aide ?** Consultez les autres fichiers de documentation ou ouvrez une issue. 🚀
