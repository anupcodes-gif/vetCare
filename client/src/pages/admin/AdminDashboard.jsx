import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Stethoscope, Package, ShoppingBag,
  Users, Check, X, Plus, Trash2, ChevronRight, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const modal = useModal();
  const [activeTab, setActiveTab] = useState('overview');
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="admin-page-container" style={{ paddingTop: '10px' }}>
      <h2 style={{ marginBottom: '25px' }}>Admin Panel</h2>
      <div className="admin-layout" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        <div className="glass-card admin-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} className="mobile-hide" />}
            </button>
          ))}
        </div>

        
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab config={config} />}
              {activeTab === 'appointments' && <AppointmentsTab config={config} modal={modal} />}
              {activeTab === 'doctors' && <DoctorsTab config={config} modal={modal} />}
              {activeTab === 'products' && <ProductsTab config={config} modal={modal} />}
              {activeTab === 'orders' && <OrdersTab config={config} modal={modal} />}
              {activeTab === 'users' && <UsersTab config={config} modal={modal} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};


const OverviewTab = ({ config }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API}/admin/stats`, config);
        setStats(data.data);
      } catch (err) {
        console.error('Error fetching stats', err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return (
    <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        Loading dashboard statistics...
      </motion.div>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#14b8a6', bg: 'rgba(20,184,166,0.15)' },
    { label: 'Revenue', value: `Rs. ${stats.revenue}`, icon: TrendingUp, color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  ];

  return (
    <>
      <h3 style={{ marginBottom: '20px' }}>Dashboard Overview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px' }}>
        {cards.map(card => (
          <div key={card.label} className="glass-card" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: card.bg, padding: '10px', borderRadius: '10px', flexShrink: 0 }}>
              <card.icon size={20} color={card.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.label}</p>
              <h3 style={{ margin: 0, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};


const AppointmentsTab = ({ config, modal }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/appointments`, config);
      setAppointments(data.data);
    } catch (err) {
      console.error('Error fetching appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/appointments/${id}/status`, { status }, config);
      fetchAppointments();
    } catch (err) {
      modal.toast('Error updating status', 'error');
    }
  };

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#22c55e';
      case 'Completed': return '#10b981';
      case 'Rejected': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle size={14} />;
      case 'Completed': return <CheckCircle size={14} />;
      case 'Rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading appointments...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h3 style={{ margin: 0 }}>Manage Appointments</h3>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', maxWidth: '100%' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                background: filter === f ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.08)',
                color: filter === f ? '#fff' : '#94a3b8',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="table-container glass-card">
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Pet</th>
              <th style={{ padding: '15px' }}>User</th>
              <th style={{ padding: '15px' }}>Doctor</th>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Reason</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No appointments found.</td></tr>
            )}
            {filtered.map(appt => (
              <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {appt.Pet?.name || '—'}
                    <a href={`/pet-history/${appt.pet_id}`} target="_blank" rel="noreferrer" title="View History" style={{ color: '#6366f1', display: 'flex' }}><TrendingUp size={14}/></a>
                  </div>
                </td>
                <td style={{ padding: '15px' }}>{appt.User?.username || appt.user_id}</td>
                <td style={{ padding: '15px' }}>Dr. {appt.Doctor?.name || '—'}</td>
                <td style={{ padding: '15px' }}>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                <td style={{ padding: '15px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.reason || '—'}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                    background: `${getStatusColor(appt.status)}15`, color: getStatusColor(appt.status),
                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                  }}>
                    {getStatusIcon(appt.status)} {appt.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  {appt.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateStatus(appt.id, 'Approved')} title="Approve"
                        style={{ background: 'rgba(34,197,94,0.15)', border: 'none', color: '#22c55e', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <Check size={14} /> Accept
                      </button>
                      <button onClick={() => updateStatus(appt.id, 'Rejected')} title="Reject"
                        style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  ) : (appt.status === 'Approved' || appt.status === 'Completed') ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <button 
                        onClick={async () => {
                          const report = await modal.prompt(appt.report ? 'Edit Report' : 'Add Report', 'Enter visit summary and recommendations:', { defaultValue: appt.report || '', placeholder: 'e.g. Routine checkup completed...', confirmText: 'Save Report' });
                          if (report !== null) {
                            try {
                              await axios.put(`${API}/appointments/${appt.id}/report`, { report }, config);
                              fetchAppointments();
                              modal.toast('Report saved successfully', 'success');
                              
                              
                              const addToHistory = await modal.confirm(
                                'Sync to Health History',
                                'Would you like to add this visit and treatment to the pet\'s permanent medical history?',
                                { confirmText: 'Yes, Sync', cancelText: 'No, Just Save Report' }
                              );

                              if (addToHistory) {
                                try {
                                  await axios.post(`${API}/health/records`, {
                                    pet_id: appt.pet_id,
                                    diagnosis: appt.reason || 'General Visit',
                                    treatment: report,
                                    visit_date: appt.appointment_date
                                  }, config);
                                  modal.toast('Medical history updated!', 'success');
                                } catch (err) {
                                  modal.toast('Failed to update medical history', 'error');
                                }
                              }

                              
                              const addVaccine = await modal.confirm(
                                'Vaccination Administered?',
                                'Was a vaccination administered during this visit?',
                                { confirmText: 'Yes, Record Vaccine', cancelText: 'No' }
                              );

                              if (addVaccine) {
                                const vaccineName = await modal.prompt(
                                  'Vaccination Details',
                                  'Enter the name of the vaccine administered:',
                                  { placeholder: 'e.g. Rabies, DHPP...' }
                                );

                                if (vaccineName) {
                                  try {
                                    await axios.post(`${API}/health/vaccinations`, {
                                      pet_id: appt.pet_id,
                                      vaccine_name: vaccineName,
                                      date_administered: appt.appointment_date
                                    }, config);
                                    modal.toast('Vaccination record added!', 'success');
                                  } catch (err) {
                                    modal.toast('Failed to record vaccination', 'error');
                                  }
                                }
                              }
                            } catch (err) {
                              modal.toast('Error saving report', 'error');
                            }
                          }
                        }}
                        style={{ background: 'rgba(99,102,241,0.15)', border: 'none', color: '#6366f1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                      >
                        {appt.report ? 'Edit Report' : 'Add Report'}
                      </button>
                      {appt.report && (
                        <button 
                          onClick={() => modal.confirm('View Report', appt.report, { confirmText: 'Close', cancelText: null })}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          View Current
                        </button>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};


const DoctorsTab = ({ config, modal }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', specialization: '', experience: '' });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/doctors`);
      setDoctors(data.data);
    } catch (err) {
      console.error('Error fetching doctors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/doctors/${editingId}`, form, config);
      } else {
        await axios.post(`${API}/doctors`, form, config);
      }
      fetchDoctors();
      modal.toast(`Doctor ${editingId ? 'updated' : 'added'} successfully`, 'success');
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', specialization: '', experience: '' });
    } catch (err) {
      modal.toast(`Error ${editingId ? 'updating' : 'adding'} doctor`, 'error');
    }
  };

  const handleEdit = (doc) => {
    setForm({ name: doc.name, specialization: doc.specialization, experience: doc.experience });
    setEditingId(doc.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const yes = await modal.confirm('Delete Doctor', 'Are you sure you want to delete this doctor? This action can be undone.', { danger: true, confirmText: 'Delete' });
    if (!yes) return;
    try {
      await axios.delete(`${API}/doctors/${id}`, config);
      fetchDoctors();
      modal.toast('Doctor deleted', 'success');
    } catch (err) {
      modal.toast('Error deleting doctor', 'error');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading doctors...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Manage Doctors ({doctors.length})</h3>
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="glass-card"
            style={{ padding: '8px 15px', fontSize: '0.85rem', width: '220px', color: 'white' }}
          />
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', specialization: '', experience: '' }); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add Doctor'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '25px', marginBottom: '20px' }}>
          <h4>{editingId ? 'Edit Doctor' : 'New Doctor'}</h4>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white', border: 'none' }} placeholder="Dr. Name" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Specialization</label>
              <input type="text" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white', border: 'none' }} placeholder="e.g. Surgery" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Experience (yrs)</label>
              <input type="number" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white', border: 'none' }} placeholder="5" />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 20px', height: 'fit-content' }}>Save Doctor</button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {filteredDoctors.map(doc => (
          <div key={doc.id} className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                <div style={{ background: 'rgba(99,102,241,0.15)', padding: '12px', borderRadius: '10px' }}>
                  <Stethoscope size={22} color="#6366f1" />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Dr. {doc.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{doc.specialization}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleEdit(doc)} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(doc.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18}/></button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{doc.experience} years experience</p>
          </div>
        ))}
      </div>
    </>
  );
};


const ProductsTab = ({ config, modal }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [form, setForm] = useState({ name: '', category: 'Food', price: '', stock_quantity: '' });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/products`);
      setProducts(data.data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/products/${editingId}`, form, config);
      } else {
        await axios.post(`${API}/products`, form, config);
      }
      fetchProducts();
      modal.toast(`Product ${editingId ? 'updated' : 'added'} successfully`, 'success');
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', category: 'Food', price: '', stock_quantity: '' });
    } catch (err) {
      modal.toast(`Error ${editingId ? 'updating' : 'adding'} product`, 'error');
    }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, category: p.category, price: p.price, stock_quantity: p.stock_quantity });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const yes = await modal.confirm('Delete Product', 'Are you sure you want to remove this product from the shop?', { danger: true, confirmText: 'Delete' });
    if (!yes) return;
    try {
      await axios.delete(`${API}/products/${id}`, config);
      fetchProducts();
      modal.toast('Product deleted', 'success');
    } catch (err) {
      modal.toast('Error deleting product', 'error');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading products...</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Manage Products ({products.length})</h3>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="glass-card"
            style={{ padding: '8px 15px', fontSize: '0.85rem', width: '200px', color: 'white' }}
          />
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', category: 'Food', price: '', stock_quantity: '' }); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
        {['All', 'Food', 'Toys', 'Accessories', 'Healthcare'].map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} style={{
            padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            background: categoryFilter === c ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.08)',
            color: categoryFilter === c ? '#fff' : '#94a3b8',
          }}>{c}</button>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '25px', marginBottom: '20px' }}>
          <h4>{editingId ? 'Edit Product' : 'New Product'}</h4>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white', border: 'none' }} placeholder="Product name" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white', background: 'transparent', border: 'none' }}>
                {['Food', 'Toys', 'Accessories', 'Healthcare'].map(c => (
                  <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Price (Rs.)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white', border: 'none' }} placeholder="0.00" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Stock</label>
              <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white', border: 'none' }} placeholder="0" />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px', height: 'fit-content' }}>Save</button>
          </form>
        </motion.div>
      )}

      <div className="table-container glass-card">
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Name</th>
              <th style={{ padding: '15px' }}>Category</th>
              <th style={{ padding: '15px' }}>Price</th>
              <th style={{ padding: '15px' }}>Stock</th>
              <th style={{ padding: '15px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No products match your filter.</td></tr>
            )}
            {filteredProducts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px', fontWeight: '500' }}>{p.name}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '15px', fontSize: '0.8rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{p.category}</span>
                </td>
                <td style={{ padding: '15px' }}>Rs. {p.price}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ color: p.stock_quantity > 0 ? '#22c55e' : '#ef4444' }}>{p.stock_quantity}</span>
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}
                      style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};


