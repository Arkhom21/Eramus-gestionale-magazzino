'use client';
import { useState } from 'react';

export default function AddProductModal({ show, onClose, onSave, productTypes }) {
  const initialFormState = {
    nome_oggetto: '',
    descrizione: '',
    quantita_disponibile: 0,
    prezzo_unitario: 0,
    soglia_minima_magazzino: 1,
    product_type_id: productTypes[0]?.id || ''
  };

  const [newProduct, setNewProduct] = useState(initialFormState);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(newProduct);
    setNewProduct({ ...initialFormState, product_type_id: productTypes[0]?.id || '' });
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header text-white position-relative py-3" style={{ backgroundColor: '#0d6efd' }}>
            <h5 className="modal-title w-100 text-center">Nuovo Prodotto</h5>
            <button type="button" className="btn-close btn-close-white position-absolute end-0 me-3" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Nome Oggetto</label>
                <input type="text" className="form-control" required placeholder="es. Astuccio"
                  value={newProduct.nome_oggetto}
                  onChange={e => setNewProduct({ ...newProduct, nome_oggetto: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo Prodotto</label>
                <select className="form-select" required
                  value={newProduct.product_type_id}
                  onChange={e => setNewProduct({ ...newProduct, product_type_id: e.target.value })}>
                  {productTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.nome_tipo}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Descrizione</label>
                <textarea className="form-control" rows="2" placeholder="Opzionale"
                  value={newProduct.descrizione}
                  onChange={e => setNewProduct({ ...newProduct, descrizione: e.target.value })}></textarea>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Quantità Iniziale</label>
                  <input type="number" className="form-control" min="0" required
                    value={newProduct.quantita_disponibile}
                    onChange={e => setNewProduct({ ...newProduct, quantita_disponibile: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Prezzo Unitario (€)</label>
                  <input type="number" step="0.01" className="form-control" min="0" required
                    value={newProduct.prezzo_unitario}
                    onChange={e => setNewProduct({ ...newProduct, prezzo_unitario: e.target.value })} />
                </div>
              </div>
              <div className="mt-3">
                <label className="form-label fw-semibold text-danger">Soglia Minima Allerta</label>
                <input type="number" className="form-control" min="1"
                  value={newProduct.soglia_minima_magazzino}
                  onChange={e => setNewProduct({ ...newProduct, soglia_minima_magazzino: e.target.value })} />
                <small className="text-muted">Verrai avvisato quando la scorta scende sotto questo valore.</small>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-link text-secondary text-decoration-none"
                onClick={onClose}>Annulla</button>
              <button type="submit" className="btn btn-success px-4 fw-bold">Salva Prodotto</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}