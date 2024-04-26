const express = require('express');
const { banUser } = require('../controllers/users');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.route('/:id/ban').post(protect, authorize('admin'), banUser);

module.exports = router;
