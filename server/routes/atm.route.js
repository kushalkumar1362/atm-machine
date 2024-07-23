const express = require('express');
const router = express.Router();
const { checkBlacklist, authenticateToken } = require('../middlewares/auth.middleware');
const { checkAccount, checkPin, withdraw, generateReceipt, invalidateSession, checkBalance } = require('../controllers/atm.controller');

// Apply the middleware to the routes
router.post('/check-account', checkAccount);
router.post('/check-pin', checkBlacklist, authenticateToken, checkPin);
router.post('/withdraw', checkBlacklist, authenticateToken, withdraw);
router.post('/receipt', checkBlacklist, authenticateToken, generateReceipt);
router.post('/invalidate-session', checkBlacklist, authenticateToken, invalidateSession);
router.post('/check-balance', checkBlacklist, authenticateToken, checkBalance);

module.exports = router;
