const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const dockerConfig = require('../config/docker');

const docker = new Docker();

/**
 * Execute code inside a Docker container with real-time streaming output.
 * Uses `docker run` CLI directly via child_process.spawn for unbuffered streaming.
 */
async function executeCodeStream(language, code, input = '', callbacks) {
  const { onStdout, onStderr, onDone } = callbacks;
  const langConfig = dockerConfig.commands[language];
  const imageName = dockerConfig.images[language];
  const limits = dockerConfig.limits;

  const tempDir = path.join(os.tmpdir(), `codeforge-${uuidv4()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const codeFilePath = path.join(tempDir, langConfig.filename);
  const inputFilePath = path.join(tempDir, 'input.txt');

  try {
    fs.writeFileSync(codeFilePath, code, 'utf8');
    if (input) {
      fs.writeFileSync(inputFilePath, input, 'utf8');
    }

    let cmd;
    if (langConfig.compile) {
      if (input) {
        cmd = `${langConfig.compile} && ${langConfig.run} < /sandbox/input.txt`;
      } else {
        cmd = `${langConfig.compile} && ${langConfig.run}`;
      }
    } else {
      if (input) {
        cmd = `${langConfig.run} < /sandbox/input.txt`;
      } else {
        cmd = langConfig.run;
      }
    }

    const startTime = Date.now();

    // Use Docker CLI directly — this gives us truly unbuffered streaming
    const dockerArgs = [
      'run', '--rm',
      '--network', 'none',
      '--memory', limits.memory,
      `--cpus=${limits.cpus}`,
      `--pids-limit=${limits.pidsLimit}`,
      '-e', 'MPLCONFIGDIR=/tmp/matplotlib',
      '-e', 'HOME=/tmp',
      '-v', `${tempDir}:/sandbox:rw`,
      '-w', '/sandbox',
      '-u', 'runner',
      imageName,
      'sh', '-c', cmd,
    ];

    const proc = spawn('docker', dockerArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Stream stdout in real-time
    proc.stdout.on('data', (chunk) => {
      onStdout(chunk.toString('utf8'));
    });

    // Stream stderr in real-time
    proc.stderr.on('data', (chunk) => {
      onStderr(chunk.toString('utf8'));
    });

    // Timeout handler
    let timedOut = false;
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
      onStderr(`\nExecution timed out after ${limits.timeout / 1000} seconds`);
    }, limits.timeout);

    // Wait for process to exit
    await new Promise((resolve) => {
      proc.on('close', (exitCode) => {
        clearTimeout(timeoutHandle);
        const executionTime = Date.now() - startTime;

        let status;
        if (timedOut) {
          status = 'timeout';
        } else if (exitCode === 0) {
          status = 'success';
        } else {
          status = 'error';
        }

        onDone({ executionTime, status });
        resolve();
      });

      proc.on('error', (err) => {
        clearTimeout(timeoutHandle);
        const executionTime = Date.now() - startTime;
        onDone({ executionTime: 0, status: 'error', error: err.message });
        resolve();
      });
    });
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) { /* ignore */ }
  }
}

/**
 * Check if Docker is available and the required images exist
 */
async function checkDockerHealth() {
  try {
    await docker.ping();
    const images = await docker.listImages();
    const imageNames = images.map((img) => img.RepoTags || []).flat();
    const missing = [];
    for (const [lang, imageName] of Object.entries(dockerConfig.images)) {
      const found = imageNames.some((name) => name.startsWith(imageName));
      if (!found) {
        missing.push({ language: lang, image: imageName });
      }
    }
    return { dockerAvailable: true, missingImages: missing, allReady: missing.length === 0 };
  } catch (error) {
    return { dockerAvailable: false, error: error.message, allReady: false };
  }
}

module.exports = { executeCodeStream, checkDockerHealth };
