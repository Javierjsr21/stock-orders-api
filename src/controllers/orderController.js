const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');


const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in the order");
  }

  let total = 0;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];

    for (const item of items) {
      if (!item.cantidad || item.cantidad <= 0) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(
          `Invalid quantity for product: ${item.producto}. Quantity must be greater than 0`
        );
      }

      const product = await Product.findById(item.producto).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        res.status(404);
        throw new Error(`Product not found: ${item.producto}`);
      }

      if (product.stock < item.cantidad) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(
          `Insufficient stock for ${product.nombre}. Available: ${product.stock}`
        );
      }

      product.stock -= item.cantidad;
      await product.save({ session });

      orderItems.push({
        producto: product._id,
        cantidad: item.cantidad,
      });

      total += product.precio * item.cantidad;
    }

    const order = new Order({
      usuario: req.user._id,
      items: orderItems,
      total,
    });

    const createdOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});


const getOrders = asyncHandler(async (req, res) => {
  const orders =
    req.user.role === 'admin'
      ? await Order.find().populate('usuario', 'name email')
      : await Order.find({ usuario: req.user._id });

  res.json(orders);
});


const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('usuario', 'name email')
    .populate('items.producto', 'nombre precio');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});


const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.producto');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.estado === 'cancelado') {
    res.status(400);
    throw new Error('Order is already cancelled');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of order.items) {
      const product = await Product.findById(item.producto._id).session(session);
      if (product) {
        product.stock += item.cantidad;
        await product.save({ session });
      }
    }

    order.estado = 'cancelado';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
};
