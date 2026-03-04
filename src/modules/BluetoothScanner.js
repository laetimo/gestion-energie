import { createBluetooth } from 'node-ble';
import dotenv from 'dotenv';

dotenv.config();

class BluetoothScanner {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
    this.db = null;
    this.knownSensors = new Map();
    this.bluetooth = null;
    this.adapter = null;
  }

  setDatabase(db) {
    this.db = db;
  }

  async start() {
    try {
      console.log('📡 Initialisation Bluetooth...');

      // Initialiser Bluetooth
      const { bluetooth } = await createBluetooth();
      this.bluetooth = bluetooth;

      const adapter = await this.bluetooth.defaultAdapter();
      this.adapter = adapter;

      // Vérifier que l'adaptateur est activé
      const powered = await adapter.isPowered();
      if (!powered) {
        console.warn('⚠️  Adaptateur Bluetooth non activé');
        this.io.emit('ble:status', { enabled: false });
        return;
      }

      console.log('✅ Adaptateur Bluetooth prêt');
      this.isRunning = true;
      this.io.emit('ble:status', { enabled: true });

      // Démarrer le scan
      this.startScanning();

    } catch (error) {
      console.error('❌ Erreur initialisation Bluetooth:', error.message);
      this.io.emit('ble:status', { enabled: false, error: error.message });
    }
  }

  async startScanning() {
    if (!this.adapter) return;

    try {
      console.log('🔍 Démarrage du scan Bluetooth...');

      // Démarrer le discovery
      await this.adapter.startDiscovery();

      // Écouter les appareils découverts
      const device = await this.adapter.waitDevice(process.env.BLE_DEVICE_ADDRESS || '00:00:00:00:00:00');
      
      // En pratique, on scan tous les appareils avec les filtres
      this.scanInterval = setInterval(() => {
        this.discoverDevices();
      }, parseInt(process.env.BLE_SCAN_INTERVAL || '30000')); // 30s par défaut

    } catch (error) {
      console.error('❌ Erreur scan Bluetooth:', error.message);
    }
  }

  async discoverDevices() {
    if (!this.adapter) return;

    try {
      const devices = await this.adapter.getDevices();

      for (const device of devices) {
        try {
          const address = await device.getAddress();
          const name = await device.getName();
          const rssi = await device.getRSSI();

          // Filtrer sur les noms connus (capteurs Xiaomi, etc.)
          if (name && name.includes('MHO-C401') || name.includes('LYWSD')) {
            this.processSensorData(address, name, rssi);
          }
        } catch (error) {
          // Certains appareils peuvent ne pas exposer certaines propriétés
        }
      }
    } catch (error) {
      console.error('❌ Erreur découverte appareils:', error.message);
    }
  }

  processSensorData(address, name, rssi) {
    // Simuler la récupération des données du capteur
    // En production, il faudrait se connecter et lire les caractéristiques GATT

    const temperature = 20 + Math.random() * 5; // Simulation
    const humidity = 40 + Math.random() * 30;   // Simulation
    const battery = 100 - Math.random() * 50;

    const sensor = {
      deviceId: address,
      name: name || `Capteur ${address}`,
      type: 'BLE',
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseInt(humidity),
      battery: parseInt(battery),
      rssi: rssi
    };

    this.recordSensorData(sensor);
  }

  async recordSensorData(sensor) {
    if (!this.db) return;

    try {
      await this.db.recordSensorData(
        sensor.deviceId,
        sensor.name,
        sensor.type,
        sensor.temperature,
        sensor.humidity,
        sensor.battery
      );

      // Envoyer aux clients
      this.io.emit('ble:data', sensor);

      console.log(`📡 ${sensor.name}: ${sensor.temperature}°C | ${sensor.humidity}%`);

    } catch (error) {
      console.error('❌ Erreur enregistrement capteur:', error.message);
    }
  }

  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    if (this.adapter) {
      this.adapter.stopDiscovery().catch(() => {});
    }
    this.isRunning = false;
    console.log('⏹️  Scanner Bluetooth arrêté');
  }
}

export default BluetoothScanner;
