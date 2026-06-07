const { validationResult, body } = require('express-validator');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/test', [
  body('email').normalizeEmail()
], (req, res) => {
  res.json({ email: req.body.email });
});

const req = {
  body: { email: 'admin@shoprate.com' }
};

const res = {
  json: (data) => console.log('Normalized output:', data)
};

const { matchedData } = require('express-validator');
const validator = require('validator');
console.log('Validator normalizeEmail:', validator.normalizeEmail('admin@shoprate.com'));
console.log('Validator normalizeEmail caps:', validator.normalizeEmail('Admin@ShopRate.com'));
