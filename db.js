// Importiere das dotenv-Paket, um Umgebungsvariablen aus der .env-Datei zu laden
require('dotenv').config();

const { Pool } = require('pg');

// Erstelle eine neue Pool-Instanz, um die Datenbankverbindung zu verwalten
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432, // Standard PostgreSQL Port
});

// Funktion, um die Datenbankverbindung zu testen
async function testDatabaseConnection() {
  try {
    // Stelle eine Verbindung zur Datenbank her
    const client = await pool.connect();
    console.log('Erfolgreich mit der PostgreSQL-Datenbank verbunden!');

    // Führe eine einfache Abfrage aus (um die Tabellen aufzulisten)
    const res = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';');
    console.log('Tabellen in der Datenbank:');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Gib die Verbindung zum Pool zurück
    client.release();
  } catch (error) {
    console.error('Fehler beim Verbinden mit der Datenbank:', error);
  } finally {
    // Beende den Pool, wenn er nicht mehr benötigt wird
    await pool.end();
  }
}

// Rufe die Testfunktion auf
testDatabaseConnection();