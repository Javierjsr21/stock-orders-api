const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../utils/validators');

router.use(protect);

router.route('/').post([
  body('items').isArray({ min: 1 })
], validate, createOrder).get(getOrders);

router.route('/:id').get(getOrderById);
router.route('/:id/cancel').put(cancelOrder);

module.exports = router;