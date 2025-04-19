// Beispiel: routes/user.routes.js (für Admin-Aktionen)
import express from 'express';
import userController from '../controllers/user.controller.js';
import authJwt from '../middleware/authJwt.js';

const router = express.Router();

// Route zum Auflisten aller Benutzer (nur für Admins)
router.get(
  '/',
 // Erst Token prüfen, dann Admin-Rolle
  userController.getAllUsers
);

// Weitere Admin-Routen...

export default router;