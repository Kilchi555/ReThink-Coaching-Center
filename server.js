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
  secret: process.env.SESSION_SECRET || 'einZufaelligerUndSichererStringFuerLocalhost', // Nutze SESSION_SECRET aus .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Wichtig für lokale Entwicklung über HTTP
    maxAge: 24 * 60 * 60 * 1000 // Beispiel: 24 Stunden Gültigkeit für Cookies
  }
}));

// Statische Dateien aus dem Hauptverzeichnis servieren (für den Fall, dass dein Frontend Build-Artefakte dort liegen)
app.use(express.static(path.join(__dirname, 'public')));

// **API-Endpunkte**

// Handler für die Registration
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  console.log('>>> /api/register wurde aufgerufen!');

  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Ungültiges E-Mail-Format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Das Passwort muss mindestens 6 Zeichen lang sein.' });
  }

  try {
    console.log('Vor der Abfrage nach existingUser');
    const existingUser = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    console.log('Nach der Abfrage nach existingUser');

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' });
    }

    console.log('Vor dem Hashing des Passworts');
    const hashedPassword = await bcrypt.hash(password, 10); // Verwende direkt den saltRounds-Wert
    console.log('Nach dem Hashing des Passworts');

    console.log('Vor dem Einfügen des neuen Benutzers');
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at, role', // Füge 'role' in die Rückgabe ein
      [email, hashedPassword]
    );
    console.log('Nach dem Einfügen des neuen Benutzers');

    return res.status(201).json({ message: 'Registrierung erfolgreich!', userId: newUser.rows[0].id, email: newUser.rows[0].email, role: newUser.rows[0].role });

  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

// Handler fürs Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('>>> /api/login wurde aufgerufen!');

  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldeinformationen.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      req.session.userId = user.id;
      return res.status(200).json({ message: 'Login erfolgreich!', userId: user.id, email: user.email, role: user.role });
    } else {
      return res.status(401).json({ error: 'Ungültige Anmeldeinformationen.' });
    }

  } catch (error) {
    console.error('Fehler beim Login:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

// Handler für Benutzer-Daten
app.get('/api/user', async (req, res) => {
  console.log('>>> /api/user wurde aufgerufen!'); // Füge diesen Log am Anfang hinzu

  if (req.session.userId) {
    console.log('Benutzer-ID in Session gefunden:', req.session.userId); // Logge die Benutzer-ID
    console.log('Inhalt von req.session:', req.session); // Füge diesen Log hinzu
    try {
      const userResult = await pool.query(
        'SELECT id, email, created_at, role FROM users WHERE id = $1',
        [req.session.userId]
      );
      const user = userResult.rows[0];

      console.log('Benutzerdaten aus der Datenbank:', user); // Logge die abgerufenen Benutzerdaten

      if (user) {
        return res.status(200).json({ id: user.id, email: user.email, created_at: user.created_at, role: user.role });
      } else {
        return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
    }
  } else {
    console.log('Keine Benutzer-ID in der Session gefunden.'); // Logge, wenn keine ID vorhanden ist
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serviere dein Frontend von hier
});

// Handler für vergangene Termine
app.get('/api/past-appointments', async (req, res) => {
  console.log('>>> /api/past-appointments wurde aufgerufen!');

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  try {
    console.log('Abrufen vergangener Termine für Benutzer-ID:', req.session.userId);

    // Annahme: Du hast eine Tabelle namens 'appointments' mit Spalten wie 'user_id', 'start_time', 'end_time', etc.
    const pastAppointmentsResult = await pool.query(
      `SELECT * FROM appointments
       WHERE user_id = $1 AND end_time < NOW()
       ORDER BY end_time DESC`,
      [req.session.userId]
    );
    const pastAppointments = pastAppointmentsResult.rows;

    console.log('Gefundene vergangene Termine:', pastAppointments);
    return res.status(200).json(pastAppointments);

  } catch (error) {
    console.error('Fehler beim Abrufen vergangener Termine:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

// Handler für zukünftige Termine
app.get('/api/future-appointments', async (req, res) => {
  console.log('>>> /api/future-appointments wurde aufgerufen!');

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  try {
    console.log('Abrufen zukünftiger Termine für Benutzer-ID:', req.session.userId);

    const futureAppointmentsResult = await pool.query(
      `SELECT * FROM appointments
       WHERE user_id = $1 AND start_time > NOW()
       ORDER BY start_time ASC`, // Geändert: start_time > NOW() und ORDER BY start_time ASC
      [req.session.userId]
    );
    const futureAppointments = futureAppointmentsResult.rows;

    console.log('Gefundene zukünftige Termine:', futureAppointments);
    return res.status(200).json(futureAppointments);

  } catch (error) {
    console.error('Fehler beim Abrufen zukünftiger Termine:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

// Handler für termingebundene Kunden-Notizen
app.get('/api/client-notes/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  console.log(`>>> /api/client-notes/${appointmentId} wurde aufgerufen!`);

  if (!req.session.userId) {
      return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  try {
      const notesResult = await pool.query(
          'SELECT * FROM client_notes WHERE appointment_id = $1',
          [appointmentId]
      );
      const notes = notesResult.rows;
      console.log('Klienten-Notizen:', notes);
      return res.status(200).json(notes);
  } catch (error) {
      console.error('Fehler beim Abrufen der Klienten-Notizen:', error);
      return res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Handler für termingebundene Mitarbeiter-Notizen
app.get('/api/staff-notes/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  console.log(`>>> /api/staff-notes/${appointmentId} wurde aufgerufen!`);

  if (!req.session.userId) {
      return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  try {
      const notesResult = await pool.query(
          'SELECT * FROM staff_notes WHERE appointment_id = $1',
          [appointmentId]
      );
      const notes = notesResult.rows;
      console.log('Mitarbeiter-Notizen:', notes);
      return res.status(200).json(notes);
  } catch (error) {
      console.error('Fehler beim Abrufen der Mitarbeiter-Notizen:', error);
      return res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Handler für allgemeine Kunden-Notizen (nicht an einen Termin gebunden)
app.get('/api/user-notes', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  try {
    const notesResult = await pool.query(
      'SELECT * FROM user_notes WHERE user_id = $1',
      [req.session.userId]
    );
    const notes = notesResult.rows;
    console.log('Allgemeine Benutzer-Notizen:', notes);
    return res.status(200).json(notes);
  } catch (error) {
    console.error('Fehler beim Abrufen der allgemeinen Benutzer-Notizen:', error);
    return res.status(500).json({ error: 'Interner Serverfehler.' });
  }
});

// Handler für allgemeine Mitarbeiter-Notizen (nicht an einen Termin gebunden)
app.get('/api/staff-user-notes', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Nicht authentifiziert.' });
    }

    try {
        const notesResult = await pool.query(
            'SELECT * FROM staff_user_notes WHERE staff_id = $1', // Angenommen, Sie haben eine Spalte 'staff_id'
            [req.session.userId]
        );
        const notes = notesResult.rows;
        console.log('Allgemeine Mitarbeiter-Notizen:', notes);
        return res.status(200).json(notes);
    } catch (error) {
        console.error('Fehler beim Abrufen der allgemeinen Mitarbeiter-Notizen:', error);
        return res.status(500).json({ error: 'Interner Serverfehler.' });
    }
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