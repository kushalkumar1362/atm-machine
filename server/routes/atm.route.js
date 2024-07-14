const express = require('express');
const router = express.Router();
const { checkAccount, checkPin, withdraw, generateReceipt, invalidateSession } = require('../controllers/atm.controller');

router.post('/check-account', checkAccount);
router.post('/check-pin', checkPin);
router.post('/withdraw', withdraw);
router.post('/receipt', generateReceipt);
router.post('/receipt', generateReceipt);
router.post('/invalidate-session', invalidateSession);

module.exports = router;
