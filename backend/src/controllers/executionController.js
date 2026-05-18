const { executeCodeStream, checkDockerHealth } = require('../services/executionService');
const Execution = require('../models/Execution');

// POST /api/run — Execute code with SSE streaming output
const runCode = async (req, res) => {
  const { code, language, input } = req.body;

  // Check Docker health before setting up SSE
  try {
    const health = await checkDockerHealth();

    if (!health.dockerAvailable) {
      return res.status(503).json({
        error: 'Docker engine is not available. Please ensure Docker is running.',
      });
    }

    if (!health.allReady) {
      const missingLangs = health.missingImages.map((m) => m.language);
      if (missingLangs.includes(language)) {
        return res.status(503).json({
          error: `Docker image for ${language} is not built yet. Run: docker build -t codeforge-${language} ./docker/${language}/`,
        });
      }
    }
  } catch (err) {
    return res.status(503).json({ error: 'Failed to check Docker health.' });
  }

  // Set up SSE streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  res.flushHeaders();

  // Disable Nagle's algorithm so each write is sent immediately
  req.socket.setNoDelay(true);
  req.socket.setTimeout(0);

  // Track accumulated output for history saving
  let accumulatedOutput = '';
  let accumulatedError = '';

  try {
    await executeCodeStream(language, code, input || '', {
      onStdout: (data) => {
        accumulatedOutput += data;
        res.write(`data: ${JSON.stringify({ type: 'stdout', data })}\n\n`);
      },
      onStderr: (data) => {
        accumulatedError += data;
        res.write(`data: ${JSON.stringify({ type: 'stderr', data })}\n\n`);
      },
      onDone: async (result) => {
        // Save to history if user is authenticated
        if (req.user) {
          try {
            await Execution.create({
              userId: req.user._id,
              language,
              code,
              input: input || '',
              output: accumulatedOutput,
              error: accumulatedError || result.error || '',
              executionTime: result.executionTime,
              status: result.status,
            });
          } catch (saveError) {
            console.error('Failed to save execution history:', saveError.message);
          }
        }

        res.write(`data: ${JSON.stringify({
          type: 'done',
          executionTime: result.executionTime,
          status: result.status,
          error: result.error || undefined,
        })}\n\n`);
        res.end();
      },
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.write(`data: ${JSON.stringify({ type: 'stderr', data: 'An internal error occurred during code execution.' })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done', status: 'error', executionTime: 0 })}\n\n`);
    res.end();
  }
};

// GET /api/health — Check system health
const getHealth = async (req, res) => {
  const health = await checkDockerHealth();
  res.json({
    status: 'ok',
    docker: health,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { runCode, getHealth };
