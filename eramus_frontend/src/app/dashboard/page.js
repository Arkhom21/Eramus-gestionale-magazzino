'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddProductModal from '@/components/products/AddProductModal';
import EditProductModal from '@/components/products/EditProductModal';
import ProductTable from '@/components/products/ProductTable';
import AddUserModal from '@/components/users/AddUserModal';
import EditUserModal from '@/components/users/EditUserModal';
import UserTable from '@/components/users/UserTable';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [categoriesChart, setCategoriesChart] = useState({});
  const [activeTab, setActiveTab] = useState('inventario');

  // Prodotti modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Utenti
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userMeta, setUserMeta] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // ── API helper ────────────────────────────────────────────────────────────────
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

  // ── Fetch ─────────────────────────────────────────────────────────────────────
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
    const res = await apiFetch('http://localhost:3000/api/v1/dashboard');
    if (res?.ok) {
      const data = await res.json();
      setStats(data.stats);
      setRecentMovements(data.recent_movements);
      setCategoriesChart(data.categories_chart);
    }
  };

  const fetchProducts = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.type_id) params.append('type_id', filters.type_id);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.direction) params.append('direction', filters.direction);
    const url = `http://localhost:3000/api/v1/products${params.toString() ? '?' + params.toString() : ''}`;
    const res = await apiFetch(url);
    if (res?.ok) setProducts(await res.json());
  };

  const fetchProductTypes = async () => {
    const res = await apiFetch('http://localhost:3000/api/v1/product_types');
    if (res?.ok) setProductTypes(await res.json());
  };

  const fetchRoles = async () => {
    const res = await apiFetch('http://localhost:3000/api/v1/roles');
    if (res?.ok) setRoles(await res.json());
  };

  const fetchUsers = async () => {
    const params = new URLSearchParams({ page: userPage, q: userSearch });
    const res = await apiFetch(`http://localhost:3000/api/v1/users?${params}`);
    if (res?.ok) {
      const data = await res.json();
      setUsers(data.users);
      setUserMeta({ total: data.total, total_pages: data.total_pages, page: data.page });
    }
  };

  // ── Prodotti handlers ─────────────────────────────────────────────────────────
  const handleSaveProduct = async (productData) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const res = await apiFetch('http://localhost:3000/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: {
        ...productData,
        quantita_disponibile:    parseInt(productData.quantita_disponibile) || 0,
        prezzo_unitario:         parseFloat(productData.prezzo_unitario) || 0,
        soglia_minima_magazzino: parseInt(productData.soglia_minima_magazzino) || 1,
        user_id:                 currentUser?.id
      }})
    });
    if (res?.ok) {
      setShowAddProduct(false);
      fetchProducts();
      fetchDashboard();
    } else {
      const data = await res.json();
      alert('Errore: ' + (data.errors?.join(', ') || data.error));
    }
  };

  const handleUpdateProduct = async (productData) => {
    const res = await apiFetch(`http://localhost:3000/api/v1/products/${editingProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: {
        ...productData,
        quantita_disponibile:    parseInt(productData.quantita_disponibile) || 0,
        prezzo_unitario:         parseFloat(productData.prezzo_unitario) || 0,
        soglia_minima_magazzino: parseInt(productData.soglia_minima_magazzino) || 1,
      }})
    });
    if (res?.ok) {
      setShowEditProduct(false);
      setEditingProduct(null);
      fetchProducts();
      fetchDashboard();
    } else {
      const data = await res.json();
      alert('Errore: ' + (data.errors?.join(', ') || data.error || 'Errore sconosciuto'));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    const res = await apiFetch(`http://localhost:3000/api/v1/products/${id}`, { method: 'DELETE' });
    if (res?.ok) { fetchProducts(); fetchDashboard(); }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditProduct(true);
  };

  // ── Utenti handlers ───────────────────────────────────────────────────────────
  const handleCreateUser = async (userData) => {
    const res = await apiFetch('http://localhost:3000/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userData })
    });
    if (res?.ok) {
      setShowAddUser(false);
      fetchUsers();
      fetchDashboard();
      alert('Utente creato con successo! Email di benvenuto inviata.');
    } else {
      const data = await res.json();
      alert('Errore: ' + (data.errors?.join(', ') || data.error));
    }
  };

  const handleUpdateUser = async (userData) => {
    const res = await apiFetch(`http://localhost:3000/api/v1/users/${editingUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userData })
    });
    if (res?.ok) {
      setShowEditUser(false);
      setEditingUser(null);
      fetchUsers();
    } else {
      const data = await res.json();
      alert('Errore: ' + (data.errors?.join(', ') || data.error));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Disattivare questo utente?')) return;
    const res = await apiFetch(`http://localhost:3000/api/v1/users/${id}`, { method: 'DELETE' });
    if (res?.ok) { fetchUsers(); fetchDashboard(); }
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setShowEditUser(true);
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
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddProduct(true)}>
              + Aggiungi Prodotto
            </button>
          </div>
          <ProductTable
            products={products}
            productTypes={productTypes}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onFilter={fetchProducts}
          />
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
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(true)}>
              + Nuovo Utente
            </button>
          </div>
          <UserTable
            users={users}
            currentUser={user}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            userMeta={userMeta}
            userPage={userPage}
            setUserPage={setUserPage}
          />
        </>
      )}

      {/* MODALI PRODOTTI */}
      <AddProductModal
        show={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onSave={handleSaveProduct}
        productTypes={productTypes}
      />
      <EditProductModal
        show={showEditProduct}
        onClose={() => { setShowEditProduct(false); setEditingProduct(null); }}
        onSave={handleUpdateProduct}
        productTypes={productTypes}
        product={editingProduct}
      />

      {/* MODALI UTENTI */}
      <AddUserModal
        show={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSave={handleCreateUser}
        roles={roles}
      />
      <EditUserModal
        show={showEditUser}
        onClose={() => { setShowEditUser(false); setEditingUser(null); }}
        onSave={handleUpdateUser}
        roles={roles}
        user={editingUser}
        currentUser={user}
      />
    </div>
  );
}