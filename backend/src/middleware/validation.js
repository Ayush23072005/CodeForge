const dockerConfig = require('../config/docker');

// Validate code execution request
const validateExecution = (req, res, next) => {
  const { code, language, input } = req.body;

  // Check language
  if (!language || !dockerConfig.supportedLanguages.includes(language)) {
    return res.status(400).json({
      error: `Invalid language. Supported: ${dockerConfig.supportedLanguages.join(', ')}`,
    });
  }

  // Check code exists
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ error: 'Code is required and must be a non-empty string' });
  }

  // Check code size
  if (Buffer.byteLength(code, 'utf8') > dockerConfig.limits.maxCodeSize) {
    return res.status(400).json({
      error: `Code size exceeds limit of ${dockerConfig.limits.maxCodeSize / 1024}KB`,
    });
  }

  // Check input size
  if (input && Buffer.byteLength(String(input), 'utf8') > dockerConfig.limits.maxInputSize) {
    return res.status(400).json({
      error: `Input size exceeds limit of ${dockerConfig.limits.maxInputSize / 1024}KB`,
    });
  }

  next();
};

// Validate auth input
const validateAuth = (req, res, next) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // For registration, also validate username
  if (req.path === '/register') {
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        error: 'Username can only contain letters, numbers, and underscores',
      });
    }
  }

  next();
};

// Validate snippet input
const validateSnippet = (req, res, next) => {
  const { title, language, code } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Snippet title is required' });
  }

  if (title.length > 100) {
    return res.status(400).json({ error: 'Title cannot exceed 100 characters' });
  }

  if (!language || !dockerConfig.supportedLanguages.includes(language)) {
    return res.status(400).json({
      error: `Invalid language. Supported: ${dockerConfig.supportedLanguages.join(', ')}`,
    });
  }

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({ error: 'Code is required' });
  }

  next();
};

module.exports = { validateExecution, validateAuth, validateSnippet };
