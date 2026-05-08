'use client';
import { useState, useEffect } from 'react';

export default function EditUserModal({ show, onClose, onSave, roles, user, currentUser }) {
  const [editUser, setEditUser] = useState({
    nome: '',
    cognome: '',
    data_nascita: '',
    role_id: ''
  });

  useEffect(() => {
    if (user) {
      setEditUser({
        nome:         user.nome,
        cognome:      user.cognome,
        data_nascita: user.data_nascita || '',
        role_id:      user.role_id
      });
    }
  }, [user]);

  if (!show || !user) return null;

  const isSelf = user.id === currentUser?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(editUser);
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header text-white position-relative py-3" style={{ backgroundColor: '#0d6efd' }}>
            <h5 className="modal-title w-100 text-center">Modifica Utente — @{user.username}</h5>
            <button type="button" className="btn-close btn-close-white position-absolute end-0 me-3" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nome</label>
                  <input type="text" className="form-control" required
                    value={editUser.nome}
                    onChange={e => setEditUser({ ...editUser, nome: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Cognome</label>
                  <input type="text" className="form-control" required
                    value={editUser.cognome}
                    onChange={e => setEditUser({ ...editUser, cognome: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Data di Nascita</label>
                  <input type="date" className="form-control"
                    value={editUser.data_nascita}
                    onChange={e => setEditUser({ ...editUser, data_nascita: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Ruolo</label>
                  <select className="form-select"
                    value={editUser.role_id}
                    disabled={isSelf}
                    onChange={e => setEditUser({ ...editUser, role_id: e.target.value })}>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.nome_ruolo}</option>
                    ))}
                  </select>
                  {isSelf && (
                    <small className="text-muted">Non puoi modificare il tuo stesso ruolo.</small>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-link text-secondary text-decoration-none"
                onClick={onClose}>Annulla</button>
              <button type="submit" className="btn btn-primary px-4 fw-bold">Salva Modifiche</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}