// Docker configuration for code execution containers
const dockerConfig = {
  images: {
    python: 'codeforge-python',
    cpp: 'codeforge-cpp',
    java: 'codeforge-java',
  },

  // Container resource limits
  limits: {
    memory: process.env.DOCKER_MEMORY_LIMIT || '512m',
    cpus: parseFloat(process.env.DOCKER_CPU_LIMIT) || 0.5,
    timeout: parseInt(process.env.DOCKER_TIMEOUT) || 60000,
    pidsLimit: 50,
    maxCodeSize: 50 * 1024, // 50KB
    maxInputSize: 10 * 1024, // 10KB
  },

  // Compile & run commands per language
  commands: {
    python: {
      compile: null,
      run: 'python3 -u /sandbox/code.py',
      extension: '.py',
      filename: 'code.py',
    },
    cpp: {
      compile: 'g++ -o /sandbox/code /sandbox/code.cpp -std=c++17 -O2 -I/usr/include/eigen3 -lm -lpthread',
      run: '/sandbox/code',
      extension: '.cpp',
      filename: 'code.cpp',
    },
    java: {
      compile: 'javac -cp ".:/usr/share/java/lib/*" /sandbox/Main.java',
      run: 'java -cp ".:/sandbox:/usr/share/java/lib/*" Main',
      extension: '.java',
      filename: 'Main.java',
    },
  },

  // Supported languages list
  supportedLanguages: ['python', 'cpp', 'java'],
};

module.exports = dockerConfig;
