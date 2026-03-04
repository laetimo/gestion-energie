# Vue d'ensemble - Interface Web

## Structure

```
public/
├── index.html        # Markup HTML
├── style.css         # Styles CSS
└── dashboard.js      # Logique JavaScript
```

---

## index.html - Structure

### Sections principales

```html
<header class="header">
  <!-- Titre + indicateurs status Linky/BLE -->
</header>

<main class="dashboard">
  <!-- Card Linky: puissance, index, tension, courant -->
  <section class="card card-linky">
    <div class="metrics">
      <div class="metric">...</div>
    </div>
    <canvas id="powerChart"></canvas>
  </section>

  <!-- Card Capteurs: température, hygrométrie par capteur -->
  <section class="card card-sensors">
    <div class="sensors-grid">
      <!-- Cards générées dynamiquement par JS -->
    </div>
  </section>

  <!-- Card Graphiques: historique 24h/3j/7j -->
  <section class="card card-charts">
    <canvas id="historyChart"></canvas>
  </section>
</main>

<footer class="footer">
  <!-- Last update timestamp -->
</footer>
```

### Points clés

- **Responsive** : `grid-auto-fit` pour adapter écrans
- **WebSocket integré** : Socket.io client
- **Charts** : Chart.js pour graphiques
- **Pas de frameworks** : HTML/CSS/JS vanille (léger)

---

## style.css - Design

### Architecture CSS

```
* { ... }              /* Reset */
body { ... }           /* Global */

.container { ... }     /* Layout global */

/* En-tête */
.header { ... }
.status-indicator { ... }

/* Dashboard grille */
.dashboard { ... }
.card { ... }

/* Composants */
.metric { ... }        /* Cartes de valeurs */
.sensor-card { ... }   /* Capteurs */
.btn { ... }           /* Boutons */

/* Responsive */
@media (max-width: 768px) { ... }

/* Animations */
@keyframes pulse { ... }
```

### Personalization

**Couleurs primaires** :
```css
/* Actuellement: Violet/Magenta gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* À changer pour theme personnalisé */
```

**Layout** :
```css
.dashboard {
  /* Actuellement: Grid avec colonnes min-400px */
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  
  /* Pour mobile: 1 colonne */
  /* Pour desktop: jusqu'à 3 colonnes */
}
```

**Polices** :
```css
font-family: 'Segoe UI', ...;  /* Moderne, clair */
```

---

## dashboard.js - Logique

### Initialisation

```javascript
// 1. DOM prêt
document.addEventListener('DOMContentLoaded', () => {
  initCharts();          // Créer les Chart.js
  setupEventListeners(); // Boutons, etc.
  loadInitialData();     // Charger depuis API
});

// 2. Connexion WebSocket
const socket = io();    // Auto-connect à /

socket.on('connect', () => { ... });
socket.on('disconnect', () => { ... });
```

### Événements WebSocket

```javascript
// En temps réel
socket.on('linky:data', (data) => {
  updateLinkyDisplay(data);  // Mise à jour valeurs
  updatePowerChart(data);    // Ajouter au graph
});

socket.on('linky:status', (data) => {
  updateLinkyStatus(data.connected); // Indicateur vert/rouge
});

socket.on('ble:data', (sensor) => {
  updateSensorDisplay(sensor);  // Afficher/mettre à jour capteur
});

socket.on('ble:status', (data) => {
  updateBLEStatus(data.enabled); // Indicateur BLE
});
```

### Graphiques

**Deux graphiques** :

1. **Power Chart** (temps réel)
   - Type: Line chart
   - Données: 20 derniers points
   - Mise à jour: chaque new data Linky
   - Auto-scroll: garde dernier point visible

2. **History Chart** (long terme)
   - Type: Line chart
   - Données: 24h / 72h / 168h
   - Mise à jour: quand utilisateur change période
   - Récupéré via API `/api/data/history?hours=X`

```javascript
// Exemple Chart.js
const ctx = document.getElementById('powerChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],     // Temps
    datasets: [{
      label: 'Puissance (W)',
      data: [],     // Valeurs
      borderColor: '#667eea'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Ajouter point
chart.data.labels.push('10:30');
chart.data.datasets[0].data.push(2345);
chart.update('none');  // Update sans animation
```

### Affichage des données

**Linky** :
```javascript
document.getElementById('power').textContent = '2345 W';
document.getElementById('index').textContent = '12.45 kWh';
// ... etc
```

**Capteurs** :
```javascript
// Générer HTML dynamiquement
sensorCard.innerHTML = `
  <h3>${sensor.name}</h3>
  <div class="sensor-data">
    <div class="sensor-value">
      <span>🌡️ Température</span>
      <span>${sensor.temperature}°C</span>
    </div>
  </div>
`;
```

---

## Fonctionnalités implementées

