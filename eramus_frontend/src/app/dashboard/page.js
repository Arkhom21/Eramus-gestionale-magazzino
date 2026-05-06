'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Stato iniziale pulito con tutti i campi richiesti dal backend
  const initialFormState = {
    nome_oggetto: '',
    descrizione: '',
    quantita_disponibile: 0,
    prezzo_unitario: 0,
    soglia_minima_magazzino: 1, // Obbligatorio per il modello Rails
    product_type_id: 1          // Assicurati che esista nel DB (creato col seed)
  };

  const [newProduct, setNewProduct] = useState(initialFormState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token) { 
      router.push('/'); 
    } else {
      setUser(JSON.parse(savedUser));
      fetchProducts(token);
    }
  }, [router]);

  const fetchProducts = async (token) => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProducts(await res.json());
    } catch (error) {
      console.error("Errore nel caricamento prodotti:", error);
    }
  };

const handleSave = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  
  // Recuperiamo l'ID dell'utente loggato dallo stato o dal localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const productData = {
    nome_oggetto: newProduct.nome_oggetto,
    descrizione: newProduct.descrizione,
    quantita_disponibile: parseInt(newProduct.quantita_disponibile) || 0,
    prezzo_unitario: parseFloat(newProduct.prezzo_unitario) || 0,
    soglia_minima_magazzino: parseInt(newProduct.soglia_minima_magazzino) || 1,
    
    // FISSA I DUE ERRORI:
    product_type_id: 1,           // Forza l'ID del tipo creato col seed
    user_id: currentUser?.id      // Passa l'ID dell'utente che sta salvando
  };

  console.log("Dati inviati:", productData); // Debug utile per te

  const res = await fetch('http://localhost:3000/api/v1/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product: productData })
  });

  if (res.ok) {
    setShowModal(false);
    fetchProducts(token);
    setNewProduct(initialFormState);
    alert("Prodotto salvato con successo!");
  } else {
    const errorData = await res.json();
    alert("Errore validazione: " + errorData.errors.join(", "));
  }
};

  if (!user) return <div className="p-5 text-center">Caricamento in corso...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Pannello Inventario ERAMUS</h2>
          <p className="text-muted">Benvenuto, {user.nome} {user.cognome}</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg"></i> + Aggiungi Prodotto
        </button>
      </div>

      {/* TABELLA PRODOTTI */}
      <div className="card shadow border-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light text-secondary">
              <tr>
                <th className="ps-4">Nome</th>
                <th>Quantità</th>
                <th>Prezzo</th>
                <th className="text-end pe-4">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <div className="fw-bold">{p.nome_oggetto}</div>
                      <div className="small text-muted">{p.descrizione || 'Nessuna descrizione'}</div>
                    </td>
                    <td>
                      <span className={`badge ${p.quantita_disponibile <= p.soglia_minima_magazzino ? 'bg-danger' : 'bg-success'}`}>
                        {p.quantita_disponibile}
                      </span>
                    </td>
                    <td>€ {parseFloat(p.prezzo_unitario).toFixed(2)}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-danger border-0">
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">Nessun prodotto in inventario</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AGGIUNGI PRODOTTO */}
      {showModal && (
        <div className="modal d-block shadow" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Nuovo Prodotto</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome Oggetto</label>
                    <input type="text" className="form-control" required placeholder="es. Astuccio"
                      value={newProduct.nome_oggetto}
                      onChange={e => setNewProduct({...newProduct, nome_oggetto: e.target.value})} />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descrizione</label>
                    <textarea className="form-control" rows="2" placeholder="Opzionale"
                      value={newProduct.descrizione}
                      onChange={e => setNewProduct({...newProduct, descrizione: e.target.value})}></textarea>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Quantità Iniziale</label>
                      <input type="number" className="form-control" min="0" required
                        value={newProduct.quantita_disponibile}
                        onChange={e => setNewProduct({...newProduct, quantita_disponibile: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Prezzo Unitario (€)</label>
                      <input type="number" step="0.01" className="form-control" min="0" required
                        value={newProduct.prezzo_unitario}
                        onChange={e => setNewProduct({...newProduct, prezzo_unitario: e.target.value})} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label fw-semibold text-danger">Soglia Minima Allerta</label>
                    <input type="number" className="form-control" min="1"
                      value={newProduct.soglia_minima_magazzino}
                      onChange={e => setNewProduct({...newProduct, soglia_minima_magazzino: e.target.value})} />
                    <small className="text-muted">Verrai avvisato quando la scorta scende sotto questo valore.</small>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowModal(false)}>Annulla</button>
                  <button type="submit" className="btn btn-success px-4 fw-bold">Salva Prodotto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}