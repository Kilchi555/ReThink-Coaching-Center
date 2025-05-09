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
app.use(express.static(path.join(__dirname)));

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
    return res.status(500).json({ error: 'Fehler bei der Registrierung.' });
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
    return res.status(500).json({ error: 'Fehler beim Login.' });
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
      return res.status(500).json({ error: 'Fehler beim Abrufen der Benutzerdaten.' });
    }
  } else {
    console.log('Keine Benutzer-ID in der Session gefunden.'); // Logge, wenn keine ID vorhanden ist
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serviere dein Frontend von hier
});

// Handler für vergangene Termine
// Beispiel-Endpoint zum Abrufen der Termine mit Notizen
app.get('/api/past-appointments', async (req, res) => {
  console.log('>>> /api/past-appointments aufgerufen!');

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  const userId = req.session.userId;

  try {
    // Wenn der Benutzer ein Mitarbeiter ist (also eine staff_id vorhanden ist), gebe ihm alle vergangenen Termine, bei denen er als Mitarbeiter eingetragen ist
    const result = await pool.query(`
  SELECT 
    a.id,
    a.title,
    a.start_time,
    a.end_time,
    u.email AS customer_email,
    s.email AS staff_email,
    cn.note AS client_note,
    sn.note AS staff_note
  FROM appointments a
  LEFT JOIN users u ON u.id = a.user_id
  LEFT JOIN users s ON s.id = a.staff_id
  LEFT JOIN client_notes cn ON cn.appointment_id = a.id
  LEFT JOIN staff_notes sn ON sn.appointment_id = a.id
  WHERE a.start_time > NOW()
    AND (a.user_id = $1 OR a.staff_id = $1)
  ORDER BY a.start_time ASC
`, [req.session.userId]);

const events = result.rows.map(row => ({
  id: row.id,
  title: row.title || 'Termin',
  start: new Date(row.start_time).toISOString(), // Hier sicherstellen, dass der Wert im richtigen Format ist
  end: new Date(row.end_time).toISOString(),     // Hier ebenfalls
  extendedProps: {
    customerEmail: row.customer_email,
    staffEmail: row.staff_email,
    clientNote: row.client_note,
    staffNote: row.staff_note,
  }
}));

return res.status(200).json(events);


  } catch (error) {
    console.error('Fehler beim Abrufen vergangener Termine:', error);
    return res.status(500).json({ error: 'Fehler beim Abrufen der vergangenen Termine.' });
  }
});

// Handler für zukünftige Termine
app.get('/api/future-appointments', async (req, res) => {
  console.log('>>> /api/future-appointments aufgerufen!');

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  const userId = req.session.userId;

  try {
    // Wenn der Benutzer ein Mitarbeiter ist (also eine staff_id vorhanden ist), gebe ihm alle zukünftigen Termine, bei denen er als Mitarbeiter eingetragen ist
    const result = await pool.query(`
  SELECT 
    a.id,
    a.title,
    a.start_time,
    a.end_time,
    u.email AS customer_email,
    s.email AS staff_email,
    cn.note AS client_note,
    sn.note AS staff_note
  FROM appointments a
  LEFT JOIN users u ON u.id = a.user_id
  LEFT JOIN users s ON s.id = a.staff_id
  LEFT JOIN client_notes cn ON cn.appointment_id = a.id
  LEFT JOIN staff_notes sn ON sn.appointment_id = a.id
  WHERE a.start_time > NOW()
    AND (a.user_id = $1 OR a.staff_id = $1)
  ORDER BY a.start_time ASC
`, [req.session.userId]);

const events = result.rows.map(row => ({
  id: row.id,
  title: row.title || 'Termin',
  start: new Date(row.start_time).toISOString(), // Hier sicherstellen, dass der Wert im richtigen Format ist
  end: new Date(row.end_time).toISOString(),     // Hier ebenfalls
  extendedProps: {
    customerEmail: row.customer_email,
    staffEmail: row.staff_email,
    clientNote: row.client_note,
    staffNote: row.staff_note,
  }
}));

return res.status(200).json(events);


  } catch (error) {
    console.error('Fehler beim Abrufen zukünftiger Termine:', error);
    return res.status(500).json({ error: 'Fehler beim Abrufen der zukünftigen Termine.' });
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
      return res.status(500).json({ error: 'Fehler beim Abrufen der Klienten-Notizen.' });
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
      return res.status(500).json({ error: 'Fehler beim Abrufen der Mitarbeiter-Notizen' });
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
    return res.status(500).json({ error: 'Fehler beim Abrufen der allgemeinen Benutzer-Notizen.' });
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
        return res.status(500).json({ error: 'Fehler beim Abrufen der allgemeinen Mitarbeiter-Notizen.' });
    }
});

app.post('/api/update-note', async (req, res) => {
  const { appointmentId, note, type } = req.body;
  const userId = req.session.userId;

  console.log('>>> /api/update-note wurde aufgerufen!');

  if (!userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert.' });
  }

  if (!appointmentId || !note || !type) {
    return res.status(400).json({ error: 'Termin-ID, Notiz und Typ sind erforderlich.' });
  }

  try {
    // Überprüfen, ob der Termin existiert und der Benutzer berechtigt ist, die Notiz zu bearbeiten
    const appointmentResult = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND (user_id = $2 OR staff_id = $2)',
      [appointmentId, userId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(403).json({ error: 'Du bist nicht berechtigt, diese Notiz zu bearbeiten.' });
    }

    // Je nach Rolle (Kunde oder Mitarbeiter) die Notiz aktualisieren
    let updateQuery;
    let params;

    if (type === 'customer') {
      updateQuery = 'UPDATE appointments SET customer_note = $1 WHERE id = $2 AND user_id = $3';
      params = [note, appointmentId, userId];
    } else if (type === 'employee') {
      updateQuery = 'UPDATE appointments SET employee_note = $1 WHERE id = $2 AND staff_id = $3';
      params = [note, appointmentId, userId];
    } else {
      return res.status(400).json({ error: 'Ungültiger Notiztyp.' });
    }

    // Notiz in der entsprechenden Tabelle aktualisieren
    const result = await pool.query(updateQuery, params);

    if (result.rowCount > 0) {
      return res.status(200).json({ message: 'Notiz erfolgreich gespeichert.' });
    } else {
      return res.status(500).json({ error: 'Fehler beim Speichern der Notiz.' });
    }

  } catch (error) {
    console.error('Fehler beim Aktualisieren der Notiz:', error);
    return res.status(500).json({ error: 'Fehler beim Aktualisieren der Notiz.' });
  }
});

app.post('/api/book-appointment', async (req, res) => {
  const { start_time, end_time } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ error: 'Nicht angemeldet' });

  try {
    const conflict = await pool.query(
      'SELECT * FROM appointments WHERE start_time < $2 AND end_time > $1',
      [start_time, end_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Zeitraum ist bereits gebucht' });
    }

    await pool.query(
      'INSERT INTO appointments (user_id, start_time, end_time) VALUES ($1, $2, $3)',
      [userId, start_time, end_time]
    );

    res.status(200).json({ message: 'Termin gebucht' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
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