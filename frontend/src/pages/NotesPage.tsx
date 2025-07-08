import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err: any) {
      setError('Failed to fetch notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await axios.post(
        '/api/notes',
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([res.data, ...notes]);
      setTitle('');
      setContent('');
    } catch (err: any) {
      setError('Failed to create note.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError('');
    try {
      await axios.delete(`/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err: any) {
      setError('Failed to delete note.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', padding: '2rem 0' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontWeight: 700, textAlign: 'center' }}>Your Notes</h2>
          <button onClick={() => navigate('/notes/new')} style={{ padding: '8px 16px', fontSize: '1rem' }}>New</button>
        </div>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0' }}>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ padding: '0.75rem 1rem', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: '1rem' }}
            maxLength={100}
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ padding: '0.75rem 1rem', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: '1rem', minHeight: 80, resize: 'vertical' }}
            required
          />
          <button
            type="submit"
            disabled={creating || !title.trim() || !content.trim()}
            style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer' }}
          >
            {creating ? 'Creating...' : 'Add Note'}
          </button>
        </form>
        {error && <div style={{ color: '#e53935', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        {notes.length === 0 ? (
          <div style={{ color: '#bdbdbd', textAlign: 'center' }}>No notes yet. Start by adding one!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {notes.map(note => (
              <div key={note._id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#fafbfc', position: 'relative' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>{note.title}</h3>
                <p style={{ margin: 0, color: '#444' }}>{note.content}</p>
                <div style={{ fontSize: '0.85rem', color: '#bdbdbd', marginTop: '0.5rem' }}>{new Date(note.createdAt).toLocaleString()}</div>
                <button
                  onClick={() => handleDelete(note._id)}
                  disabled={deletingId === note._id}
                  style={{ position: 'absolute', top: 12, right: 12, background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: '0.95rem', fontWeight: 500, cursor: deletingId === note._id ? 'not-allowed' : 'pointer' }}
                >
                  {deletingId === note._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage; 