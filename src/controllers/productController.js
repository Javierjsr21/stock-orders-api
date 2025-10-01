const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

exports.createProduct = asyncHandler(async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  const product = await Product.create({ nombre, descripcion, precio, stock, categoria });
  res.status(201).json(product);
});

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  product.nombre = nombre ?? product.nombre;
  product.descripcion = descripcion ?? product.descripcion;
  product.precio = precio ?? product.precio;
  product.stock = stock ?? product.stock;
  product.categoria = categoria ?? product.categoria;
  await product.save();
  res.json(product);
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ message: "Product removed" });
});