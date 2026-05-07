'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [conferma, setConferma] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validatePassword(password)) {
      setError('La password deve avere min 8 caratteri, una maiuscola, un numero e un carattere speciale.');
      return;
    }

    if (password !== conferma) {
      setError('Le password non coincidono.');
      return;
    }

    if (!token) {
      setError('Token mancante. Usa il link ricevuto via email.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/password_reset', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password aggiornata con successo! Verrai reindirizzato al login.');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(data.error || 'Token non valido o scaduto.');
      }
    } catch (err) {
      setError('Impossibile connettersi al server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body">
          <h2 className="text-center mb-2">Nuova Password</h2>
          <p className="text-muted text-center small mb-4">
            Scegli una nuova password per il tuo account.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Campo token manuale — utile in sviluppo senza email reale */}
            <div className="mb-3">
              <label className="form-label small text-muted">Token di reset</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Incolla il token ricevuto"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Nuova password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                className="form-control"
                placeholder="Conferma password"
                value={conferma}
                onChange={e => setConferma(e.target.value)}
                required
              />
            </div>

            {message && (
              <div className="alert alert-success small mb-3">
                {message}
              </div>
            )}

            {error && (
              <div className="alert alert-danger small mb-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : 'Aggiorna Password'}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link small text-decoration-none"
                onClick={() => router.push('/')}
              >
                ← Torna al login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Caricamento...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}