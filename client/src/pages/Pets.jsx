import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PawPrint, Trash2, Plus, Info, Activity, X } from 'lucide-react';

const Pets = () => {
  const { user } = useAuth();
  const { toast, confirm } = useModal();
  const [pets, setPets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', species: '', breed: '', age: '' });

  const fetchPets = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/pets', config);
      setPets(data.data);
    } catch (error) {
      console.error('Error fetching pets', error);
    }
  };

  useEffect(() => {
    if (user) fetchPets();
  }, [user]);

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/pets', newPet, config);
      fetchPets();
      setShowAddModal(false);
      setNewPet({ name: '', species: '', breed: '', age: '' });
    } catch (error) {
      toast('Error adding pet', 'error');
    }
  };

  const deletePet = async (id) => {
    const yes = await confirm('Delete Pet', 'Are you sure you want to remove this pet?', { danger: true, confirmText: 'Delete' });
    if (yes) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/pets/${id}`, config);
        fetchPets();
        toast('Pet removed', 'success');
      } catch (error) {
        toast('Error deleting pet', 'error');
      }
    }
  };

  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0 }}>My Pets</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Register Pet
        </button>
      </div>

      <div className="responsive-grid">
        {pets.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <PawPrint size={64} opacity={0.2} color="#6366f1" />
            <div>
              <h3 style={{ color: 'white', marginBottom: '10px' }}>No pets registered yet</h3>
              <p style={{ margin: 0 }}>Add your first fuzzy friend to start booking appointments and tracking their health.</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '10px 25px' }}>Register Your First Pet</button>
          </div>
        ) : pets.map(pet => (
          <motion.div layout key={pet.id} className="glass-card" style={{ padding: '25px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>{pet.name}</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/pet-history/${pet.id}`} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <Activity size={16} /> History
                </Link>
                <button onClick={() => deletePet(pet.id)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}><strong>Species:</strong> {pet.species}</p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}><strong>Breed:</strong> {pet.breed || 'N/A'}</p>
            <p style={{ margin: '5px 0', color: '#94a3b8' }}><strong>Age:</strong> {pet.age} years</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '450px', position: 'relative' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '30px' }}>Register New Pet</h2>
              <form onSubmit={handleAddPet}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Name</label>
                  <input 
                    type="text" 
                    value={newPet.name} 
                    onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                    className="glass-card"
                    style={{ width: '100%', padding: '10px', color: 'white' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Species (e.g. Dog, Cat)</label>
                  <input 
                    type="text" 
                    value={newPet.species} 
                    onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                    className="glass-card"
                    style={{ width: '100%', padding: '10px', color: 'white' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Breed</label>
                  <input 
                    type="text" 
                    value={newPet.breed} 
                    onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                    className="glass-card"
                    style={{ width: '100%', padding: '10px', color: 'white' }}
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Age</label>
                  <input 
                    type="number" 
                    value={newPet.age} 
                    onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                    className="glass-card"
                    style={{ width: '100%', padding: '10px', color: 'white' }}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>Add Pet</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pets;
