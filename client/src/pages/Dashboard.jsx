
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { PawPrint, Calendar, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0' }}>Hello, {user?.username}! 👋</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>Welcome to your vet care command center.</p>
      </div>
      
      <div className="responsive-grid">
        <Link to="/pets" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '12px', borderRadius: '12px' }}>
              <PawPrint size={32} color="#6366f1" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>My Pets</h3>
              <p style={{ color: '#94a3b8', margin: '5px 0 0' }}>Manage your fuzzy family</p>
            </div>
          </motion.div>
        </Link>

        <Link to="/appointments" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(225, 29, 72, 0.2)', padding: '15px', borderRadius: '12px' }}>
              <Calendar size={32} color="#e11d48" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Appointments</h3>
              <p style={{ color: '#94a3b8', margin: '5px 0 0' }}>Schedule a health check</p>
            </div>
          </motion.div>
        </Link>

        <Link to="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div whileHover={{ scale: 1.02 }} className="glass-card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '15px', borderRadius: '12px' }}>
              <ShoppingBag size={32} color="#22c55e" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Pet Shop</h3>
              <p style={{ color: '#94a3b8', margin: '5px 0 0' }}>Buy premium food & toys</p>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