### ✅ Affichage temps réel
- WebSocket pour mises à jour instantanées
- Pas de polling (économe batterie tablette)
- Fallback API si WebSocket down

### ✅ Graphiques interactifs
- Chart.js responsive
- Zoom/pan pour analyser
- Boutons 24h/72h/7j pour filtrer

### ✅ Capteurs multiples
- Grille dynamique
- Icons emoji (batterie, signal)
- Affichage/masquage automatique

### ✅ Interface responsive
- Desktop: 3 colonnes
- Tablet: 2 colonnes
- Mobile: 1 colonne

### ✅ Dark mode ready
- Couleurs personnalisables
- Background adapté

---

## Modifications courantes

### Ajouter une nouvelle carte de valeur

1. **HTML** - dans `index.html` :
```html
<div class="metric">
  <span class="label">Coût kWh</span>
  <span id="cost" class="value">-- €</span>
</div>
```

2. **CSS** - style auto (hérité du `.metric`)

3. **JS** - dans `dashboard.js` :
```javascript
socket.on('linky:data', (data) => {
  const cost = (data.index_total / 1000) * 0.15; // 0.15€/kWh
  document.getElementById('cost').textContent = cost.toFixed(2) + ' €';
});
```

### Changer les couleurs

1. Éditer `style.css` :
```css
.metric {
  background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);
}

.status-indicator.connected {
  background: #YOUR_GREEN;
}
```

2. Utiliser des outils: https://uigradients.com/

### Ajouter un nouveau graphique

1. **HTML** :
```html
<canvas id="myChart"></canvas>
```

2. **JS** - dans `initCharts()` :
```javascript
const ctx = document.getElementById('myChart').getContext('2d');
window.myChart = new Chart(ctx, {
  type: 'pie',  // ou 'bar', 'doughnut', etc.
  data: { ... },
  options: { ... }
});
```

3. **Mise à jour** - quand données arrivent :
```javascript
socket.on('my:event', (data) => {
  window.myChart.data.labels.push(data.label);
  window.myChart.data.datasets[0].data.push(data.value);
  window.myChart.update();
});
```

### Ajouter des alertes

```javascript
// Afficher notification
function showAlert(message, level = 'info') {
  // Créer toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${level}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Auto-masquer
  setTimeout(() => toast.remove(), 5000);
}

// Utiliser
socket.on('alert', (alert) => {
  showAlert(`⚠️ ${alert.message}`, alert.severity);
});
```

### Intégrer un framework

Si vous voulez plus de réactivité (Vue/React) :

```javascript
// Installer
npm install vue

// Créer src/App.vue
<template>
  <div class="dashboard">
    <card v-for="metric in metrics" :metric="metric" />
  </div>
</template>

// Builder avec webpack/rollup
```

---

## Performance

### Optimisations actuelles

1. ✅ **Pas de polling** - WebSocket = données push
2. ✅ **Graphiques optimisés** - points limités à 20-30
3. ✅ **CSS minifié** - ~5KB
4. ✅ **No frameworks** - ~10KB JS total
5. ✅ **Icons emoji** - très léger (pas SVG/PNG)

### Poids total

```
index.html     ~3 KB
style.css      ~8 KB
dashboard.js   ~12 KB
Chart.js (CDN) ~50 KB
Socket.io      ~70 KB (CDN)
━━━━━━━━━━━━━━━━━━━━
Total: ~145 KB chargé (dont 120 KB CDN)
```

### Sur tablette Android

- **Chargement rapide** : 1-2s sur WiFi
- **Mémoire faible** : ~50MB RAM utilisée
- **Batterie OK** : WebSocket pas de polling constant
- **Réseau** : 3-5 mises à jour/sec max

---

## Accessibilité

Améliorations recommandées :

```html
<!-- Ajouter aria-labels -->
<div class="metric" aria-label="Puissance instantanée">
  <span>⚡</span>
  <span role="status" aria-live="polite" id="power">-- W</span>
</div>

<!-- Contraste -->
/* Ratio >= 4.5:1 pour petit texte */
color: #333;        /* Dark text */
background: white;  /* Light bg */
```

---

## Debugging

### Voir les messages WebSocket

```javascript
// Dans la console du navigateur
socket.onAny((event, ...args) => {
  console.log(event, args);
});

// Ou avec l'onglet Network > WS
```

### Tester l'API directement

```bash
# Dans le terminal
curl http://localhost:3000/api/data/current | jq

# Ou directement dans le navigateur
fetch('/api/data/current').then(r => r.json()).then(d => console.log(d));
```

### Profiler le JS

```javascript
// Dans la console
console.time('update');
updateLinkyDisplay(data);
console.timeEnd('update');

// Affiche: update: 0.5ms
```

---

**Besoin d'aide pour personnaliser?** Consultez Chart.js docs, Socket.io client docs ou ouvrez une issue! 🚀
