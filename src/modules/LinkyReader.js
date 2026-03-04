import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import dotenv from 'dotenv';

dotenv.config();

class LinkyReader {
  constructor(io) {
    this.io = io;
    this.port = null;
    this.parser = null;
    this.isRunning = false;
    this.db = null;
    this.lastData = {};
  }

  setDatabase(db) {
    this.db = db;
  }

  async start() {
    try {
      const portName = process.env.LINKY_PORT || '/dev/ttyUSB0';
      const baudRate = parseInt(process.env.LINKY_BAUD || '2400');

      console.log(`📡 Tentative de connexion au port Linky: ${portName} (${baudRate} bauds)`);

      this.port = new SerialPort({
        path: portName,
        baudRate: baudRate,
        dataBits: 7,
        stopBits: 1,
        parity: 'even'
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      this.port.on('open', () => {
        console.log('✅ Port Linky ouvert');
        this.isRunning = true;
        this.io.emit('linky:status', { connected: true });
      });

      this.port.on('error', (err) => {
        console.error('❌ Erreur port Linky:', err.message);
        this.io.emit('linky:status', { connected: false, error: err.message });
      });

      this.parser.on('data', (line) => {
        this.processLinkyData(line);
      });

    } catch (error) {
      console.error('❌ Erreur démarrage Linky:', error.message);
      this.io.emit('linky:status', { connected: false, error: error.message });
    }
  }

  processLinkyData(line) {
    // Format TIC Linky: LABEL VALUE CRC
    // Exemple: ADSC 031528506511 C
    const parts = line.trim().split(/\s+/);
    
    if (parts.length < 2) return;

    const [label, value] = parts;

    // Mapper les données Linky
    switch (label) {
      case 'PAPP': // Puissance apparente (VA)
        this.lastData.puissance_inst = parseInt(value);
        break;
      case 'EAST': // Index de consommation (Wh)
        this.lastData.index_total = parseInt(value);
        break;
      case 'URMS1': // Tension RMS phase 1
        this.lastData.tension = parseInt(value);
        break;
      case 'IRMS1': // Intensité RMS phase 1
        this.lastData.intensite = parseFloat(value);
        break;
      case 'NTARF': // Période tarifaire
        this.lastData.periode = value;
        break;
    }

    // Si on a au moins les données essentielles, enregistrer
    if (this.lastData.puissance_inst && this.lastData.index_total) {
      this.recordData();
    }
  }

  async recordData() {
    if (!this.db) return;

    try {
      await this.db.recordLinkyData(this.lastData);
      
      // Envoyer aux clients connectés
      this.io.emit('linky:data', {
        timestamp: new Date(),
        ...this.lastData
      });

      console.log(`📊 Linky: ${this.lastData.puissance_inst}W | Index: ${this.lastData.index_total}Wh`);
      
      this.lastData = {}; // Réinitialiser
    } catch (error) {
      console.error('❌ Erreur enregistrement Linky:', error.message);
    }
  }

  stop() {
    if (this.port) {
      this.port.close();
      this.isRunning = false;
      console.log('⏹️  Lecteur Linky arrêté');
    }
  }
}

export default LinkyReader;
