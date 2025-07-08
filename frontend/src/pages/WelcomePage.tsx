import React, { useEffect, useState } from 'react';
import api from '../api';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

const WelcomePage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      try {
        const res = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err: any) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  if (error) return <div style={{ color: '#e53935', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
      <div style={{ background: '#fff', padding: '2rem 2.5rem', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 320, maxWidth: '90vw', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>Welcome, {user?.name}!</h2>
        <p style={{ color: '#6c63ff', fontWeight: 500, margin: '1rem 0 0.5rem 0' }}>{user?.email}</p>
        <button onClick={handleLogout} style={{ marginTop: '2rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default WelcomePage; 