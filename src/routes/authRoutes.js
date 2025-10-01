const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], validate, register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], validate, login);

module.exports = router;