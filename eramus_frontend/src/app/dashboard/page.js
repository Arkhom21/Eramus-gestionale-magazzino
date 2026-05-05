'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verifichiamo se esiste il token nel localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token) {
      // Se non c'è il token, rispediamo l'utente al login
      router.push('/');
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [router]);

  if (!user) return <p className="p-5">Caricamento in corso...</p>;

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h1>Benvenuto, {user.username}! 👋</h1>
        <p className="text-muted">Questa è la Dashboard amministrativa ERAMUS.</p>
        <hr />
        <div className="alert alert-info">
          Stai visualizzando la dashboard perché il login con JWT ha funzionato.
        </div>
        <button 
          className="btn btn-danger mt-3"
          onClick={() => {
            localStorage.clear();
            router.push('/');
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}