const OrdersTab = ({ config, modal }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/orders`, config);
      setOrders(data.data);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}/status`, { status }, config);
      fetchOrders();
      modal.toast(`Order #${id} marked as ${status}`, 'success');
    } catch (err) {
      modal.toast('Error updating order status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#22c55e';
      case 'Processing': return '#3b82f6';
      case 'Cancelled': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>Loading orders...</div>;

  return (
    <>
      <h3 style={{ marginBottom: '20px' }}>Manage Orders</h3>
      <div className="table-container glass-card">
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Order #</th>
              <th style={{ padding: '15px' }}>User</th>
              <th style={{ padding: '15px' }}>Total</th>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No orders yet.</td></tr>
            )}
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px', fontWeight: '600' }}>#{order.id}</td>
                <td style={{ padding: '15px' }}>{order.User?.username || order.user_id}</td>
                <td style={{ padding: '15px' }}>Rs. {order.total_amount}</td>
                <td style={{ padding: '15px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                    background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status),
                  }}>{order.status}</span>
                </td>
                <td style={{ padding: '15px' }}>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {['Pending', 'Processing', 'Completed', 'Cancelled'].map(s => (
                      <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};


const UsersTab = ({ config, modal }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', role_id: 2 });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/admin/users`, config);
      setUsers(data.data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/admin/users/${editingId}`, form, config);
      } else {
        await axios.post(`${API}/admin/users`, form, config);
      }
      fetchUsers();
      modal.toast(`User ${editingId ? 'updated' : 'created'} successfully`, 'success');
      setShowForm(false);
      setEditingId(null);
      setForm({ username: '', email: '', password: '', role_id: 2 });
    } catch (err) {
      modal.toast(`Error ${editingId ? 'updating' : 'creating'} user`, 'error');
    }
  };

  const handleEdit = (u) => {
    setForm({ username: u.username, email: u.email, password: '', role_id: u.role_id || (u.Role?.name === 'Admin' ? 1 : 2) });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const yes = await modal.confirm('Delete User', 'Are you sure you want to delete this user?', { danger: true, confirmText: 'Delete' });
    if (!yes) return;
    try {
      await axios.delete(`${API}/admin/users/${id}`, config);
      fetchUsers();
      modal.toast('User deleted', 'success');
    } catch (err) {
      modal.toast('Error: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>All Users ({users.length})</h3>
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-card"
            style={{ padding: '8px 15px', fontSize: '0.85rem', width: '220px', color: 'white' }}
          />
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ username: '', email: '', password: '', role_id: 2 }); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '25px', marginBottom: '20px' }}>
          <h4>{editingId ? 'Edit User' : 'Create New User'}</h4>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Username</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white' }} />
            </div>
            {!editingId && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                  className="glass-card" style={{ width: '100%', padding: '10px', color: 'white' }} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Role</label>
              <select value={form.role_id} onChange={e => setForm({ ...form, role_id: parseInt(e.target.value) })}
                className="glass-card" style={{ width: '100%', padding: '10px', color: 'white' }}>
                <option value={2} style={{ background: '#1e293b' }}>User</option>
                <option value={1} style={{ background: '#1e293b' }}>Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px', height: 'fit-content' }}>Save</button>
          </form>
        </motion.div>
      )}

      <div className="table-container glass-card">
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Username</th>
              <th style={{ padding: '15px' }}>Email</th>
              <th style={{ padding: '15px' }}>Role</th>
              <th style={{ padding: '15px' }}>Joined</th>
              <th style={{ padding: '15px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px' }}>{u.id}</td>
                <td style={{ padding: '15px', fontWeight: '500' }}>{u.username}</td>
                <td style={{ padding: '15px', color: '#94a3b8' }}>{u.email}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '3px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600',
                    background: u.Role?.name === 'Admin' ? 'rgba(234,179,8,0.15)' : 'rgba(99,102,241,0.15)',
                    color: u.Role?.name === 'Admin' ? '#eab308' : '#818cf8',
                  }}>{u.Role?.name || 'User'}</span>
                </td>
                <td style={{ padding: '15px', color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleEdit(u)} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(u.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminDashboard;
