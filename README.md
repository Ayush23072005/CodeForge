# ⚡ CodeForge — Online Code Compiler

A full-stack, cloud-based online code compiler with a VS Code-inspired UI, Docker-sandboxed code execution, and modern developer tooling.

![CodeForge](https://img.shields.io/badge/CodeForge-Online%20Compiler-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-24-green?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Sandboxed-2496ED?style=flat-square)

## Features

- 🎨 **VS Code-inspired UI** — Monaco Editor with syntax highlighting, minimap, and themes
- 🐍 **Multi-language support** — Python, C++, and Java
- 🐳 **Docker sandboxed execution** — Each code run is isolated in a container
- 🌙 **Dark/Light themes** — Smooth theme switching with system preference detection
- 🔐 **JWT Authentication** — Register, login, save code snippets
- 📋 **Code sharing** — Share snippets via unique links
- ⏱️ **Execution metrics** — Time, status, stdout/stderr separation
- 📥 **Custom input** — Optional stdin support
- ⌨️ **Keyboard shortcuts** — Ctrl+Enter to run code

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Monaco Editor |
| Backend | Node.js, Express |
| Database | MongoDB 7 |
| Execution | Docker (isolated containers) |
| Auth | JWT + bcrypt |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd cc_project

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Build Docker Images

```bash
docker build -t codeforge-python ./docker/python/
docker build -t codeforge-cpp ./docker/cpp/
docker build -t codeforge-java ./docker/java/
```

### 3. Start MongoDB

```bash
docker run -d --name codeforge-mongodb -p 27017:27017 mongo:7
```

### 4. Start the Application

```bash
# Terminal 1 — Backend
cd backend && node server.js

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### 5. Open in Browser

Navigate to `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/run` | Optional | Execute code |
| `POST` | `/api/auth/register` | No | Register user |
| `POST` | `/api/auth/login` | No | Login |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `GET` | `/api/health` | No | System health check |
| `POST` | `/api/snippets` | Yes | Save snippet |
| `GET` | `/api/snippets` | Yes | List snippets |
| `GET` | `/api/snippets/:id` | Yes | Get snippet |
| `DELETE` | `/api/snippets/:id` | Yes | Delete snippet |

## Security

- Code runs in isolated Docker containers with:
  - No network access (`--network none`)
  - Memory limit (128MB)
  - CPU limit (0.5 cores)
  - Process limit (50 PIDs)
  - 5-second timeout
  - Non-root user inside container

## License

MIT
