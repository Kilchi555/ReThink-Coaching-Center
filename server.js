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
  port: 5432,
});

// Middleware in der korrekten Reihenfolge
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'deinSuperGeheimesSchlüsselwort',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Statische Dateien aus dem Hauptverzeichnis servieren
app.use(express.static(path.join(__dirname, '.')));

// API-Endpunkte
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

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
    const existingUser = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    return res.status(201).json({ message: 'Registrierung erfolgreich!', userId: newUser.rows[0].id, email: newUser.rows[0].email, role: 'kunde' });

  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

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

app.get('/api/user', async (req, res) => {
  if (req.session.userId) {
    try {
      const userResult = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.session.userId]);
      const user = userResult.rows[0];
      if (user) {
        return res.status(200).json({ user });
      } else {
        return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
    }
  } else {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/past-appointments', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  try {
    const now = new Date();
    const pastAppointmentsResult = await pool.query(
      'SELECT * FROM appointments WHERE client_id = $1 AND end_time < $2 ORDER BY end_time DESC',
      [req.session.userId, now]
    );
    return res.status(200).json({ pastAppointments: pastAppointmentsResult.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen vergangener Termine:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

app.get('/api/future-appointments', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  try {
    const now = new Date();
    const futureAppointmentsResult = await pool.query(
      'SELECT * FROM appointments WHERE client_id = $1 AND start_time >= $2 ORDER BY start_time ASC',
      [req.session.userId, now]
    );
    return res.status(200).json({ futureAppointments: futureAppointmentsResult.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen zukünftiger Termine:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

app.get('/api/client-notes/:appointmentId', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  const { appointmentId } = req.params;

  try {
    const notesResult = await pool.query(
      'SELECT * FROM client_notes WHERE appointment_id = $1',
      [appointmentId]
    );
    return res.status(200).json({ clientNotes: notesResult.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Klienten-Notizen:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

app.get('/api/staff-notes/:appointmentId', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  const { appointmentId } = req.params;

  try {
    const notesResult = await pool.query(
      'SELECT * FROM staff_notes WHERE appointment_id = $1',
      [appointmentId]
    );
    return res.status(200).json({ staffNotes: notesResult.rows });
  } catch (error) {
    console.error('Fehler beim Abrufen der Mitarbeiter-Notizen:', error);
    return res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.' });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});