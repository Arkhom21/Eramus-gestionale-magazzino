'use client';
import { useState } from 'react';

export default function ProductTable({ products, productTypes, onEdit, onDelete, onFilter }) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  const handleFilter = () => {
    onFilter({ q: search, type_id: selectedType, sort: sortField, direction: sortDir });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedType('');
    setSortField('');
    setSortDir('asc');
    onFilter({});
  };

  return (
    <>
      {/* BARRA FILTRI */}
      <div className="card shadow-sm border-0 p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label small fw-semibold mb-1">Cerca per nome</label>
            <input type="text" className="form-control form-control-sm"
              placeholder="es. Toner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFilter()}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold mb-1">Tipo prodotto</label>
            <select className="form-select form-select-sm"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}>
              <option value="">Tutti i tipi</option>
              {productTypes.map(t => (
                <option key={t.id} value={t.id}>{t.nome_tipo}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold mb-1">Ordina per</label>
            <select className="form-select form-select-sm"
              value={sortField}
              onChange={e => setSortField(e.target.value)}>
              <option value="">—</option>
              <option value="prezzo_unitario">Prezzo</option>
              <option value="quantita_disponibile">Quantità</option>
            </select>
          </div>
          <div className="col-md-1">
            <label className="form-label small fw-semibold mb-1">Dir.</label>
            <select className="form-select form-select-sm"
              value={sortDir}
              onChange={e => setSortDir(e.target.value)}>
              <option value="asc">↑</option>
              <option value="desc">↓</option>
            </select>
          </div>
          <div className="col-md-2 d-flex gap-2">
            <button className="btn btn-primary btn-sm w-100" onClick={handleFilter}>Filtra</button>
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </div>

      {/* TABELLA */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light text-secondary">
              <tr>
                <th className="ps-4">Nome</th>
                <th>Tipo</th>
                <th>Quantità</th>
                <th>Prezzo</th>
                <th className="text-end pe-4">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? products.map(p => (
                <tr key={p.id}>
                  <td className="ps-4">
                    <div className="fw-bold">{p.nome_oggetto}</div>
                    <div className="small text-muted">{p.descrizione || 'Nessuna descrizione'}</div>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {productTypes.find(t => t.id === p.product_type_id)?.nome_tipo || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.quantita_disponibile <= p.soglia_minima_magazzino ? 'bg-danger' : 'bg-success'}`}>
                      {p.quantita_disponibile}
                    </span>
                  </td>
                  <td>€ {parseFloat(p.prezzo_unitario).toFixed(2)}</td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-sm btn-outline-primary border-0"
                        onClick={() => onEdit(p)}>Modifica</button>
                      <button className="btn btn-sm btn-outline-danger border-0"
                        onClick={() => onDelete(p.id)}>Elimina</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">Nessun prodotto trovato</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}