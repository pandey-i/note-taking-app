import express from 'express';
import { Note } from '../models/Note';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all notes for authenticated user
router.get('/', auth, async (req: any, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note
router.post('/', auth, async (req: any, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }

    if (title.length > 100) {
      res.status(400).json({ message: 'Title must be less than 100 characters' });
      return;
    }

    const note = new Note({
      title,
      content,
      user: req.user._id
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note
router.put('/:id', auth, async (req: any, res) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;

    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }

    if (title.length > 100) {
      res.status(400).json({ message: 'Title must be less than 100 characters' });
      return;
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: req.user._id },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', auth, async (req: any, res) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findOneAndDelete({ _id: noteId, user: req.user._id });

    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single note
router.get('/:id', auth, async (req: any, res) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user: req.user._id });

    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 