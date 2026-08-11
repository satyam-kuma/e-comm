const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '..', 'data_fallback');
const productsFile = path.join(dataDir, 'products.json');
const usersFile = path.join(dataDir, 'users.json');

const ensureDataDir = async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    // ignore
  }
};

const readJson = async (file, fallback = []) => {
  try {
    const content = await fs.readFile(file, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return fallback;
  }
};

const writeJson = async (file, data) => {
  await ensureDataDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
};

const defaultProducts = [
  {
    _id: uuidv4(),
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immersive sound experience with advanced active noise cancellation.',
    price: 299.99,
    category: 'Electronics',
    stock: 15,
    imageUrl: '',
    ratings: 4.8,
    numReviews: 24,
  },
  {
    _id: uuidv4(),
    name: 'Minimalist Modern Chair',
    description: 'A stylish and comfortable addition to any contemporary living room.',
    price: 150.0,
    category: 'Furniture',
    stock: 30,
    imageUrl: '',
    ratings: 4.2,
    numReviews: 12,
  }
];

const defaultUsers = [
  {
    _id: uuidv4(),
    name: 'Admin User',
    email: 'admin@shopnest.com',
    password: 'password123',
    role: 'admin',
  }
];

const getProducts = async () => {
  return readJson(productsFile, defaultProducts);
};

const getProductById = async (id) => {
  const products = await getProducts();
  return products.find(p => p._id === id || p._id == id);
};

const createProduct = async (data) => {
  const products = await getProducts();
  const item = { _id: uuidv4(), ...data };
  products.push(item);
  await writeJson(productsFile, products);
  return item;
};

const updateProduct = async (id, data) => {
  const products = await getProducts();
  const idx = products.findIndex(p => p._id === id || p._id == id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  await writeJson(productsFile, products);
  return products[idx];
};

const deleteProduct = async (id) => {
  const products = await getProducts();
  const idx = products.findIndex(p => p._id === id || p._id == id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  await writeJson(productsFile, products);
  return true;
};

const getUsers = async () => {
  return readJson(usersFile, defaultUsers);
};

const findUserByEmail = async (email) => {
  const users = await getUsers();
  return users.find(u => u.email === email);
};

const createUser = async (user) => {
  const users = await getUsers();
  const u = { _id: uuidv4(), ...user };
  users.push(u);
  await writeJson(usersFile, users);
  return u;
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  findUserByEmail,
  createUser,
};
