const express = require('express');
const router = express.Router();
const { checkAccount, checkPin, withdraw, generateReceipt } = require('../controllers/atm.controller');

router.post('/check-account', checkAccount);
router.post('/check-pin', checkPin);
router.post('/withdraw', withdraw);
router.post('/receipt', generateReceipt);

module.exports = router;
