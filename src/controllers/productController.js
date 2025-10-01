const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Crear producto
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;

  const product = new Product({
    nombre,
    descripcion,
    precio,
    stock,
    categoria
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// @desc    Obtener producto por ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.nombre = nombre ?? product.nombre;
  product.descripcion = descripcion ?? product.descripcion;
  product.precio = precio ?? product.precio;
  product.stock = stock ?? product.stock;
  product.categoria = categoria ?? product.categoria;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Eliminar producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ message: 'Product removed' });
});

// ✅ Exportar TODOS los controladores
module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
