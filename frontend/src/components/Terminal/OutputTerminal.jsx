import { useRef, useEffect, useState, useMemo } from 'react';
import { FiTerminal, FiCopy, FiCheck, FiClock, FiMaximize2, FiMinimize2, FiDownload } from 'react-icons/fi';
import './OutputTerminal.css';

// Marker used by the Python sitecustomize.py hook
const IMG_START = '__CODEFORGE_IMG__';
const IMG_END   = '__END_CODEFORGE_IMG__';

/**
 * Parse raw stdout text and split it into an ordered list of
 * { type: 'text', value: '...' } and { type: 'image', value: '<base64>' }
 */
function parseOutput(raw) {
  if (!raw) return [];
  const parts = [];
  let rest = raw;

  while (rest.length > 0) {
    const startIdx = rest.indexOf(IMG_START);
    if (startIdx === -1) {
      parts.push({ type: 'text', value: rest });
      break;
    }
    // Text before the image marker
    if (startIdx > 0) {
      parts.push({ type: 'text', value: rest.slice(0, startIdx) });
    }
    const afterStart = rest.slice(startIdx + IMG_START.length);
    const endIdx = afterStart.indexOf(IMG_END);
    if (endIdx === -1) {
      // Incomplete marker — treat the rest as text (still streaming)
      parts.push({ type: 'text', value: rest.slice(startIdx) });
      break;
    }
    parts.push({ type: 'image', value: afterStart.slice(0, endIdx) });
    rest = afterStart.slice(endIdx + IMG_END.length);
  }

  return parts;
}

const OutputTerminal = ({ output, error, executionTime, status, isRunning }) => {
  const outputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Parse output into text + image segments
  const outputParts = useMemo(() => parseOutput(output), [output]);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, error]);

  const handleCopy = async () => {
    // Copy only the text portions (not base64 blobs)
    const textOnly = outputParts
      .filter((p) => p.type === 'text')
      .map((p) => p.value)
      .join('');
    const text = textOnly || error || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownloadImage = (base64Data, index) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `plot_${index + 1}.png`;
    link.click();
  };

  const hasContent = output || error;

  return (
    <div className={`terminal-container ${expanded ? 'expanded' : ''}`} id="output-terminal">
      <div className="terminal-header">
        <div className="terminal-title">
          <FiTerminal className="terminal-icon" />
          <span>Output</span>
          {status && (
            <span className={`terminal-status status-${status}`}>
              {status}
            </span>
          )}
          {executionTime > 0 && (
            <span className="terminal-time">
              <FiClock />
              {executionTime}ms
            </span>
          )}
        </div>
        <div className="terminal-actions">
          <button
            className="terminal-btn"
            onClick={handleCopy}
            disabled={!hasContent}
            title="Copy output"
            id="copy-output"
          >
            {copied ? <FiCheck className="copied" /> : <FiCopy />}
          </button>
          <button
            className="terminal-btn"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Minimize' : 'Maximize'}
            id="toggle-terminal"
          >
            {expanded ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
        </div>
      </div>

      <div className="terminal-body" ref={outputRef}>
        {isRunning ? (
          <div className="terminal-running">
            <div className="running-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Executing code...</span>
          </div>
        ) : !hasContent ? (
          <div className="terminal-empty">
            <span className="terminal-prompt">$</span>
            <span className="terminal-cursor">Click "Run Code" to execute</span>
          </div>
        ) : (
          <>
            {outputParts.length > 0 && (
              <div className="terminal-output">
                {outputParts.map((part, i) =>
                  part.type === 'text' ? (
                    <pre key={i}>{part.value}</pre>
                  ) : (
                    <div key={i} className="terminal-plot">
                      <img
                        src={`data:image/png;base64,${part.value}`}
                        alt={`Plot ${i + 1}`}
                        className="terminal-plot-img"
                      />
                      <button
                        className="plot-download-btn"
                        onClick={() => handleDownloadImage(part.value, i)}
                        title="Download plot"
                      >
                        <FiDownload /> Save Plot
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
            {error && (
              <div className="terminal-error">
                <pre>{error}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputTerminal;
