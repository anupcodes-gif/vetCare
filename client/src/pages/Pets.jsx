import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PawPrint, Trash2, Plus, Activity, X, Pencil } from 'lucide-react';


const inputStyle = (hasError) => ({
  width: '100%',
  padding: '10px',
  color: 'white',
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

const validatePetForm = ({ name, species, age }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Pet name is required.';
  if (!species.trim()) errors.species = 'Species is required.';
  if (age === '' || age === null || age === undefined) {
    errors.age = 'Age is required.';
  } else if (Number(age) < 0) {
    errors.age = 'Age cannot be negative.';
  }
  return errors;
};

const PetCard = ({ pet, onDelete, onRefresh, user, toast }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: pet.name,
    species: pet.species,
    breed: pet.breed || '',
    age: pet.age,
  });
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setEditData({ name: pet.name, species: pet.species, breed: pet.breed || '', age: pet.age });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleEditPet = async (e) => {
    e.preventDefault();
    const errors = validatePetForm(editData);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/pets/${pet.id}`, editData, config);
      await onRefresh();
      setShowEditModal(false);
      toast('Pet details updated!', 'success');
    } catch (error) {
      toast('Error updating pet', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div layout className="glass-card" style={{ padding: '25px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>{pet.name}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to={`/pet-history/${pet.id}`}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'none',
                fontSize: '0.85rem',
              }}
            >
              <Activity size={16} /> History
            </Link>
            <button
              onClick={openEdit}
              title="Edit pet"
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => onDelete(pet.id)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.15)',
                color: '#ef4444',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <p style={{ margin: '5px 0', color: '#94a3b8' }}><strong>Species:</strong> {pet.species}</p>
        <p style={{ margin: '5px 0', color: '#94a3b8' }}><strong>Breed:</strong> {pet.breed || 'N/A'}</p>
        <p style={{ margin: '5px 0', color: '#94a3b8' }}><strong>Age:</strong> {pet.age} years</p>
      </motion.div>

      <AnimatePresence>
        {showEditModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card"
              style={{ padding: '40px', width: '100%', maxWidth: '450px', position: 'relative' }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '30px' }}>Edit Pet Details</h2>
              <form onSubmit={handleEditPet} noValidate>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="glass-card"
                    style={inputStyle(editErrors.name)}
                    placeholder="e.g. Buddy"
                  />
                  <FieldError msg={editErrors.name} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Species <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editData.species}
                    onChange={(e) => handleEditChange('species', e.target.value)}
                    className="glass-card"
                    style={inputStyle(editErrors.species)}
                    placeholder="e.g. Dog, Cat"
                  />
                  <FieldError msg={editErrors.species} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Breed</label>
                  <input
                    type="text"
                    value={editData.breed}
                    onChange={(e) => handleEditChange('breed', e.target.value)}
                    className="glass-card"
                    style={inputStyle(false)}
                    placeholder="e.g. Golden Retriever"
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Age <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => handleEditChange('age', e.target.value)}
                    className="glass-card"
                    style={inputStyle(editErrors.age)}
                    placeholder="e.g. 3"
                    min="0"
                  />
                  <FieldError msg={editErrors.age} />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px' }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Pets = () => {
  const { user } = useAuth();
  const { toast, confirm } = useModal();
  const [pets, setPets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', species: '', breed: '', age: '' });
  const [addErrors, setAddErrors] = useState({});

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

  const handleAddChange = (field, value) => {
    setNewPet((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) setAddErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    const errors = validatePetForm(newPet);
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/pets', newPet, config);
      fetchPets();
      setShowAddModal(false);
      setNewPet({ name: '', species: '', breed: '', age: '' });
      setAddErrors({});
    } catch (error) {
      toast('Error adding pet', 'error');
    }
  };

  const openAddModal = () => {
    setNewPet({ name: '', species: '', breed: '', age: '' });
    setAddErrors({});
    setShowAddModal(true);
  };

  const deletePet = async (id) => {
    const yes = await confirm('Delete Pet', 'Are you sure you want to remove this pet?', {
      danger: true,
      confirmText: 'Delete',
    });
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
        <button onClick={openAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Register Pet
        </button>
      </div>

      <div className="responsive-grid">
        {pets.length === 0 ? (
          <div
            className="glass-card"
            style={{
              gridColumn: '1 / -1',
              padding: '50px',
              textAlign: 'center',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <PawPrint size={64} opacity={0.2} color="#6366f1" />
            <div>
              <h3 style={{ color: 'white', marginBottom: '10px' }}>No pets registered yet</h3>
              <p style={{ margin: 0 }}>Add your first fuzzy friend to start booking appointments and tracking their health.</p>
            </div>
            <button onClick={openAddModal} className="btn-primary" style={{ padding: '10px 25px' }}>
              Register Your First Pet
            </button>
          </div>
        ) : (
          pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onDelete={deletePet}
              onRefresh={fetchPets}
              user={user}
              toast={toast}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card"
              style={{ padding: '40px', width: '100%', maxWidth: '450px', position: 'relative' }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '30px' }}>Register New Pet</h2>
              <form onSubmit={handleAddPet} noValidate>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newPet.name}
                    onChange={(e) => handleAddChange('name', e.target.value)}
                    className="glass-card"
                    style={inputStyle(addErrors.name)}
                    placeholder="e.g. Buddy"
                  />
                  <FieldError msg={addErrors.name} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Species <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newPet.species}
                    onChange={(e) => handleAddChange('species', e.target.value)}
                    className="glass-card"
                    style={inputStyle(addErrors.species)}
                    placeholder="e.g. Dog, Cat"
                  />
                  <FieldError msg={addErrors.species} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Breed</label>
                  <input
                    type="text"
                    value={newPet.breed}
                    onChange={(e) => handleAddChange('breed', e.target.value)}
                    className="glass-card"
                    style={inputStyle(false)}
                    placeholder="e.g. Golden Retriever"
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    Age <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={newPet.age}
                    onChange={(e) => handleAddChange('age', e.target.value)}
                    className="glass-card"
                    style={inputStyle(addErrors.age)}
                    placeholder="e.g. 3"
                    min="0"
                  />
                  <FieldError msg={addErrors.age} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                  Add Pet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pets;
