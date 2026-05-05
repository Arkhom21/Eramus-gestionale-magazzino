'use client';
import { useState } from 'react';

export default function Home() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // Validazione password direttive AGID
  // Minimo 8 caratteri, almeno 1 maiuscola, 1 numero, 1 carattere speciale
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verifica conformità password secondo requisiti tecnici
    if (!validatePassword(credentials.password)) {
      setError('La password deve avere almeno 8 caratteri, una maiuscola, un numero e un carattere speciale.');
      return;
    }

    console.log("Tentativo di login per:", credentials.username);
    // Qui integreremo la chiamata al backend Rails per il JWT
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Login ERAMUS</h2>
          <p className="text-muted text-center small mb-4">Accesso interfaccia amministrativa</p>
          
          <form onSubmit={handleSubmit}>
            {/* Campo Username */}
            <div className="form-group mb-3">
              <label className="active" htmlFor="username">Username</label>
              <input 
                type="text" 
                className="form-control" 
                id="username" 
                placeholder="Inserisci username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required 
              />
            </div>

            {/* Campo Password */}
            <div className="form-group mb-4">
              <label className="active" htmlFor="password">Password</label>
              <input 
                type="password" 
                className="form-control" 
                id="password" 
                placeholder="********"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required 
              />
            </div>

            {error && (
              <div className="alert alert-danger small mb-3" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100 py-2">
              Accedi
            </button>
            
            <div className="text-center mt-3">
              <a href="#" className="small text-decoration-none">Recupera Password</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}