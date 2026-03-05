import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Stethoscope, CheckCircle, XCircle, Check, X, Pencil, Trash2 } from 'lucide-react';

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '10px',
  color: 'white',
  background: 'transparent',
  border: hasError ? '1.5px solid #ef4444' : undefined,
  borderRadius: '8px',
  outline: 'none',
  boxSizing: 'border-box',
});

const FieldError = ({ msg }) =>
  msg ? (
    <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
      {msg}
    </span>
  ) : null;

const validateBooking = ({ pet_id, doctor_id, appointment_date, reason }) => {
  const errors = {};
  if (!pet_id) errors.pet_id = 'Please select a pet.';
  if (!doctor_id) errors.doctor_id = 'Please select a veterinarian.';
  if (!appointment_date) {
    errors.appointment_date = 'Please choose a date and time.';
  } else if (new Date(appointment_date) <= new Date()) {
    errors.appointment_date = 'Appointment must be in the future.';
  }
  if (!reason || !reason.trim()) errors.reason = 'Please describe the reason for the visit.';
  return errors;
};

const Appointments = () => {
  const { user } = useAuth();
  const { toast, confirm } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [booking, setBooking] = useState({ pet_id: '', doctor_id: '', appointment_date: '', reason: '' });
  const [bookingErrors, setBookingErrors] = useState({});
  const [editTarget, setEditTarget] = useState(null);
  const [editData, setEditData] = useState({ pet_id: '', doctor_id: '', appointment_date: '', reason: '' });
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [appts, myPets, vDocs] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments', config),
        axios.get('http://localhost:5000/api/pets', config),
        axios.get('http://localhost:5000/api/doctors'),
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

  const handleBookingChange = (field, value) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
    if (bookingErrors[field]) setBookingErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const errors = validateBooking(booking);
    if (Object.keys(errors).length > 0) { setBookingErrors(errors); return; }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/appointments', booking, config);
      fetchData();
      setBooking({ pet_id: '', doctor_id: '', appointment_date: '', reason: '' });
      setBookingErrors({});
      toast('Appointment booked successfully!', 'success');
    } catch (error) {
      toast('Error booking appointment', 'error');
    }
  };

  const openEdit = (appt) => {
    const localDate = new Date(appt.appointment_date);
    const pad = (n) => String(n).padStart(2, '0');
    const localISO = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
    setEditData({
      pet_id: appt.pet_id,
      doctor_id: appt.doctor_id,
      appointment_date: localISO,
      reason: appt.reason || '',
    });
    setEditErrors({});
    setEditTarget(appt);
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateBooking(editData);
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/appointments/${editTarget.id}`, editData, config);
      await fetchData();
      setEditTarget(null);
      toast('Appointment updated!', 'success');
    } catch (error) {
      toast(error.response?.data?.message || 'Error updating appointment', 'error');
    } finally {
      setSaving(false);
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

  const handleCancel = async (appt) => {
    const yes = await confirm('Cancel Appointment', 'Are you sure you want to cancel this appointment?', { danger: true, confirmText: 'Yes, Cancel' });
    if (!yes) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/appointments/${appt.id}/cancel`, {}, config);
      fetchData();
      toast('Appointment cancelled.', 'success');
    } catch (error) {
      toast(error.response?.data?.message || 'Error cancelling appointment', 'error');
    }
  };

  const handleDelete = async (appt) => {
    const yes = await confirm('Delete Appointment', 'Are you sure you want to permanently delete this cancelled appointment?', { danger: true, confirmText: 'Delete' });
    if (!yes) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/appointments/${appt.id}`, config);
      fetchData();
      toast('Appointment deleted.', 'success');
    } catch (error) {
      toast(error.response?.data?.message || 'Error deleting appointment', 'error');
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
              <form onSubmit={handleBooking} style={{ marginTop: '20px' }} noValidate>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Select Pet <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={booking.pet_id}
                    onChange={(e) => handleBookingChange('pet_id', e.target.value)}
                    className="glass-card"
                    style={inputStyle(bookingErrors.pet_id)}
                  >
                    <option value="" style={{ background: '#1e293b' }}>-- Select Pet --</option>
                    {pets.map(p => <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>{p.name}</option>)}
                  </select>
                  <FieldError msg={bookingErrors.pet_id} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Select Veterinarian <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={booking.doctor_id}
                    onChange={(e) => handleBookingChange('doctor_id', e.target.value)}
                    className="glass-card"
                    style={inputStyle(bookingErrors.doctor_id)}
                  >
                    <option value="" style={{ background: '#1e293b' }}>-- Select Doctor --</option>
                    {doctors.map(d => <option key={d.id} value={d.id} style={{ background: '#1e293b' }}>{d.name} ({d.specialization})</option>)}
                  </select>
                  <FieldError msg={bookingErrors.doctor_id} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Date &amp; Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={booking.appointment_date}
                    onChange={(e) => handleBookingChange('appointment_date', e.target.value)}
                    className="glass-card"
                    style={inputStyle(bookingErrors.appointment_date)}
                  />
                  <FieldError msg={bookingErrors.appointment_date} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Reason for visit <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={booking.reason}
                    onChange={(e) => handleBookingChange('reason', e.target.value)}
                    className="glass-card"
                    style={{ ...inputStyle(bookingErrors.reason), height: '100px', resize: 'vertical' }}
                    placeholder="Briefly describe the issue..."
                  />
                  <FieldError msg={bookingErrors.reason} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                  Confirm Booking
                </button>
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
                              <button onClick={() => updateStatus(appt.id, 'Approved')} style={{ background: 'rgba(34,197,94,0.15)', border: 'none', color: '#22c55e', padding: '6px', borderRadius: '5px', cursor: 'pointer' }}><Check size={16} /></button>
                              <button onClick={() => updateStatus(appt.id, 'Rejected')} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '5px', cursor: 'pointer' }}><X size={16} /></button>
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
                          {appt.reason && (
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                              Reason: {appt.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
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
                        {appt.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => openEdit(appt)}
                              title="Edit appointment"
                              style={{ background: 'rgba(99,102,241,0.15)', border: 'none', color: '#818cf8', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleCancel(appt)}
                              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {appt.status === 'Cancelled' && (
                          <button
                            onClick={() => handleDelete(appt)}
                            title="Delete appointment"
                            style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}
                          >
                            <Trash2 size={14} /> Delete
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

      <AnimatePresence>
        {editTarget && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card"
              style={{ padding: '40px', width: '100%', maxWidth: '450px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button
                onClick={() => setEditTarget(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '30px' }}>Edit Appointment</h2>
              <form onSubmit={handleEditSubmit} noValidate>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Select Pet <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={editData.pet_id}
                    onChange={(e) => handleEditChange('pet_id', e.target.value)}
                    className="glass-card"
                    style={inputStyle(editErrors.pet_id)}
                  >
                    <option value="" style={{ background: '#1e293b' }}>-- Select Pet --</option>
                    {pets.map(p => <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>{p.name}</option>)}
                  </select>
                  <FieldError msg={editErrors.pet_id} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Select Veterinarian <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={editData.doctor_id}
                    onChange={(e) => handleEditChange('doctor_id', e.target.value)}
                    className="glass-card"
                    style={inputStyle(editErrors.doctor_id)}
                  >
                    <option value="" style={{ background: '#1e293b' }}>-- Select Doctor --</option>
                    {doctors.map(d => <option key={d.id} value={d.id} style={{ background: '#1e293b' }}>{d.name} ({d.specialization})</option>)}
                  </select>
                  <FieldError msg={editErrors.doctor_id} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Date &amp; Time <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editData.appointment_date}
                    onChange={(e) => handleEditChange('appointment_date', e.target.value)}
                    className="glass-card"
                    style={inputStyle(editErrors.appointment_date)}
                  />
                  <FieldError msg={editErrors.appointment_date} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Reason for visit <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={editData.reason}
                    onChange={(e) => handleEditChange('reason', e.target.value)}
                    className="glass-card"
                    style={{ ...inputStyle(editErrors.reason), height: '100px', resize: 'vertical' }}
                    placeholder="Briefly describe the issue..."
                  />
                  <FieldError msg={editErrors.reason} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;
