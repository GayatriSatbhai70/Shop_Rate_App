const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetails,
} = require('../controllers/admin.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { adminCreateUserValidator, adminCreateStoreValidator } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/users', adminCreateUserValidator, validate, createUser);
router.post('/stores', upload.single('image'), adminCreateStoreValidator, validate, createStore);
router.get('/users', listUsers);
router.get('/users/:id', getUserDetails);
router.get('/stores', listStores);

module.exports = router;
