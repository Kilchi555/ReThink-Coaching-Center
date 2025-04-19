// Beispiel: routes/customer.routes.js (für Mitarbeiter-Aktionen)
import express from 'express';
import customerController from '../controllers/customer.controller.js';
import authJwt from '../middleware/authJwt.js';

const router = express.Router();

// Route zum Auflisten aller Kunden (nur für Mitarbeiter)
router.get(
    '/',
 // Erst Token prüfen, dann Mitarbeiter-Rolle
    customerController.getAllCustomers
);

// Route zum Hinzufügen eines Kunden (nur für Mitarbeiter)
 router.post(
    '/',
   
    customerController.createCustomer
);

// Weitere Mitarbeiter-Routen...

export default router;