const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { listUsers, deleteUser } = require('../controllers/adminController');

router.use(auth, isAdmin);

router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
