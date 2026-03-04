import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import Database from './modules/Database.js';
import LinkyReader from './modules/LinkyReader.js';
import BluetoothScanner from './modules/BluetoothScanner.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialisation des modules
const db = new Database();
const linkyReader = new LinkyReader(io);
const bluetoothScanner = new BluetoothScanner(io);

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Récupérer les données actuelles
app.get('/api/data/current', async (req, res) => {
  try {
    const data = await db.getCurrentData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer l'historique
app.get('/api/data/history', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const data = await db.getHistory(parseInt(hours));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les capteurs connus
app.get('/api/sensors', async (req, res) => {
  try {
    const sensors = await db.getSensors();
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configuration et status
app.get('/api/config', (req, res) => {
  res.json({
    linky: process.env.LINKY_PORT || '/dev/ttyUSB0',
    bluetooth: process.env.ENABLE_BLUETOOTH === 'true',
    updateInterval: process.env.UPDATE_INTERVAL || 30000
  });
});

// WebSocket - Communications en temps réel
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });

  // Test de connexion
  socket.emit('message', 'Bienvenue sur le système de suivi d\'énergie');
});

// Démarrage du système
async function startSystem() {
  console.log('🚀 Démarrage du système de gestion d\'énergie...');

  try {
    // Initialiser la base de données
    await db.init();
    console.log('✅ Base de données initialisée');

    // Démarrer la lecture Linky
    if (process.env.ENABLE_LINKY !== 'false') {
      linkyReader.start();
      console.log('✅ Lecteur Linky démarré');
    }

    // Démarrer le scan Bluetooth
    if (process.env.ENABLE_BLUETOOTH === 'true') {
      bluetoothScanner.start();
      console.log('✅ Scanner Bluetooth démarré');
    }

    // Démarrer le serveur HTTP
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`\n📊 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📱 Accédez au dashboard depuis votre tablette`);
    });

  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

// Gestion des arrêts gracieux
process.on('SIGINT', async () => {
  console.log('\n⏹️  Arrêt du système...');
  linkyReader.stop();
  bluetoothScanner.stop();
  await db.close();
  process.exit(0);
});

startSystem();

export { io, db, linkyReader, bluetoothScanner };
