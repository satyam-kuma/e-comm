const mongoose = require('mongoose');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fileStore = require('../utils/fileStore');

const getProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({});
      return res.json(products);
    }
    const products = await fileStore.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) return res.json(product);
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = await fileStore.getProductById(req.params.id);
    if (product) return res.json(product);
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }
    if (mongoose.connection.readyState === 1) {
      const product = new Product({ name, description, price, category, stock, imageUrl });
      const createdProduct = await product.save();
      return res.status(201).json(createdProduct);
    }
    const createdProduct = await fileStore.createProduct({ name, description, price, category, stock, imageUrl });
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) {
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;

        if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path);
          product.imageUrl = result.secure_url;
        }
        const updatedProduct = await product.save();
        return res.json(updatedProduct);
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    let imageUrl = req.file ? (await cloudinary.uploader.upload(req.file.path)).secure_url : undefined;
    const updated = await fileStore.updateProduct(req.params.id, { name, description, price, category, stock, ...(imageUrl ? { imageUrl } : {}) });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) {
        await product.deleteOne();
        return res.json({ message: 'Product removed' });
      }
      return res.status(404).json({ message: 'Product not found' });
    }
    const ok = await fileStore.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
