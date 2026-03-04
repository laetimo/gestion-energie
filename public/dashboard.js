// Connexion Socket.io
const socket = io();

// Variables globales
let powerChart = null;
let historyChart = null;
let currentTimeRange = 72; // heures

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    setupEventListeners();
    loadInitialData();
});

// Socket.io - Événements
socket.on('connect', () => {
    console.log('✅ Connecté au serveur');
});

socket.on('disconnect', () => {
    console.log('❌ Déconnecté du serveur');
});

// Statut Linky
socket.on('linky:status', (data) => {
    updateLinkyStatus(data.connected);
});

// Données Linky temps réel
socket.on('linky:data', (data) => {
    updateLinkyDisplay(data);
    updatePowerChart(data);
});

// Statut Bluetooth
socket.on('ble:status', (data) => {
    updateBLEStatus(data.enabled);
});

// Données capteurs temps réel
socket.on('ble:data', (sensor) => {
    updateSensorDisplay(sensor);
});

// Mise à jour du timestamp
socket.on('message', (msg) => {
    console.log('Message serveur:', msg);
});

// ==================== LINKY ====================

function updateLinkyStatus(connected) {
    const indicator = document.getElementById('linky-status');
    indicator.classList.toggle('connected', connected);
    indicator.classList.toggle('disconnected', !connected);
}

function updateLinkyDisplay(data) {
    // Mettre à jour les valeurs
    if (data.puissance_inst) {
        document.getElementById('power').textContent = 
            data.puissance_inst.toLocaleString('fr-FR') + ' W';
    }
    if (data.index_total) {
        document.getElementById('index').textContent = 
            (data.index_total / 1000).toFixed(2) + ' kWh';
    }
    if (data.tension) {
        document.getElementById('voltage').textContent = 
            data.tension + ' V';
    }
    if (data.intensite) {
        document.getElementById('current').textContent = 
            data.intensite.toFixed(2) + ' A';
    }

    // Mettre à jour l'heure
    updateLastUpdate();
}

function updateLastUpdate() {
    const now = new Date();
    document.getElementById('last-update').textContent = 
        now.toLocaleTimeString('fr-FR');
}

// ==================== BLUETOOTH ====================

function updateBLEStatus(enabled) {
    const indicator = document.getElementById('ble-status');
    indicator.classList.toggle('connected', enabled);
    indicator.classList.toggle('disconnected', !enabled);
}

function updateSensorDisplay(sensor) {
    const containerId = 'sensors-container';
    const container = document.getElementById(containerId);

    // Retirer le placeholder si présent
    const placeholder = container.querySelector('.sensor-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    // Créer ou mettre à jour la carte du capteur
    let sensorCard = document.getElementById(`sensor-${sensor.deviceId}`);
    
    if (!sensorCard) {
        sensorCard = document.createElement('div');
        sensorCard.id = `sensor-${sensor.deviceId}`;
        sensorCard.className = 'sensor-card';
        container.appendChild(sensorCard);
    }

    // Déterminer l'emoji de batterie
    const batteryEmoji = getBatteryEmoji(sensor.battery);

    sensorCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
            <h3>${sensor.name}</h3>
            <span class="battery-indicator">${batteryEmoji}</span>
        </div>
        <div class="sensor-data">
            <div class="sensor-value">
                <span class="label">🌡️ Température</span>
                <span class="value">${sensor.temperature?.toFixed(1) || '--'}°C</span>
            </div>
            <div class="sensor-value">
                <span class="label">💧 Hygrométrie</span>
                <span class="value">${sensor.humidity || '--'}%</span>
            </div>
            <div class="sensor-value">
                <span class="label">🔋 Batterie</span>
                <span class="value">${sensor.battery || '--'}%</span>
            </div>
            <div class="sensor-value">
                <span class="label">📡 Signal</span>
                <span class="value">${getSignalStrength(sensor.rssi)}</span>
            </div>
        </div>
    `;

    updateLastUpdate();
}

function getBatteryEmoji(battery) {
    if (!battery) return '🔌';
    if (battery >= 75) return '🔋';
    if (battery >= 50) return '🪫';
    if (battery >= 25) return '⚠️';
    return '❌';
}

function getSignalStrength(rssi) {
    if (!rssi) return '--';
    rssi = parseInt(rssi);
    if (rssi >= -50) return '⭐⭐⭐⭐⭐';
    if (rssi >= -60) return '⭐⭐⭐⭐';
    if (rssi >= -70) return '⭐⭐⭐';
    if (rssi >= -80) return '⭐⭐';
    return '⭐';
}

// ==================== GRAPHIQUES ====================

function initCharts() {
    // Graphique de puissance instantanée
    const ctxPower = document.getElementById('powerChart').getContext('2d');
    powerChart = new Chart(ctxPower, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Puissance (W)',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-FR') + ' W';
                        }
                    }
                }
            }
        }
    });

    // Graphique d'historique
    const ctxHistory = document.getElementById('historyChart').getContext('2d');
    historyChart = new Chart(ctxHistory, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Consommation moyenne (W)',
                data: [],
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-FR') + ' W';
                        }
                    }
                }
            }
        }
    });
}

function updatePowerChart(data) {
    if (!powerChart) return;

    const now = new Date();
    const label = now.toLocaleTimeString('fr-FR');

    // Garder seulement les 20 derniers points
    if (powerChart.data.labels.length >= 20) {
        powerChart.data.labels.shift();
        powerChart.data.datasets[0].data.shift();
    }

    powerChart.data.labels.push(label);
    powerChart.data.datasets[0].data.push(data.puissance_inst || 0);
    powerChart.update('none'); // Update sans animation
}

async function loadHistoryChart(hours) {
    try {
        const response = await fetch(`/api/data/history?hours=${hours}`);
        const data = await response.json();

        if (!historyChart) return;

        historyChart.data.labels = data.map(d => {
            const date = new Date(d.timestamp);
            return date.toLocaleTimeString('fr-FR');
        });

        historyChart.data.datasets[0].data = data.map(d => d.puissance_inst || 0);
        historyChart.update();

    } catch (error) {
        console.error('Erreur chargement historique:', error);
    }
}

// ==================== INITIALISATION ====================

async function loadInitialData() {
    try {
        // Charger les données actuelles
        const response = await fetch('/api/data/current');
        const data = await response.json();

        if (data.linky) {
            updateLinkyDisplay(data.linky);
        }

        // Afficher les capteurs existants
        if (data.sensors && data.sensors.length > 0) {
            data.sensors.forEach(sensor => {
                updateSensorDisplay(sensor);
            });
        }

        // Charger l'historique
        loadHistoryChart(currentTimeRange);

    } catch (error) {
        console.error('Erreur chargement données initiales:', error);
    }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Boutons de plage horaire
    document.querySelectorAll('.btn-time').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-time').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentTimeRange = parseInt(e.target.dataset.hours);
            loadHistoryChart(currentTimeRange);
        });
    });

    // Auto-refresh toutes les secondes
    setInterval(updateLastUpdate, 1000);
}

// ==================== UTILITAIRES ====================

// Format de nombre français
Number.prototype.toLocaleString = function(locale) {
    if (locale === 'fr-FR') {
        return this.toLocaleString('fr-FR');
    }
    return this.toString();
};
