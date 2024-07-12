const express = require('express');
const router = express.Router();
const { checkAccount, checkPin, withdraw, } = require('../controllers/atm.controller');

router.post('/check-account', checkAccount);
router.post('/check-pin', checkPin);
router.post('/withdraw', withdraw);

module.exports = router;
