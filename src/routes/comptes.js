const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { comptes } = require('../data/db');

// GET /api/comptes — Liste tous les comptes
router.get('/', (req, res) => {
  res.json({
    succes: true,
    total: comptes.length,
    comptes: comptes
  });
});

// GET /api/comptes/:id — Voir un compte spécifique
router.get('/:id', (req, res) => {
  const compte = comptes.find(c => c.id === req.params.id);
  if (!compte) {
    return res.status(404).json({ succes: false, message: 'Compte introuvable' });
  }
  res.json({ succes: true, compte });
});

// POST /api/comptes — Créer un nouveau compte
router.post('/', (req, res) => {
  const { nom, prenom, email } = req.body;

  // Validation
  if (!nom || !prenom || !email) {
    return res.status(400).json({
      succes: false,
      message: 'Les champs nom, prenom et email sont obligatoires'
    });
  }

  // Vérifier si l'email existe déjà
  const emailExiste = comptes.find(c => c.email === email);
  if (emailExiste) {
    return res.status(400).json({
      succes: false,
      message: 'Un compte avec cet email existe déjà'
    });
  }

  const nouveauCompte = {
    id: uuidv4(),
    nom,
    prenom,
    email,
    solde: 0,
    dateCreation: new Date().toISOString()
  };

  comptes.push(nouveauCompte);

  res.status(201).json({
    succes: true,
    message: 'Compte créé avec succès',
    compte: nouveauCompte
  });
});

module.exports = router;