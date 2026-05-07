'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecuperaPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:3000/api/v1/password_reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Errore durante la richiesta.');
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
          <h2 className="text-center mb-2">Recupera Password</h2>
          <p className="text-muted text-center small mb-4">
            Inserisci la tua email per ricevere il link di reset.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
              {loading ? 'Invio in corso...' : 'Invia istruzioni'}
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