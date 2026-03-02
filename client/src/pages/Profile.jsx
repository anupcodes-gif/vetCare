import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <div style={{ padding: '50px', textAlign: 'center' }}>Please login to view profile.</div>;

  const infoItems = [
    { label: 'Username', value: user.username, icon: User },
    { label: 'Email Address', value: user.email, icon: Mail },
    { label: 'Account Role', value: user.role, icon: Shield },
    { label: 'Member Since', value: new Date().toLocaleDateString(), icon: Calendar }, 
  ];

  return (
    <div style={{ paddingTop: '50px', display: 'flex', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '600px', padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            margin: '0 auto 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold' 
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <h2 style={{ margin: '0 0 10px 0' }}>{user.username}</h2>
          <span style={{ 
            padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', 
            background: user.role === 'Admin' ? 'rgba(234,179,8,0.15)' : 'rgba(99,102,241,0.15)',
            color: user.role === 'Admin' ? '#eab308' : '#818cf8',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {user.role} Account
          </span>
          <p style={{ color: '#94a3b8', marginTop: '15px' }}>Your Personal VetCare Profile</p>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {infoItems.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '10px' }}>
                <item.icon size={20} color="#6366f1" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: '1.1rem', color: '#e2e8f0' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: '40px', padding: '15px' }}>
          Edit Profile Information
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
