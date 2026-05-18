import { useState, useRef, useEffect } from 'react';
import {
  FiFile, FiClock, FiBookmark, FiTrash2,
  FiPlus, FiEdit2, FiCheck, FiX,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const langIcons = { python: '🐍', cpp: '⚙️', java: '☕' };
const defaultExts = [
  { label: 'Python (.py)', ext: '.py' },
  { label: 'C++ (.cpp)', ext: '.cpp' },
  { label: 'Java (.java)', ext: '.java' },
];

const Sidebar = ({
  isOpen,
  files = [],
  activeFileId,
  onSwitchFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  snippets = [],
  history = [],
  onLoadSnippet,
  onDeleteSnippet,
}) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('files');

  // New file state
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const newFileRef = useRef(null);

  // Rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef(null);

  // Focus inputs when shown
  useEffect(() => {
    if (showNewFile && newFileRef.current) newFileRef.current.focus();
  }, [showNewFile]);

  useEffect(() => {
    if (renamingId && renameRef.current) renameRef.current.focus();
  }, [renamingId]);

  const handleCreateFile = () => {
    const name = newFileName.trim();
    if (!name) return;
    // Add default extension if none provided
    const hasExt = name.includes('.');
    const finalName = hasExt ? name : name + '.py';

    // Check for duplicate names
    if (files.some((f) => f.name === finalName)) {
      return; // silently ignore duplicates
    }

    onCreateFile?.(finalName);
    setNewFileName('');
    setShowNewFile(false);
  };

  const handleRename = (fileId) => {
    const name = renameValue.trim();
    if (name && !files.some((f) => f.id !== fileId && f.name === name)) {
      onRenameFile?.(fileId, name);
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const startRename = (file) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const tabs = [
    { id: 'files', icon: <FiFile />, label: 'Files' },
    { id: 'history', icon: <FiClock />, label: 'History' },
    { id: 'snippets', icon: <FiBookmark />, label: 'Saved' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="sidebar-content">
        {/* ── FILES TAB ── */}
        {activeTab === 'files' && (
          <div className="sidebar-section animate-fadeIn">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Files</span>
              <button
                className="sidebar-action-btn"
                onClick={() => setShowNewFile(true)}
                title="New file"
                id="new-file-btn"
              >
                <FiPlus />
              </button>
            </div>

            {/* New file input */}
            {showNewFile && (
              <div className="new-file-input">
                <input
                  ref={newFileRef}
                  type="text"
                  className="file-name-input"
                  placeholder="filename.py"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFile();
                    if (e.key === 'Escape') setShowNewFile(false);
                  }}
                />
                <button className="file-input-ok" onClick={handleCreateFile}>
                  <FiCheck />
                </button>
                <button className="file-input-cancel" onClick={() => setShowNewFile(false)}>
                  <FiX />
                </button>
              </div>
            )}

            {/* Quick create buttons */}
            {showNewFile && (
              <div className="quick-create">
                {defaultExts.map((item) => (
                  <button
                    key={item.ext}
                    className="quick-create-btn"
                    onClick={() => {
                      const base = newFileName.trim().replace(/\.[^.]+$/, '') || 'untitled';
                      onCreateFile?.(base + item.ext);
                      setNewFileName('');
                      setShowNewFile(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* File list */}
            <div className="file-tree">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`file-item ${file.id === activeFileId ? 'active' : ''}`}
                  onClick={() => onSwitchFile?.(file.id)}
                >
                  <span className="file-lang-icon">
                    {langIcons[file.language] || '📄'}
                  </span>

                  {renamingId === file.id ? (
                    <input
                      ref={renameRef}
                      type="text"
                      className="file-rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(file.id);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onBlur={() => handleRename(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="file-name">{file.name}</span>
                  )}

                  <div className="file-actions">
                    <button
                      className="file-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(file);
                      }}
                      title="Rename"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="file-action-btn file-action-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile?.(file.id);
                      }}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="sidebar-hint">
              {files.length} file{files.length !== 1 ? 's' : ''} · Saved in browser
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="sidebar-section animate-fadeIn">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">History</span>
            </div>
            {!isAuthenticated ? (
              <div className="sidebar-empty">
                <FiClock className="empty-icon" />
                <p>Sign in to view execution history</p>
              </div>
            ) : history.length === 0 ? (
              <div className="sidebar-empty">
                <FiClock className="empty-icon" />
                <p>No execution history yet</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item, i) => (
                  <div key={i} className={`history-item ${item.status}`}>
                    <span className="history-lang">{langIcons[item.language]}</span>
                    <div className="history-info">
                      <span className="history-status">{item.status}</span>
                      <span className="history-time">{item.executionTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SNIPPETS TAB ── */}
        {activeTab === 'snippets' && (
          <div className="sidebar-section animate-fadeIn">
            <div className="sidebar-section-header">
              <span className="sidebar-section-title">Saved</span>
            </div>
            {!isAuthenticated ? (
              <div className="sidebar-empty">
                <FiBookmark className="empty-icon" />
                <p>Sign in to save & load snippets</p>
              </div>
            ) : snippets.length === 0 ? (
              <div className="sidebar-empty">
                <FiBookmark className="empty-icon" />
                <p>No saved snippets yet</p>
              </div>
            ) : (
              <div className="snippet-list">
                {snippets.map((snippet) => (
                  <div
                    key={snippet._id}
                    className="snippet-item"
                    onClick={() => onLoadSnippet?.(snippet)}
                  >
                    <span className="snippet-lang">{langIcons[snippet.language]}</span>
                    <div className="snippet-info">
                      <span className="snippet-title">{snippet.title}</span>
                      <span className="snippet-date">
                        {new Date(snippet.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="snippet-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSnippet?.(snippet._id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
