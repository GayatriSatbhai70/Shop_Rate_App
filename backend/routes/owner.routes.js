const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/owner.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('owner'));

router.get('/dashboard', getOwnerDashboard);

module.exports = router;
