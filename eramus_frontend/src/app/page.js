'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import fondamentale per cambiare pagina

export default function Home() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter(); // Inizializziamo il router

  // Validazione password direttive AGID
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(credentials.password)) {
      setError('La password non rispetta i criteri AGID (min 8 caratteri, una maiuscola, un numero e un speciale).');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Salviamo i dati per le prossime chiamate
        localStorage.setItem('token', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log("Login effettuato con successo!");

        // 2. REINDIRIZZAMENTO REALE
        router.push('/dashboard'); 
      } else {
        setError(data.error || 'Credenziali non valide');
      }
    } catch (err) {
      setError('Impossibile connettersi al server.');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center mb-4">Login ERAMUS</h2>
          <p className="text-muted text-center small mb-4">Accesso interfaccia amministrativa</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                id="username"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                required 
              />
            </div>

            <div className="form-group mb-4">
              <input 
                type="password" 
                className="form-control" 
                id="password"
                placeholder="Password"
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