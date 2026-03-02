import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Stethoscope, CheckCircle, XCircle, Check, X } from 'lucide-react';

const Appointments = () => {
  const { user } = useAuth();
  const { toast } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [booking, setBooking] = useState({ pet_id: '', doctor_id: '', appointment_date: '', reason: '' });

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [appts, myPets, vDocs] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments', config),
        axios.get('http://localhost:5000/api/pets', config),
        axios.get('http://localhost:5000/api/doctors')
      ]);
      setAppointments(appts.data.data || []);
      setPets(myPets.data.data || []);
      setDoctors(vDocs.data.data || []);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/appointments', booking, config);
      fetchData();
      setBooking({ pet_id: '', doctor_id: '', appointment_date: '', reason: '' });
      toast('Appointment booked successfully!', 'success');
    } catch (error) {
      toast('Error booking appointment', 'error');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/appointments/${id}/status`, { status }, config);
      fetchData();
    } catch (error) {
      toast('Error updating status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#22c55e';
      case 'Completed': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Cancelled': return '#64748b';
      default: return '#fbbf24';
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div style={{ paddingTop: '10px' }}>
      <h2 style={{ marginBottom: '25px' }}>{isAdmin ? 'Manage Appointments' : 'Book an Appointment'}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {!isAdmin && (
          <div className="glass-card" style={{ padding: '30px', height: 'fit-content' }}>
            <h3>New Appointment</h3>
            <form onSubmit={handleBooking} style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Select Pet</label>
                <select 
                  value={booking.pet_id} 
                  onChange={(e) => setBooking({ ...booking, pet_id: e.target.value })}
                  className="glass-card"
                  style={{ width: '100%', padding: '10px', color: 'white', background: 'transparent' }}
                  required
                >
                  <option value="" style={{ background: '#1e293b' }}>-- Select Pet --</option>
                  {pets.map(p => <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Select Veterinarian</label>
                <select 
                  value={booking.doctor_id} 
                  onChange={(e) => setBooking({ ...booking, doctor_id: e.target.value })}
                  className="glass-card"
                  style={{ width: '100%', padding: '10px', color: 'white', background: 'transparent' }}
                  required
                >
                  <option value="" style={{ background: '#1e293b' }}>-- Select Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id} style={{ background: '#1e293b' }}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={booking.appointment_date} 
                  onChange={(e) => setBooking({ ...booking, appointment_date: e.target.value })}
                  className="glass-card"
                  style={{ width: '100%', padding: '10px', color: 'white' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Reason for visit</label>
                <textarea 
                  value={booking.reason} 
                  onChange={(e) => setBooking({ ...booking, reason: e.target.value })}
                  className="glass-card"
                  style={{ width: '100%', padding: '10px', color: 'white', height: '100px' }}
                  placeholder="Briefly describe the issue..."
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>Confirm Booking</button>
            </form>
          </div>
        )}

        
        <div>
          <h3 style={{ marginBottom: '20px' }}>{isAdmin ? 'All User Bookings' : 'Your Appointments'}</h3>
          
          {isAdmin ? (
            <div className="glass-card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '15px' }}>Pet</th>
                    <th style={{ padding: '15px' }}>User</th>
                    <th style={{ padding: '15px' }}>Doctor</th>
                    <th style={{ padding: '15px' }}>Date</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No appointments found.</td></tr>
                  )}
                  {appointments.map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px' }}>{appt.Pet?.name || '—'}</td>
                      <td style={{ padding: '15px' }}>{appt.User?.username || appt.user_id}</td>
                      <td style={{ padding: '15px' }}>Dr. {appt.Doctor?.name || '—'}</td>
                      <td style={{ padding: '15px' }}>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                          background: `${getStatusColor(appt.status)}15`, color: getStatusColor(appt.status)
                        }}>{appt.status}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {appt.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => updateStatus(appt.id, 'Approved')} style={{ background: 'rgba(34,197,94,0.15)', border: 'none', color: '#22c55e', padding: '6px', borderRadius: '5px', cursor: 'pointer' }}><Check size={16}/></button>
                            <button onClick={() => updateStatus(appt.id, 'Rejected')} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '5px', cursor: 'pointer' }}><X size={16}/></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {appointments.length === 0 && <p style={{ color: '#94a3b8' }}>No appointments scheduled yet.</p>}
              {appointments.map(appt => (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={appt.id} className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ background: 'rgba(99,102,241,0.1)', padding: '12px', borderRadius: '12px' }}>
                        <CalendarIcon size={28} color="#6366f1" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{appt.Pet?.name} with Dr. {appt.Doctor?.name}</h4>
                        <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={14} /> {new Date(appt.appointment_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        padding: '6px 16px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold', 
                        background: `${getStatusColor(appt.status)}20`, 
                        color: getStatusColor(appt.status),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {appt.status === 'Approved' ? <CheckCircle size={14} /> : appt.status === 'Rejected' ? <XCircle size={14} /> : appt.status === 'Completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {appt.status}
                      </span>
                      {!isAdmin && appt.status === 'Pending' && (
                        <button 
                          onClick={async () => {
                            const yes = await modal.confirm('Cancel Appointment', 'Are you sure you want to cancel this appointment?', { danger: true, confirmText: 'Yes, Cancel' });
                            if (yes) updateStatus(appt.id, 'Cancelled');
                          }}
                          style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {appt.report && (
                    <div style={{ 
                      padding: '20px', 
                      background: 'rgba(16, 185, 129, 0.05)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Stethoscope size={18} color="#10b981" />
                        <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Veterinarian Report</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0', lineHeight: '1.6' }}>{appt.report}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
