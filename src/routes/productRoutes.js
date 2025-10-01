const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

router.use(protect);

router.route('/').get(getProducts).post(adminOnly, [
  body('nombre').notEmpty(),
  body('precio').isNumeric()
], validate, createProduct);

router.route('/:id').get(getProductById).put(adminOnly, updateProduct).delete(adminOnly, deleteProduct);

module.exports = router;