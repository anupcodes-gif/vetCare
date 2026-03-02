import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  return (
    <div style={{ paddingTop: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3rem', marginBottom: '20px' }}
        >
          Premium Care for Your <span style={{ color: '#6366f1' }}>Furry Friends</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 30px' }}
        >
          VetCare provide world-class veterinary services, real-time appointment booking, and a curated pet shop—all in one place.
        </motion.p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {!user ? (
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '15px 35px' }}>Get Started</Link>
          ) : user.role === 'Admin' ? (
            <Link to="/admin" className="btn-primary" style={{ textDecoration: 'none', padding: '15px 35px' }}>Admin Dashboard</Link>
          ) : (
            <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '15px 35px' }}>Go to Dashboard</Link>
          )}
          <Link to="/shop" className="glass-card" style={{ textDecoration: 'none', padding: '15px 35px', color: 'white' }}>Visit Shop</Link>
        </div>
      </header>

      <section className="responsive-grid">
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <ShieldCheck size={48} color="#6366f1" style={{ marginBottom: '20px' }} />
          <h3>Certified Doctors</h3>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Expert veterinary surgeons and specialists at your service.</p>
        </div>
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <HeartPulse size={48} color="#e11d48" style={{ marginBottom: '20px' }} />
          <h3>Real-time Booking</h3>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Book appointments instantly and track status updates.</p>
        </div>
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <Truck size={48} color="#22c55e" style={{ marginBottom: '20px' }} />
          <h3>E-commerce Shop</h3>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Premium pet food and supplies delivered to your door.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
