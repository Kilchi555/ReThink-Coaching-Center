// middleware/authJwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  let token = req.headers['authorization']; // Erwartet "Bearer <token>"

  if (!token ||!token.startsWith('Bearer ')) {
    return res.status(403).send({ message: 'Kein Token bereitgestellt!' });
  }

  token = token.slice(7, token.length); // Entfernt "Bearer "

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      // Unterscheiden zwischen abgelaufenem Token und ungültigem Token
      if (err.name === 'TokenExpiredError') {
          return res.status(401).send({ message: 'Unauthorized! Token ist abgelaufen.' });
      }
      return res.status(401).send({ message: 'Unauthorized! Ungültiges Token.' });
    }
    // Speichert die dekodierten Benutzerinformationen im Request-Objekt
    req.user = { id: decoded.userId, role: decoded.role };
    console.log("Token verifiziert für User:", req.user.id, "mit Rolle:", req.user.role); // Debugging
    next(); // Geht zur nächsten Middleware oder zum Controller
  });
};

// Middleware zur Prüfung auf Admin-Rolle
const isAdmin = (req, res, next) => {
    // Stellt sicher, dass verifyToken vorher gelaufen ist und req.user gesetzt hat
    if (!req.user) {
         return res.status(403).send({ message: 'Fehler: Benutzerinformation nicht gefunden nach Token-Verifizierung.' });
    }
    console.log("Prüfe auf Admin-Rolle für User:", req.user.id, "Aktuelle Rolle:", req.user.role); // Debugging
    if (req.user.role === 'admin') {
        next();
        return;
    }
    res.status(403).send({ message: 'Admin-Rolle erforderlich!' });
};

// Middleware zur Prüfung auf Mitarbeiter-Rolle
const isEmployee = (req, res, next) => {
    if (!req.user) {
         return res.status(403).send({ message: 'Fehler: Benutzerinformation nicht gefunden nach Token-Verifizierung.' });
    }
    console.log("Prüfe auf Employee-Rolle für User:", req.user.id, "Aktuelle Rolle:", req.user.role); // Debugging
    if (req.user.role === 'employee' || req.user.role === 'admin') { // Admins dürfen oft auch Mitarbeiter-Aktionen
        next();
        return;
        }
        res.status(403).send({ message: 'Mitarbeiter-Rolle erforderlich!' });
        };

         // Middleware zur Prüfung auf Kunden-Rolle (oder Admin/Employee, falls diese auch Kundenaktionen dürfen)
const isCustomer = (req, res, next) => {
    if (!req.user) {
         return res.status(403).send({ message: 'Fehler: Benutzerinformation nicht gefunden nach Token-Verifizierung.' });
    }
    console.log("Prüfe auf Customer-Rolle für User:", req.user.id, "Aktuelle Rolle:", req.user.role); // Debugging
     // Hier anpassen, welche Rollen Zugriff haben sollen
    if (req.user.role === 'customer' || req.user.role === 'admin' || req.user.role === 'employee') {
    next();
    return;
    }
    res.status(403).send({ message: 'Kunden-Zugriff erforderlich!' });
    };

    const authJwt = {
        verifyToken,
        isAdmin,
        isEmployee,
        isCustomer
      };
      export default authJwt;