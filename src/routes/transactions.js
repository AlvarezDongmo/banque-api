const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { comptes, transactions } = require('../data/db');

// GET /api/transactions — Liste toutes les transactions
router.get('/', (req, res) => {
  res.json({
    succes: true,
    total: transactions.length,
    transactions
  });
});

// GET /api/transactions/:idCompte — Transactions d'un compte
router.get('/:idCompte', (req, res) => {
  const compte = comptes.find(c => c.id === req.params.idCompte);
  if (!compte) {
    return res.status(404).json({ succes: false, message: 'Compte introuvable' });
  }

  const transactionsCompte = transactions.filter(
    t => t.idCompte === req.params.idCompte
  );

  res.json({ succes: true, compte: compte.nom, transactions: transactionsCompte });
});

// POST /api/transactions/depot — Faire un dépôt
router.post('/depot', (req, res) => {
  const { idCompte, montant, description } = req.body;

  if (!idCompte || !montant) {
    return res.status(400).json({
      succes: false,
      message: 'idCompte et montant sont obligatoires'
    });
  }

  if (montant <= 0) {
    return res.status(400).json({
      succes: false,
      message: 'Le montant doit être positif'
    });
  }

  const compte = comptes.find(c => c.id === idCompte);
  if (!compte) {
    return res.status(404).json({ succes: false, message: 'Compte introuvable' });
  }

  // Mise à jour du solde
  compte.solde += montant;

  const transaction = {
    id: uuidv4(),
    idCompte,
    type: 'DEPOT',
    montant,
    description: description || 'Dépôt',
    soldeAvant: compte.solde - montant,
    soldeApres: compte.solde,
    date: new Date().toISOString()
  };

  transactions.push(transaction);

  res.status(201).json({
    succes: true,
    message: `Dépôt de ${montant} FCFA effectué`,
    transaction,
    nouveauSolde: compte.solde
  });
});

// POST /api/transactions/retrait — Faire un retrait
router.post('/retrait', (req, res) => {
  const { idCompte, montant, description } = req.body;

  if (!idCompte || !montant) {
    return res.status(400).json({
      succes: false,
      message: 'idCompte et montant sont obligatoires'
    });
  }

  if (montant <= 0) {
    return res.status(400).json({
      succes: false,
      message: 'Le montant doit être positif'
    });
  }

  const compte = comptes.find(c => c.id === idCompte);
  if (!compte) {
    return res.status(404).json({ succes: false, message: 'Compte introuvable' });
  }

  // Vérifier le solde suffisant
  if (compte.solde < montant) {
    return res.status(400).json({
      succes: false,
      message: `Solde insuffisant. Solde actuel: ${compte.solde} FCFA`
    });
  }

  // Mise à jour du solde
  compte.solde -= montant;

  const transaction = {
    id: uuidv4(),
    idCompte,
    type: 'RETRAIT',
    montant,
    description: description || 'Retrait',
    soldeAvant: compte.solde + montant,
    soldeApres: compte.solde,
    date: new Date().toISOString()
  };

  transactions.push(transaction);

  res.status(201).json({
    succes: true,
    message: `Retrait de ${montant} FCFA effectué`,
    transaction,
    nouveauSolde: compte.solde
  });
});

module.exports = router;