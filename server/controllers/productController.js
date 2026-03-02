const Product = require('../models/Product');




const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { where: { category } } : {};
    const products = await Product.findAll(filter);
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.destroy();
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const updateProduct = async (req, res) => {
  const { name, category, price, stock_quantity, image_url } = req.body;
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price || product.price;
    product.stock_quantity = stock_quantity || product.stock_quantity;
    product.image_url = image_url || product.image_url;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, addProduct, deleteProduct, updateProduct };
