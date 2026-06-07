const { body } = require('express-validator');

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const nameValidation = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters.');

const emailValidation = body('email')
  .trim()
  .isEmail()
  .withMessage('Must follow standard email validation rules.')
  .normalizeEmail();

const passwordValidation = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be between 8 and 16 characters.')
  .matches(passwordRegex)
  .withMessage('Password must contain at least one uppercase letter and one special character.');

const addressValidation = body('address')
  .trim()
  .isLength({ max: 400 })
  .withMessage('Address cannot exceed 400 characters.');

const registerValidator = [
  nameValidation,
  emailValidation,
  passwordValidation,
  addressValidation,
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must follow standard email validation rules.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const changePasswordValidator = [
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(passwordRegex)
    .withMessage('Password must contain at least one uppercase letter and one special character.'),
];

const adminCreateUserValidator = [
  nameValidation,
  emailValidation,
  passwordValidation,
  addressValidation,
  body('role')
    .isIn(['admin', 'user', 'owner'])
    .withMessage('Role must be one of: admin, user, owner.'),
];

const adminCreateStoreValidator = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must follow standard email validation rules.')
    .normalizeEmail(),
  passwordValidation, // Password to log in as the Store Owner user
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Store address cannot exceed 400 characters.'),
];

const submitRatingValidator = [
  body('storeId')
    .isInt()
    .withMessage('Store ID must be an integer.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

const modifyRatingValidator = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  adminCreateUserValidator,
  adminCreateStoreValidator,
  submitRatingValidator,
  modifyRatingValidator,
};
