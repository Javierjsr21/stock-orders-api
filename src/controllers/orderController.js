const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Order items required');
    }
    session.startTransaction();
    const productIds = items.map(i => i.producto);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productsMap = new Map(products.map(p => [p._id.toString(), p]));
    let total = 0;
    const orderItems = [];
    for (const it of items) {
      const prod = productsMap.get(it.producto);
      if (!prod) {
        await session.abortTransaction();
        res.status(400);
        throw new Error(`Product not found: ${it.producto}`);
      }
      if (prod.stock < it.cantidad) {
        await session.abortTransaction();
        res.status(400);
        throw new Error(`Insufficient stock for product ${prod._id}`);
      }
      const subtotal = prod.precio * it.cantidad;
      total += subtotal;
      orderItems.push({ producto: prod._id, cantidad: it.cantidad, precioUnitario: prod.precio, subtotal });
      prod.stock -= it.cantidad;
      await prod.save({ session });
    }
    const order = await Order.create([{
      usuario: req.user.id,
      items: orderItems,
      total,
      estado: 'activo'
    }], { session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(order[0]);
  } catch (error) {
    try { await session.abortTransaction(); } catch (e) {}
    session.endSession();
    throw error;
  }
});

exports.getOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') filter.usuario = req.user.id;
  const orders = await Order.find(filter).populate('usuario', 'name email').populate('items.producto');
  res.json(orders);
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('usuario', 'name email').populate('items.producto');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (req.user.role !== 'admin' && order.usuario._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json(order);
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.estado === 'cancelado') {
      await session.abortTransaction();
      res.status(400);
      throw new Error('Order already cancelled');
    }
    if (req.user.role !== 'admin' && order.usuario.toString() !== req.user.id) {
      await session.abortTransaction();
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }
    for (const it of order.items) {
      const prod = await Product.findById(it.producto).session(session);
      if (prod) {
        prod.stock += it.cantidad;
        await prod.save({ session });
      }
    }
    order.estado = 'cancelado';
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    try { await session.abortTransaction(); } catch (e) {}
    session.endSession();
    throw error;
  }
});