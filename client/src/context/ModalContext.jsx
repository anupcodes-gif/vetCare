import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);


const Toast = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} color="#22c55e" />,
    error: <XCircle size={20} color="#ef4444" />,
    warning: <AlertCircle size={20} color="#f59e0b" />,
    info: <Info size={20} color="#6366f1" />,
  };
  const colors = {
    success: 'rgba(34,197,94,0.15)',
    error: 'rgba(239,68,68,0.15)',
    warning: 'rgba(245,158,11,0.15)',
    info: 'rgba(99,102,241,0.15)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      style={{
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: `4px solid ${colors[toast.type]?.replace('0.15', '1') || '#6366f1'}`,
        borderRadius: '12px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ background: colors[toast.type], padding: '8px', borderRadius: '8px', display: 'flex' }}>
        {icons[toast.type]}
      </div>
      <p style={{ margin: 0, flex: 1, fontSize: '0.9rem', color: '#e2e8f0' }}>{toast.message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
        <X size={16} />
      </button>
    </motion.div>
  );
};


const ConfirmDialog = ({ dialog, onClose }) => {
  const [inputValue, setInputValue] = useState(dialog.defaultValue || '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onClose(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          padding: '30px', width: '100%', maxWidth: '440px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <h3 style={{ margin: '0 0 8px', color: '#f1f5f9' }}>{dialog.title}</h3>
        <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: '0.95rem', lineHeight: '1.5' }}>{dialog.message}</p>

        {dialog.type === 'prompt' && (
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            rows={4}
            autoFocus
            placeholder={dialog.placeholder || 'Enter text...'}
            style={{
              width: '100%', padding: '12px', marginBottom: '20px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px', color: 'white', fontSize: '0.9rem', resize: 'vertical',
              outline: 'none',
            }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => onClose(false)}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >Cancel</button>
          <button
            onClick={() => onClose(dialog.type === 'prompt' ? inputValue : true)}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: dialog.danger ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
            }}
          >{dialog.confirmText || 'Confirm'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
};


export const ModalProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [dialogResolve, setDialogResolve] = useState(null);

  
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  
  const confirm = useCallback((title, message, options = {}) => {
    return new Promise(resolve => {
      setDialog({ type: 'confirm', title, message, ...options });
      setDialogResolve(() => resolve);
    });
  }, []);

  
  const prompt = useCallback((title, message, options = {}) => {
    return new Promise(resolve => {
      setDialog({ type: 'prompt', title, message, ...options });
      setDialogResolve(() => resolve);
    });
  }, []);

  const handleDialogClose = (result) => {
    if (dialogResolve) dialogResolve(result);
    setDialog(null);
    setDialogResolve(null);
  };

  return (
    <ModalContext.Provider value={{ toast, confirm, prompt }}>
      {children}

      
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 11000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <Toast key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
          ))}
        </AnimatePresence>
      </div>

      
      <AnimatePresence>
        {dialog && <ConfirmDialog dialog={dialog} onClose={handleDialogClose} />}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};
