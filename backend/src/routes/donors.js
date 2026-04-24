const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createDonor, getDonors, getDonor } = require('../controllers/donorController');

router.get('/', getDonors);
router.get('/:id', getDonor);
router.post('/', auth, createDonor);

module.exports = router;
