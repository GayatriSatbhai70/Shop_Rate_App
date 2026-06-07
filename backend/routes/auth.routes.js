const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/auth.controller');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

router.put('/change-password', authenticateToken, changePasswordValidator, validate, changePassword);

module.exports = router;
