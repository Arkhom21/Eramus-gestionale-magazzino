'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [categoriesChart, setCategoriesChart] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('inventario');

  // Gestione Utenti
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userMeta, setUserMeta] = useState(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const initialUserForm = {
    username: '',
    email: '',
    password: '',
    nome: '',
    cognome: '',
    data_nascita: '',
    role_id: ''
  };
  const [newUser, setNewUser] = useState(initialUserForm);
  const [editUser, setEditUser] = useState(initialUserForm);

  const initialFormState = {
    nome_oggetto: '',
    descrizione: '',
    quantita_disponibile: 0,
    prezzo_unitario: 0,
    soglia_minima_magazzino: 1,
    product_type_id: ''
  };
  const [newProduct, setNewProduct] = useState(initialFormState);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(initialFormState);

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) { router.push('/'); return null; }
    const res = await fetch('http://localhost:3000/api/v1/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${refresh}` }
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      return data.access_token;
    } else {
      router.push('/');
      return null;
    }
  };

  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    let res = await fetch(url, {
      ...options,
      headers: { 'Authorization': `Bearer ${token}`, ...options.headers }
    });
    if (res.status === 401) {
      const newToken = await refreshToken();
      if (!newToken) return null;
      res = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${newToken}`, ...options.headers }
      });
    }
    return res;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token) {
      router.push('/');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const admin = parsedUser?.role?.nome_ruolo === 'Admin';
      setIsAdmin(admin);
      fetchProducts();
      fetchProductTypes();
      fetchDashboard();
      if (admin) fetchRoles();
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === 'utenti' && isAdmin) fetchUsers();
  }, [activeTab, userPage, userSearch]);

  const fetchDashboard = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/api/v1/dashboard');
      if (res?.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentMovements(data.recent_movements);
        setCategoriesChart(data.categories_chart);
      }
    } catch (error) { console.error("Errore dashboard:", error); }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/api/v1/products');
      if (res?.ok) setProducts(await res.json());
    } catch (error) { console.error("Errore prodotti:", error); }
  };

  const fetchProductTypes = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/api/v1/product_types');
      if (res?.ok) {
        const types = await res.json();
        setProductTypes(types);
        if (types.length > 0)
          setNewProduct(prev => ({ ...prev, product_type_id: types[0].id }));
      }
    } catch (error) { console.error("Errore tipi prodotto:", error); }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/api/v1/roles');
      if (res?.ok) {
        const data = await res.json();
        setRoles(data);
        setNewUser(prev => ({ ...prev, role_id: data[0]?.id || '' }));
      }
    } catch (error) { console.error("Errore ruoli:", error); }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page: userPage, q: userSearch });
      const res = await apiFetch(`http://localhost:3000/api/v1/users?${params}`);
      if (res?.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserMeta({ total: data.total, total_pages: data.total_pages, page: data.page });
      }
    } catch (error) { console.error("Errore utenti:", error); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await apiFetch('http://localhost:3000/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: newUser })
    });
    if (res?.ok) {
      setShowNewUserModal(false);
      setNewUser({ ...initialUserForm, role_id: roles[0]?.id || '' });
      fetchUsers();
      fetchDashboard();
      alert('Utente creato con successo! Email di benvenuto inviata.');
    } else {
      const data = await res.json();
      alert('Errore: ' + data.errors.join(', '));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const res = await apiFetch(`http://localhost:3000/api/v1/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          nome: editUser.nome,
          cognome: editUser.cognome,
          data_nascita: editUser.data_nascita,
          role_id: editUser.role_id
        }
      })
    });
    if (res?.ok) {
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchUsers();
    } else {
      const data = await res.json();
      alert('Errore: ' + data.errors.join(', '));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Disattivare questo utente?')) return;
    const res = await apiFetch(`http://localhost:3000/api/v1/users/${id}`, { method: 'DELETE' });
    if (res?.ok) { fetchUsers(); fetchDashboard(); }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditUser({
      username: u.username,
      email: u.email,
      password: '',
      nome: u.nome,
      cognome: u.cognome,
      data_nascita: u.data_nascita || '',
      role_id: u.role_id
    });
    setShowEditUserModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    const res = await apiFetch(`http://localhost:3000/api/v1/products/${id}`, { method: 'DELETE' });
    if (res?.ok) { fetchProducts(); fetchDashboard(); }
  };

  const openEditProductModal = (p) => {
    setEditingProduct(p);
    setEditProduct({
      nome_oggetto: p.nome_oggetto,
      descrizione: p.descrizione || '',
      quantita_disponibile: p.quantita_disponibile,
      prezzo_unitario: p.prezzo_unitario,
      soglia_minima_magazzino: p.soglia_minima_magazzino,
      product_type_id: p.product_type_id
    });
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const res = await apiFetch(`http://localhost:3000/api/v1/products/${editingProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: {
          nome_oggetto: editProduct.nome_oggetto,
          descrizione: editProduct.descrizione,
          quantita_disponibile: parseInt(editProduct.quantita_disponibile) || 0,
          prezzo_unitario: parseFloat(editProduct.prezzo_unitario) || 0,
          soglia_minima_magazzino: parseInt(editProduct.soglia_minima_magazzino) || 1,
          product_type_id: editProduct.product_type_id
        }
      })
    });
    if (res?.ok) {
      setShowEditProductModal(false);
      setEditingProduct(null);
      fetchProducts();
      fetchDashboard();
    } else {
      const data = await res.json();
      alert('Errore: ' + data.errors.join(', '));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const productData = {
      nome_oggetto: newProduct.nome_oggetto,
      descrizione: newProduct.descrizione,
      quantita_disponibile: parseInt(newProduct.quantita_disponibile) || 0,
      prezzo_unitario: parseFloat(newProduct.prezzo_unitario) || 0,
      soglia_minima_magazzino: parseInt(newProduct.soglia_minima_magazzino) || 1,
      product_type_id: newProduct.product_type_id,
      user_id: currentUser?.id
    };
    const res = await apiFetch('http://localhost:3000/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: productData })
    });
    if (res?.ok) {
      setShowModal(false);
      fetchProducts();
      fetchDashboard();
      setNewProduct({ ...initialFormState, product_type_id: productTypes[0]?.id || '' });
    } else {
      const errorData = await res.json();
      alert('Errore: ' + errorData.errors.join(', '));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <div className="p-5 text-center">Caricamento in corso...</div>;

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Pannello ERAMUS</h2>
          <p className="text-muted small mb-0">
            Benvenuto, {user.nome} {user.cognome}
            <span className={`badge ms-2 ${isAdmin ? 'bg-danger' : 'bg-primary'}`}>
              {user.role?.nome_ruolo}
            </span>
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
      </div>

      {/* STATS */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Utenti Totali</div>
                <div className="fs-3 fw-bold text-primary">{stats.total_users}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Prodotti in Inventario</div>
                <div className="fs-3 fw-bold text-success">{stats.total_products}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Valore Totale Inventario</div>
                <div className="fs-3 fw-bold text-warning">
                  € {parseFloat(stats.total_inventory_value || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'inventario' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventario')}>Inventario</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'movimenti' ? 'active' : ''}`}
            onClick={() => setActiveTab('movimenti')}>Ultimi Movimenti</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'categorie' ? 'active' : ''}`}
            onClick={() => setActiveTab('categorie')}>Categorie</button>
        </li>
        {isAdmin && (
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'utenti' ? 'active' : ''}`}
              onClick={() => setActiveTab('utenti')}>Gestione Utenti</button>
          </li>
        )}
      </ul>

      {/* TAB: INVENTARIO */}
      {activeTab === 'inventario' && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Aggiungi Prodotto
            </button>
          </div>
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
                      <td className="text-end pe-4 d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-primary border-0"
                          onClick={() => openEditProductModal(p)}>Modifica</button>
                        <button className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => handleDelete(p.id)}>Elimina</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">Nessun prodotto in inventario</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB: MOVIMENTI */}
      {activeTab === 'movimenti' && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light text-secondary">
                <tr>
                  <th className="ps-4">Prodotto</th>
                  <th>Tipo</th>
                  <th>Quantità</th>
                  <th>Utente</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.length > 0 ? recentMovements.map(m => (
                  <tr key={m.id}>
                    <td className="ps-4 fw-bold">{m.prodotto}</td>
                    <td>
                      <span className={`badge ${m.tipo === 'Carico' ? 'bg-success' : 'bg-danger'}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td>{m.quantita}</td>
                    <td>{m.utente}</td>
                    <td className="text-muted small">{m.data}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">Nessun movimento registrato</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CATEGORIE */}
      {activeTab === 'categorie' && (
        <div className="card shadow-sm border-0 p-4">
          <h6 className="fw-bold mb-3">Prodotti per Categoria</h6>
          {Object.keys(categoriesChart).length > 0 ? (
            Object.entries(categoriesChart).map(([categoria, count]) => (
              <div key={categoria} className="mb-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold">{categoria}</span>
                  <span className="text-muted">{count} prodotti</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div className="progress-bar bg-primary"
                    style={{ width: `${(count / stats?.total_products) * 100}%` }}></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Nessun dato disponibile</p>
          )}
        </div>
      )}

      {/* TAB: GESTIONE UTENTI */}
      {activeTab === 'utenti' && isAdmin && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Cerca per username o email..."
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
            />
            <button className="btn btn-primary btn-sm"
              onClick={() => setShowNewUserModal(true)}>
              + Nuovo Utente
            </button>
          </div>
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light text-secondary">
                  <tr>
                    <th className="ps-4">Utente</th>
                    <th>Email</th>
                    <th>Ruolo</th>
                    <th>Stato</th>
                    <th className="text-end pe-4">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map(u => (
                    <tr key={u.id}>
                      <td className="ps-4">
                        <div className="fw-bold">{u.nome} {u.cognome}</div>
                        <div className="small text-muted">@{u.username}</div>
                      </td>
                      <td className="small">{u.email}</td>
                      <td>
                        <span className={`badge ${u.role?.nome_ruolo === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                          {u.role?.nome_ruolo}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.stato_account === 'Attivo' ? 'bg-success' : 'bg-secondary'}`}>
                          {u.stato_account}
                        </span>
                      </td>
                      <td className="text-end pe-4 d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-primary border-0"
                          onClick={() => openEditModal(u)}>
                          Modifica
                        </button>
                        <button className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}>
                          Disattiva
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">Nessun utente trovato</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINAZIONE */}
          {userMeta && userMeta.total_pages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button className="btn btn-sm btn-outline-secondary"
                disabled={userPage === 1}
                onClick={() => setUserPage(p => p - 1)}>← Precedente</button>
              <span className="btn btn-sm disabled">{userMeta.page} / {userMeta.total_pages}</span>
              <button className="btn btn-sm btn-outline-secondary"
                disabled={userPage === userMeta.total_pages}
                onClick={() => setUserPage(p => p + 1)}>Successivo →</button>
            </div>
          )}
        </>
      )}

      {/* MODAL NUOVO UTENTE */}
      {showNewUserModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Nuovo Utente</h5>
                <button type="button" className="btn-close btn-close-white"
                  onClick={() => setShowNewUserModal(false)}></button>
              </div>
              <form onSubmit={handleCreateUser}>
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
                    onClick={() => setShowNewUserModal(false)}>Annulla</button>
                  <button type="submit" className="btn btn-success px-4 fw-bold">Crea Utente</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFICA UTENTE */}
      {showEditUserModal && editingUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Modifica Utente — @{editingUser.username}</h5>
                <button type="button" className="btn-close btn-close-white"
                  onClick={() => setShowEditUserModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateUser}>
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
                    <div className="col-12">
                      <label className="form-label fw-semibold">Ruolo</label>
                      <select className="form-select"
                        value={editUser.role_id}
                        disabled={editingUser?.id === user.id}
                        onChange={e => setEditUser({ ...editUser, role_id: e.target.value })}>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.nome_ruolo}</option>
                        ))}
                      </select>
                      {editingUser?.id === user.id && (
                        <small className="text-muted">Non puoi modificare il tuo stesso ruolo.</small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-link text-secondary text-decoration-none"
                    onClick={() => setShowEditUserModal(false)}>Annulla</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Salva Modifiche</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGGIUNGI PRODOTTO */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Nuovo Prodotto</h5>
                <button type="button" className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
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
                    onClick={() => setShowModal(false)}>Annulla</button>
                  <button type="submit" className="btn btn-success px-4 fw-bold">Salva Prodotto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* MODAL MODIFICA PRODOTTO */}
      {showEditProductModal && editingProduct && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Modifica Prodotto</h5>
                <button type="button" className="btn-close btn-close-white"
                  onClick={() => setShowEditProductModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateProduct}>
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
                    onClick={() => setShowEditProductModal(false)}>Annulla</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Salva Modifiche</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}