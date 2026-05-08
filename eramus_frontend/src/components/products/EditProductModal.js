'use client';
import { useState, useEffect } from 'react';

export default function EditProductModal({ show, onClose, onSave, productTypes, product }) {
  const [editProduct, setEditProduct] = useState({
    nome_oggetto: '',
    descrizione: '',
    quantita_disponibile: 0,
    prezzo_unitario: 0,
    soglia_minima_magazzino: 1,
    product_type_id: ''
  });

  useEffect(() => {
    if (product) {
      setEditProduct({
        nome_oggetto:            product.nome_oggetto,
        descrizione:             product.descrizione || '',
        quantita_disponibile:    product.quantita_disponibile,
        prezzo_unitario:         product.prezzo_unitario,
        soglia_minima_magazzino: product.soglia_minima_magazzino,
        product_type_id:         product.product_type_id
      });
    }
  }, [product]);

  if (!show || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(editProduct);
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">Modifica Prodotto</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Nome Oggetto</label>
                <input type="text" className="form-control" required
                  value={editProduct.nome_oggetto}
                  onChange={e => setEditProduct({ ...editProduct, nome_oggetto: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo Prodotto</label>
                <select className="form-select" required
                  value={editProduct.product_type_id}
                  onChange={e => setEditProduct({ ...editProduct, product_type_id: e.target.value })}>
                  {productTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.nome_tipo}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Descrizione</label>
                <textarea className="form-control" rows="2"
                  value={editProduct.descrizione}
                  onChange={e => setEditProduct({ ...editProduct, descrizione: e.target.value })}></textarea>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Quantità</label>
                  <input type="number" className="form-control" min="0" required
                    value={editProduct.quantita_disponibile}
                    onChange={e => setEditProduct({ ...editProduct, quantita_disponibile: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Prezzo Unitario (€)</label>
                  <input type="number" step="0.01" className="form-control" min="0" required
                    value={editProduct.prezzo_unitario}
                    onChange={e => setEditProduct({ ...editProduct, prezzo_unitario: e.target.value })} />
                </div>
              </div>
              <div className="mt-3">
                <label className="form-label fw-semibold text-danger">Soglia Minima Allerta</label>
                <input type="number" className="form-control" min="1"
                  value={editProduct.soglia_minima_magazzino}
                  onChange={e => setEditProduct({ ...editProduct, soglia_minima_magazzino: e.target.value })} />
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