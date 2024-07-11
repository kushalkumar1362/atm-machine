const express = require('express');
const router = express.Router();
const { withdraw } = require('../controllers/atm.controller');

router.post('/withdraw', withdraw);

module.exports = router;
