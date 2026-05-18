const Snippet = require('../models/Snippet');
const Execution = require('../models/Execution');
const { nanoid } = require('nanoid');

// POST /api/snippets — Save a snippet
const createSnippet = async (req, res) => {
  const { title, language, code, isPublic } = req.body;

  try {
    const snippet = await Snippet.create({
      userId: req.user._id,
      title,
      language,
      code,
      shareId: isPublic ? nanoid(10) : undefined,
      isPublic: isPublic || false,
    });

    res.status(201).json({ snippet });
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Failed to save snippet' });
  }
};

// GET /api/snippets — List user's snippets
const getSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-code'); // Don't send full code in list view

    res.json({ snippets });
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
};

// GET /api/snippets/:id — Get a specific snippet
const getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ snippet });
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
};

// DELETE /api/snippets/:id — Delete a snippet
const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
};

// GET /api/share/:shareId — Get a shared snippet (public)
const getSharedSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      shareId: req.params.shareId,
      isPublic: true,
    }).populate('userId', 'username');

    if (!snippet) {
      return res.status(404).json({ error: 'Shared snippet not found' });
    }

    res.json({ snippet });
  } catch (error) {
    console.error('Get shared snippet error:', error);
    res.status(500).json({ error: 'Failed to fetch shared snippet' });
  }
};

// GET /api/history — Get execution history
const getHistory = async (req, res) => {
  try {
    const history = await Execution.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-code'); // Don't send full code

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

module.exports = {
  createSnippet,
  getSnippets,
  getSnippet,
  deleteSnippet,
  getSharedSnippet,
  getHistory,
};
