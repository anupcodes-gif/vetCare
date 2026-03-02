import { useParams, useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Plus, Calendar, Clipboard, History, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const PetHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useModal();
  const [history, setHistory] = useState({ records: [], vaccinations: [] });
  const [loading, setLoading] = useState(true);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [recordForm, setRecordForm] = useState({ diagnosis: '', treatment: '', visit_date: '' });
  const [vaccineForm, setVaccineForm] = useState({ vaccine_name: '', date_administered: '', next_due_date: '' });

  const fetchHistory = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/health/pet/${id}`, config);
      setHistory(data.data);
    } catch (error) {
      console.error('Error fetching pet history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) fetchHistory();
  }, [user, id]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/health/records', { ...recordForm, pet_id: id }, config);
      fetchHistory();
      setShowRecordForm(false);
      setRecordForm({ diagnosis: '', treatment: '', visit_date: '' });
    } catch (error) {
      toast('Error adding record', 'error');
    }
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/health/vaccinations', { ...vaccineForm, pet_id: id }, config);
      fetchHistory();
      setShowVaccineForm(false);
      setVaccineForm({ vaccine_name: '', date_administered: '', next_due_date: '' });
    } catch (error) {
      toast('Error adding vaccination', 'error');
    }
  };

  const isAdmin = user.role === 'Admin';

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading pet history...</div>;

  return (
    <div style={{ paddingTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/pets')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0 }}><History size={32} color="#6366f1" /> Pet Health History</h2>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setShowRecordForm(!showRecordForm); setShowVaccineForm(false); }} className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Add Record
            </button>
            <button onClick={() => { setShowVaccineForm(!showVaccineForm); setShowRecordForm(false); }} className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Plus size={18} /> Add Vaccine
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRecordForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3>New Medical Record</h3>
            <form onSubmit={handleAddRecord} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label>Diagnosis</label>
                <input className="glass-card" style={{ width: '100%', padding: '12px', marginTop: '5px', color: 'white' }} value={recordForm.diagnosis} onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})} required />
              </div>
              <div>
                <label>Treatment</label>
                <input className="glass-card" style={{ width: '100%', padding: '12px', marginTop: '5px', color: 'white' }} value={recordForm.treatment} onChange={e => setRecordForm({...recordForm, treatment: e.target.value})} />
              </div>
              <div>
                <label>Visit Date</label>
                <input type="date" className="glass-card" style={{ width: '100%', padding: '12px', marginTop: '5px', color: 'white' }} value={recordForm.visit_date} onChange={e => setRecordForm({...recordForm, visit_date: e.target.value})} required />
              </div>
              <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '12px' }}>Save Record</button>
            </form>
          </motion.div>
        )}

        {showVaccineForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3>New Vaccination</h3>
            <form onSubmit={handleAddVaccine} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label>Vaccine Name</label>
                <input className="glass-card" style={{ width: '100%', padding: '12px', marginTop: '5px', color: 'white' }} value={vaccineForm.vaccine_name} onChange={e => setVaccineForm({...vaccineForm, vaccine_name: e.target.value})} required />
              </div>
              <div>
                <label>Administered Date</label>
                <input type="date" className="glass-card" style={{ width: '100%', padding: '12px', marginTop: '5px', color: 'white' }} value={vaccineForm.date_administered} onChange={e => setVaccineForm({...vaccineForm, date_administered: e.target.value})} required />
              </div>
              <div>
                <label>Next Due Date</label>
                <input type="date" className="glass-card" style={{ width: '100%', padding: '12px', marginTop: '5px', color: 'white' }} value={vaccineForm.next_due_date} onChange={e => setVaccineForm({...vaccineForm, next_due_date: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>Save Vaccination</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        <div className="glass-card" style={{ padding: '25px' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clipboard size={24} color="#6366f1" /> Medical Visits
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.records.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No medical records yet.</p>}
            {history.records.map(record => (
              <div key={record.id} style={{ padding: '15px', borderLeft: '3px solid #6366f1', background: 'rgba(255,255,255,0.02)', borderRadius: '0 10px 10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>{record.diagnosis}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(record.visit_date).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}><strong>Treatment:</strong> {record.treatment || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        
        <div className="glass-card" style={{ padding: '25px' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} color="#10b981" /> Vaccinations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.vaccinations.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No vaccinations recorded.</p>}
            {history.vaccinations.map(v => (
              <div key={v.id} style={{ padding: '15px', borderLeft: '3px solid #10b981', background: 'rgba(255,255,255,0.02)', borderRadius: '0 10px 10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h4 style={{ margin: 0 }}>{v.vaccine_name}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(v.date_administered).toLocaleDateString()}</span>
                </div>
                {v.next_due_date && (
                  <p style={{ margin: '5px 0 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b' }}>
                    <Calendar size={14} /> Next due: {new Date(v.next_due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetHistory;
