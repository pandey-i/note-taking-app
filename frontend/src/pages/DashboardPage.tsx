import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  return (
    name.replace(/./g, 'x') + '@' + domain.replace(/./g, 'x')
  );
}

const YELLOW = '#FFD600';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchUserAndNotes();
    // eslint-disable-next-line
  }, []);

  const fetchUserAndNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const [userRes, notesRes] = await Promise.all([
        axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/notes', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUser(userRes.data.user);
      setNotes(notesRes.data);
    } catch (err: any) {
      setError('Session expired or failed to fetch data. Please log in again.');
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleCreateNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await axios.post(
        '/api/notes',
        { title: noteTitle, content: noteContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([res.data, ...notes]);
      setNoteTitle('');
      setNoteContent('');
    } catch (err: any) {
      setError('Failed to create note.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
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

  const startEdit = (note: Note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setError('');
    try {
      const res = await axios.put(
        `/api/notes/${id}`,
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.map(note => note._id === id ? res.data : note));
      cancelEdit();
    } catch (err: any) {
      setError('Failed to update note.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  if (error) return <div style={{ color: '#e53935', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
        <span style={{ fontSize: 32, color: YELLOW, marginRight: 12, display: 'flex', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke={YELLOW} strokeWidth="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" stroke={YELLOW} strokeWidth="2" strokeLinecap="round"/></svg>
        </span>
        <span style={{ fontWeight: 600, fontSize: 28, flex: 1, textAlign: 'left', marginLeft: 8 }}>Dashboard</span>
        <button onClick={handleSignOut} style={{ color: YELLOW, background: 'none', border: 'none', fontWeight: 500, fontSize: 20, cursor: 'pointer', textDecoration: 'underline' }}>Sign Out</button>
      </div>

      {/* Welcome Card */}
      <div style={{ margin: '2rem 1rem 1.5rem 1rem', background: '#fff', borderRadius: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.10)', padding: '2rem 1.5rem', textAlign: 'left' }}>
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 10 }}>Welcome, {user?.name} !</div>
        <div style={{ fontSize: 20, color: '#444' }}>Email: {user?.email}</div>
      </div>

      {/* Create Note Form */}
      <form onSubmit={handleCreateNote} style={{ margin: '1.5rem 1rem 2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          placeholder="Note title..."
          value={noteTitle}
          onChange={e => setNoteTitle(e.target.value)}
          style={{ marginBottom: 12, width: '100%', padding: '0.9rem 1rem', border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 18 }}
          required
        />
        <textarea
          placeholder="Note content..."
          value={noteContent}
          onChange={e => setNoteContent(e.target.value)}
          style={{ marginBottom: 12, width: '100%', padding: '0.9rem 1rem', border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 18, minHeight: 60, resize: 'vertical' }}
          required
        />
        <button
          type="submit"
          disabled={creating || !noteTitle.trim() || !noteContent.trim()}
          style={{ width: '100%', background: YELLOW, color: '#222', border: 'none', borderRadius: 20, padding: '1.2rem 0', fontSize: 24, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(53,117,246,0.08)' }}
        >
          {creating ? 'Creating...' : 'Create Note'}
        </button>
      </form>

      {/* Notes Section */}
      <div style={{ margin: '1.5rem 1rem 0 1rem' }}>
        <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 18 }}>Notes</div>
        {notes.length === 0 ? (
          <div style={{ color: '#bdbdbd', textAlign: 'center', fontSize: 18 }}>No notes yet. Start by adding one!</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notes.map(note => (
              <li key={note._id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative' }}>
                {editingId === note._id ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={{ width: '100%', marginBottom: 8, padding: '0.5rem', fontSize: 16, borderRadius: 6, border: '1px solid #ccc' }}
                      maxLength={100}
                    />
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      style={{ width: '100%', marginBottom: 8, padding: '0.5rem', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleSaveEdit(note._id)}
                        disabled={!editTitle.trim() || !editContent.trim()}
                        style={{ background: '#FFD600', color: '#222', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: 16, fontWeight: 500, cursor: !editTitle.trim() || !editContent.trim() ? 'not-allowed' : 'pointer' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>{note.title}</div>
                    <div style={{ color: '#666', marginTop: 4 }}>{note.content.slice(0, 80)}{note.content.length > 80 ? '...' : ''}</div>
                    <button
                      onClick={() => startEdit(note)}
                      style={{ position: 'absolute', top: 16, right: 90, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      disabled={deletingId === note._id}
                      style={{ position: 'absolute', top: 16, right: 16, background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', fontSize: 16, fontWeight: 500, cursor: deletingId === note._id ? 'not-allowed' : 'pointer' }}
                    >
                      {deletingId === note._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 