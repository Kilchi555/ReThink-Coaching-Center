require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

async function insertUser(email, password) {
  try {
    // Generiere einen Salt (Zufallswert) für die Passwort-Hashung
    const saltRounds = 10; // Je höher, desto sicherer, aber auch langsamer
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const client = await pool.connect();
    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at;
    `;
    const values = [email, hashedPassword]; // Speichere den Hash, nicht das Klartext-Passwort
    const result = await client.query(query, values);

    console.log('Neuer Benutzer erfolgreich hinzugefügt (Passwort gehasht):', result.rows[0]);
    client.release();
  } catch (error) {
    console.error('Fehler beim Einfügen des Benutzers:', error);
  } finally {
    await pool.end();
  }
}

// Beispielhafte Verwendung der Funktion
const newUserEmail = 'secure_test@example.com';
const newUserPassword = 'meinSehrGeheimesPasswort123';

insertUser(newUserEmail, newUserPassword);