import { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import CodeEditor, { defaultCode } from './components/Editor/CodeEditor';
import OutputTerminal from './components/Terminal/OutputTerminal';
import AuthModal from './components/Auth/AuthModal';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ── File helpers ──
const STORAGE_KEY = 'codeforge-files';
const ACTIVE_KEY = 'codeforge-active-file';

const extToLang = {
  '.py': 'python',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.c': 'cpp',
  '.java': 'java',
};

const langToExt = { python: '.py', cpp: '.cpp', java: '.java' };

function detectLanguage(filename) {
  const ext = filename.substring(filename.lastIndexOf('.'));
  return extToLang[ext] || 'python';
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createDefaultFiles() {
  return [
    { id: makeId(), name: 'main.py', language: 'python', code: defaultCode.python },
    { id: makeId(), name: 'main.cpp', language: 'cpp', code: defaultCode.cpp },
    { id: makeId(), name: 'Main.java', language: 'java', code: defaultCode.java },
  ];
}

function loadFiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return createDefaultFiles();
}

function saveFiles(files) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

// ── App ──
function AppContent() {
  const [files, setFiles] = useState(loadFiles);
  const [activeFileId, setActiveFileId] = useState(() => {
    const saved = localStorage.getItem(ACTIVE_KEY);
    const initial = loadFiles();
    if (saved && initial.some((f) => f.id === saved)) return saved;
    return initial[0]?.id;
  });

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState(0);
  const [status, setStatus] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const abortRef = useRef(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const language = activeFile?.language || 'python';
  const code = activeFile?.code ?? '';

  // Persist files & active file to localStorage
  useEffect(() => {
    saveFiles(files);
  }, [files]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeFileId);
  }, [activeFileId]);

  // ── File operations ──
  const setCode = useCallback((newCode) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, code: newCode } : f))
    );
  }, [activeFileId]);

  const setLanguage = useCallback((newLang) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== activeFileId) return f;
        const baseName = f.name.substring(0, f.name.lastIndexOf('.'));
        return { ...f, language: newLang, name: baseName + langToExt[newLang] };
      })
    );
  }, [activeFileId]);

  const createFile = useCallback((name) => {
    const lang = detectLanguage(name);
    const newFile = {
      id: makeId(),
      name,
      language: lang,
      code: `// ${name}\n`,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOutput('');
    setError('');
    setStatus('');
    toast.success(`Created ${name}`);
  }, []);

  const deleteFile = useCallback((fileId) => {
    setFiles((prev) => {
      if (prev.length <= 1) {
        toast.error("Can't delete the last file");
        return prev;
      }
      const updated = prev.filter((f) => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(updated[0].id);
      }
      return updated;
    });
  }, [activeFileId]);

  const renameFile = useCallback((fileId, newName) => {
    const lang = detectLanguage(newName);
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName, language: lang } : f))
    );
  }, []);

  const switchFile = useCallback((fileId) => {
    setActiveFileId(fileId);
    setOutput('');
    setError('');
    setStatus('');
    setExecutionTime(0);
  }, []);

  // ── Run code ──
  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsRunning(true);
    setOutput('');
    setError('');
    setStatus('');
    setExecutionTime(0);

    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('codeforge-token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, language, input }),
        signal: controller.signal,
      });

      // If the response is JSON (error from middleware/validation), handle it
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        setError(data.error || 'Execution failed');
        setStatus('error');
        toast.error(data.error || 'Execution failed');
        setIsRunning(false);
        abortRef.current = null;
        return;
      }

      if (!response.ok) {
        setError(`Server error: ${response.status}`);
        setStatus('error');
        toast.error('Server error');
        setIsRunning(false);
        abortRef.current = null;
        return;
      }

      // Read the SSE stream using the ReadableStream API
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events from the buffer
        const parts = buffer.split('\n\n');
        // Keep the last part in the buffer (it may be incomplete)
        buffer = parts.pop() || '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(trimmed.slice(6));
            if (event.type === 'stdout') {
              setOutput((prev) => prev + event.data);
            } else if (event.type === 'stderr') {
              setError((prev) => prev + event.data);
            } else if (event.type === 'done') {
              setExecutionTime(event.executionTime || 0);
              setStatus(event.status || 'success');
              if (event.error) setError((prev) => prev + event.error);
              if (event.status === 'success') {
                toast.success(`Executed in ${event.executionTime}ms`);
              } else if (event.status === 'timeout') {
                toast.error('Execution timed out');
              } else if (event.status !== 'success') {
                toast.error('Execution error');
              }
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled — do nothing
      } else {
        setError('Failed to execute code. Is the backend running?');
        setStatus('error');
        toast.error('Connection failed');
      }
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [code, language, input]);

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  return (
    <div className="app-layout">
      <Header
        language={language}
        setLanguage={setLanguage}
        onRun={handleRun}
        isRunning={isRunning}
        onAuthClick={() => setShowAuth(true)}
      />

      <div className="app-body">
        <Sidebar
          isOpen={sidebarOpen}
          files={files}
          activeFileId={activeFileId}
          onSwitchFile={switchFile}
          onCreateFile={createFile}
          onDeleteFile={deleteFile}
          onRenameFile={renameFile}
        />

        <main className="app-main">
          <div className="editor-panel">
            <CodeEditor
              language={language}
              code={code}
              setCode={setCode}
              fileName={activeFile?.name}
            />
          </div>

          {showInput && (
            <div className="input-panel">
              <div className="input-header">
                <span className="input-label">📥 Input (stdin)</span>
                <button className="input-close" onClick={() => setShowInput(false)}>✕</button>
              </div>
              <textarea
                className="input-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
                id="stdin-input"
              />
            </div>
          )}

          <div className="input-toggle-bar">
            <button
              className={`input-toggle-btn ${showInput ? 'active' : ''}`}
              onClick={() => setShowInput(!showInput)}
              id="toggle-input"
            >
              {showInput ? '📥 Hide Input' : '📥 Show Input'}
            </button>
            <span className="keyboard-hint">Ctrl+Enter to run</span>
          </div>

          <OutputTerminal
            output={output}
            error={error}
            executionTime={executionTime}
            status={status}
            isRunning={isRunning}
          />
        </main>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
