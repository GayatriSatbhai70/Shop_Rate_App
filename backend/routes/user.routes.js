const express = require('express');
const router = express.Router();
const {
  listStoresForUser,
  submitRating,
  modifyRating,
} = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const { submitRatingValidator, modifyRatingValidator } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('user'));

router.get('/stores', listStoresForUser);
router.post('/ratings', submitRatingValidator, validate, submitRating);
router.put('/ratings/:id', modifyRatingValidator, validate, modifyRating);

module.exports = router;
