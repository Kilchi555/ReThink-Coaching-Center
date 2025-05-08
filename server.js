require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Datenbankverbindung
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432, // Nutze DB_PORT aus .env, falls vorhanden
});

// CORS-Konfiguration (erlaube Anfragen von deiner GitHub Pages Domain und localhost für Entwicklung)
const corsOptions = {
  origin: [
    'https://kilchi555.github.io', // Deine GitHub Pages Domain
    'http://localhost:3000'      // Für lokale Entwicklung (falls zutreffend)
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware in der korrekten Reihenfolge
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'deinSuperGeheimesSchlüsselwort', // Nutze SESSION_SECRET aus .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // Beispiel: 24 Stunden Gültigkeit für Cookies
  }
}));

// Statische Dateien aus dem Hauptverzeichnis servieren (für den Fall, dass dein Frontend Build-Artefakte dort liegen)
app.use(express.static(path.join(__dirname, '.')));

// API-Endpunkte
app.post('/api/register', async (req, res) => {
  // ... dein Registrierungs-Code ...
});

app.post('/api/login', async (req, res) => {
  // ... dein Login-Code ...
});

app.get('/api/user', async (req, res) => {
  // ... dein Benutzerdaten-Code ...
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serviere dein Frontend von hier
});

app.get('/api/past-appointments', async (req, res) => {
  // ... dein Code für vergangene Termine ...
});

app.get('/api/future-appointments', async (req, res) => {
  // ... dein Code für zukünftige Termine ...
});

app.get('/api/client-notes/:appointmentId', async (req, res) => {
  // ... dein Code für Klienten-Notizen ...
});

app.get('/api/staff-notes/:appointmentId', async (req, res) => {
  // ... dein Code für Mitarbeiter-Notizen ...
});

// Starte den Server nur einmal am Ende der Datei
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

// Optional: Fehlerbehandlung für Datenbankverbindung beim Start (wie zuvor besprochen)
if (pool) {
  pool.connect()
    .then(() => console.log('Datenbankverbindung erfolgreich hergestellt.'))
    .catch(err => {
      console.error('Fehler beim Verbinden mit der Datenbank:', err);
      process.exit(1);
    });
}