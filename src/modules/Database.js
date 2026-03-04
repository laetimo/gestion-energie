import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/energy.db');
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Créer les tables
        this.db.serialize(() => {
          // Table des données Linky
          this.db.run(`
            CREATE TABLE IF NOT EXISTS linky_data (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
              puissance_inst INTEGER,
              index_total INTEGER,
              tension INTEGER,
              intensite REAL,
              periode CHAR(2),
              UNIQUE(timestamp)
            )
          `);

          // Table des capteurs
          this.db.run(`
            CREATE TABLE IF NOT EXISTS sensors (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              device_id TEXT UNIQUE,
              name TEXT,
              type TEXT,
              last_seen DATETIME,
              battery_level INTEGER
            )
          `);

          // Table des données capteurs
          this.db.run(`
            CREATE TABLE IF NOT EXISTS sensor_data (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              sensor_id INTEGER,
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
              temperature REAL,
              humidity REAL,
              pressure REAL,
              FOREIGN KEY(sensor_id) REFERENCES sensors(id)
            )
          `, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
    });
  }

  // Enregistrer les données Linky
  recordLinkyData(data) {
    return new Promise((resolve, reject) => {
      const { puissance_inst, index_total, tension, intensite, periode } = data;
      
      this.db.run(
        `INSERT OR REPLACE INTO linky_data (timestamp, puissance_inst, index_total, tension, intensite, periode)
         VALUES (CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
        [puissance_inst, index_total, tension, intensite, periode],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  // Enregistrer une nouvelle donnée capteur
  recordSensorData(deviceId, name, sensorType, temp, humidity, battery) {
    return new Promise((resolve, reject) => {
      // D'abord, trouver ou créer le capteur
      this.db.run(
        `INSERT OR IGNORE INTO sensors (device_id, name, type, battery_level, last_seen)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [deviceId, name, sensorType, battery],
        function(err) {
          if (err) {
            reject(err);
            return;
          }

          // Puis enregistrer les données
          this.db.get(
            `SELECT id FROM sensors WHERE device_id = ?`,
            [deviceId],
            (err, row) => {
              if (err) {
                reject(err);
                return;
              }

              this.db.run(
                `INSERT INTO sensor_data (sensor_id, temperature, humidity)
                 VALUES (?, ?, ?)`,
                [row.id, temp, humidity],
                (err) => {
                  if (err) reject(err);
                  else {
                    // Mettre à jour last_seen
                    this.db.run(
                      `UPDATE sensors SET last_seen = CURRENT_TIMESTAMP, battery_level = ? WHERE id = ?`,
                      [battery, row.id]
                    );
                    resolve();
                  }
                }
              );
            }
          );
        }
      );
    });
  }

  // Récupérer les données actuelles
  getCurrentData() {
    return new Promise((resolve, reject) => {
      const data = {};

      // Dernière donnée Linky
      this.db.get(
        `SELECT * FROM linky_data ORDER BY timestamp DESC LIMIT 1`,
        (err, linkyRow) => {
          if (err) {
            reject(err);
            return;
          }
          data.linky = linkyRow;

          // Données actuelles des capteurs
          this.db.all(
            `SELECT s.*, 
                    (SELECT temperature FROM sensor_data WHERE sensor_id = s.id ORDER BY timestamp DESC LIMIT 1) as temperature,
                    (SELECT humidity FROM sensor_data WHERE sensor_id = s.id ORDER BY timestamp DESC LIMIT 1) as humidity
             FROM sensors s`,
            (err, sensors) => {
              if (err) {
                reject(err);
                return;
              }
              data.sensors = sensors || [];
              resolve(data);
            }
          );
        }
      );
    });
  }

  // Récupérer l'historique
  getHistory(hours = 24) {
    return new Promise((resolve, reject) => {
      const since = new Date(Date.now() - hours * 3600000).toISOString();

      this.db.all(
        `SELECT * FROM linky_data 
         WHERE timestamp > datetime(?)
         ORDER BY timestamp ASC`,
        [since],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Récupérer tous les capteurs
  getSensors() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM sensors ORDER BY name ASC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Récupérer l'historique d'un capteur
  getSensorHistory(sensorId, hours = 24) {
    return new Promise((resolve, reject) => {
      const since = new Date(Date.now() - hours * 3600000).toISOString();

      this.db.all(
        `SELECT * FROM sensor_data 
         WHERE sensor_id = ? AND timestamp > datetime(?)
         ORDER BY timestamp ASC`,
        [sensorId, since],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  // Fermer la base de données
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default Database;
