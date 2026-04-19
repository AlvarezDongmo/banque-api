const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());

// Sert les fichiers du dossier public (page HTML)
app.use(express.static(path.join(__dirname, '../public')));

// Routes API
const comptesRoutes = require('./routes/comptes');
const transactionsRoutes = require('./routes/transactions');

app.use('/api/comptes', comptesRoutes);
app.use('/api/transactions', transactionsRoutes);

module.exports = app;