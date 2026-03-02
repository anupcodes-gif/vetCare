import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/orders', config);
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders', error);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#22c55e';
      case 'Processing': return '#3b82f6';
      case 'Cancelled': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#fbbf24';
    }
  };

  return (
    <div style={{ paddingTop: '10px' }}>
      <h2 style={{ marginBottom: '25px' }}>Your Orders</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <ShoppingBag size={64} style={{ marginBottom: '20px', opacity: 0.2 }} color="#6366f1" />
            <h3 style={{ color: 'white', marginBottom: '10px' }}>No orders found</h3>
            <p style={{ marginBottom: '25px' }}>Looks like you haven't bought anything from our shop yet.</p>
            <a href="/shop" className="btn-primary" style={{ padding: '12px 30px', textDecoration: 'none', display: 'inline-block' }}>Start Shopping</a>
          </div>
        ) : orders.map(order => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={order.id} className="glass-card" style={{ padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <span style={{ 
                padding: '6px 15px', 
                borderRadius: '20px', 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                background: `${getStatusColor(order.status)}15`, 
                color: getStatusColor(order.status),
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {order.status === 'Completed' ? <CheckCircle size={14} /> : order.status === 'Cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                {order.status}
              </span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
              {order.OrderItems?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#e2e8f0' }}>{item.Product?.name || 'Unknown Product'} x {item.quantity}</span>
                  <span style={{ color: '#cbd5e1' }}>Rs. {item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '15px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span>Total Amount</span>
                <span style={{ color: '#6366f1' }}>Rs. {order.total_amount}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
