'use client';
import { useState } from 'react';

export default function AddUserModal({ show, onClose, onSave, roles }) {
  const initialFormState = {
    username: '',
    email: '',
    password: '',
    nome: '',
    cognome: '',
    data_nascita: '',
    role_id: roles[0]?.id || ''
  };

  const [newUser, setNewUser] = useState(initialFormState);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(newUser);
    setNewUser({ ...initialFormState, role_id: roles[0]?.id || '' });
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header text-white position-relative py-3" style={{ backgroundColor: '#0d6efd' }}>
            <h5 className="modal-title w-100 text-center">Nuovo Utente</h5>
            <button type="button" className="btn-close btn-close-white position-absolute end-0 me-3" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nome</label>
                  <input type="text" className="form-control" required
                    value={newUser.nome}
                    onChange={e => setNewUser({ ...newUser, nome: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Cognome</label>
                  <input type="text" className="form-control" required
                    value={newUser.cognome}
                    onChange={e => setNewUser({ ...newUser, cognome: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Username</label>
                  <input type="text" className="form-control" required
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" required
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Password</label>
                  <input type="password" className="form-control" required
                    placeholder="Min 8 car., 1 maiusc., 1 numero, 1 speciale"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Data di Nascita</label>
                  <input type="date" className="form-control"
                    value={newUser.data_nascita}
                    onChange={e => setNewUser({ ...newUser, data_nascita: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Ruolo</label>
                  <select className="form-select" required
                    value={newUser.role_id}
                    onChange={e => setNewUser({ ...newUser, role_id: e.target.value })}>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.nome_ruolo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-link text-secondary text-decoration-none"
                onClick={onClose}>Annulla</button>
              <button type="submit" className="btn btn-success px-4 fw-bold">Crea Utente</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}