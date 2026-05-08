'use client';

export default function UserTable({ users, currentUser, onEdit, onDelete, onReactivate, userMeta, userPage, setUserPage }) {
  return (
    <>
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
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-sm btn-outline-primary border-0"
                        onClick={() => onEdit(u)}>Modifica</button>
                      {u.stato_account === 'Attivo' ? (
                        <button className="btn btn-sm btn-outline-danger border-0"
                          onClick={() => onDelete(u.id)}
                          disabled={u.id === currentUser?.id}>Disattiva</button>
                      ) : (
                        <button className="btn btn-sm btn-outline-success border-0"
                          onClick={() => onReactivate(u.id)}>Riattiva</button>
                      )}
                    </div>
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
  );
}