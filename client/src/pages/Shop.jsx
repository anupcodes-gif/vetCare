import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ShoppingBag, Tag, Trash2, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const { user } = useAuth();
  const { toast } = useModal();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = category ? `http://localhost:5000/api/products?category=${category}` : 'http://localhost:5000/api/products';
      const { data } = await axios.get(url);
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    try {
      if (!user) return toast('Please login to checkout', 'warning');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const orderData = {
        total_amount: totalAmount,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      await axios.post('http://localhost:5000/api/orders', orderData, config);
      toast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (error) {
      toast('Error placing order', 'error');
    }
  };

  const categories = ['All', 'Food', 'Toys', 'Accessories', 'Healthcare'];

  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0 }}>Pet Shop</h2>
        <div style={{ position: 'relative', cursor: 'pointer', background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '12px' }} onClick={() => setShowCart(true)}>
          <ShoppingCart size={24} color="#6366f1" />
          {cart.length > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e11d48', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat === 'All' ? '' : cat)}
            className={category === (cat === 'All' ? '' : cat) ? 'btn-primary' : 'glass-card'}
            style={{ padding: '8px 20px', whiteSpace: 'nowrap', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '20px', fontSize: '0.9rem' }}
          >
           {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading products...</div>
      ) : (
        <>
          <div className="responsive-grid">
            {products.map(product => (
              <motion.div whileHover={{ y: -5 }} key={product.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Tag size={40} color="#475569" />}
                </div>
                  <h3 style={{ marginBottom: '5px', fontSize: '1.1rem' }}>{product.name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '15px' }}>{product.category}</p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#818cf8' }}>Rs. {product.price}</span>
                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 'bold' }}>Only {product.stock_quantity} left!</span>
                      )}
                    </div>
                    {product.stock_quantity > 0 ? (
                      <button onClick={() => addToCart(product)} className="btn-primary" style={{ padding: '8px 15px', fontSize: '0.8rem' }}>Add</button>
                    ) : (
                      <button disabled style={{ padding: '8px 15px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'not-allowed', border: 'none', borderRadius: '8px' }}>Sold Out</button>
                    )}
                  </div>
                </motion.div>
            ))}
          </div>
          {products.length === 0 && <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>No products found in this category.</div>}
        </>
      )}

      
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100 }}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', maxWidth: '100%', background: '#0f172a', zIndex: 1101, padding: '25px', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShoppingCart /> Your Cart</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {cart.length > 0 && (
                    <button 
                      onClick={() => {
                        modal.confirm('Clear Cart', 'Are you sure you want to remove all items?', { danger: true, confirmText: 'Clear All' })
                          .then(yes => yes && setCart([]));
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Clear
                    </button>
                  )}
                  <button onClick={() => setShowCart(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24}/></button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                {cart.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '15px' }}>
                    <ShoppingBag size={48} opacity={0.3} />
                    <p>Your cart is empty.</p>
                    <button onClick={() => setShowCart(false)} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Go Shopping</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {cart.map(item => (
                      <div key={item.id} className="glass-card" style={{ padding: '15px', display: 'flex', gap: '15px' }}>
                         <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                           {item.image_url ? <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : <Tag size={20} />}
                         </div>
                         <div style={{ flex: 1 }}>
                           <h4 style={{ margin: 0 }}>{item.name}</h4>
                           <p style={{ margin: '3px 0', fontSize: '0.85rem', color: '#94a3b8' }}>Rs. {item.price} x {item.quantity}</p>
                         </div>
                         <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontSize: '1.1rem' }}>Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#6366f1' }}>Rs. {totalAmount}</span>
                  </div>
                  <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    Checkout <Check size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
