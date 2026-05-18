import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';
import './CodeEditor.css';

const languageMap = {
  python: 'python',
  cpp: 'cpp',
  java: 'java',
};

const defaultCode = {
  python: `# Welcome to CodeForge! ⚡
# Write your Python code here

def fibonacci(n):
    """Generate the first n Fibonacci numbers."""
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]

# Print the first 10 Fibonacci numbers
result = fibonacci(10)
print("Fibonacci Sequence:", result)
print(f"Sum: {sum(result)}")
`,
  cpp: `// Welcome to CodeForge! ⚡
// Write your C++ code here

#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 10;
    vector<int> fib(n);
    fib[0] = 0;
    fib[1] = 1;
    
    for (int i = 2; i < n; i++) {
        fib[i] = fib[i-1] + fib[i-2];
    }
    
    cout << "Fibonacci Sequence: ";
    for (int i = 0; i < n; i++) {
        cout << fib[i];
        if (i < n-1) cout << ", ";
    }
    cout << endl;
    
    return 0;
}
`,
  java: `// Welcome to CodeForge! ⚡
// Write your Java code here

public class Main {
    public static void main(String[] args) {
        int n = 10;
        int[] fib = new int[n];
        fib[0] = 0;
        fib[1] = 1;
        
        for (int i = 2; i < n; i++) {
            fib[i] = fib[i-1] + fib[i-2];
        }
        
        System.out.print("Fibonacci Sequence: ");
        for (int i = 0; i < n; i++) {
            System.out.print(fib[i]);
            if (i < n-1) System.out.print(", ");
        }
        System.out.println();
    }
}
`,
};

const CodeEditor = ({ language, code, setCode, fileName }) => {
  const { theme } = useTheme();
  const editorRef = useRef(null);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange = (value) => {
    setCode(value !== undefined ? value : '');
  };

  // Only use default code when code is null/undefined (initial load)
  const editorCode = code !== null && code !== undefined ? code : (defaultCode[language] || '');
  const displayName = fileName || (language === 'python' ? 'main.py' : language === 'cpp' ? 'main.cpp' : 'Main.java');

  return (
    <div className="editor-container" id="code-editor">
      <div className="editor-tab-bar">
        <div className="editor-tab active">
          <span className="editor-tab-dot"></span>
          <span className="editor-tab-name">{displayName}</span>
        </div>
      </div>
      <div className="editor-body">
        <Editor
          height="100%"
          language={languageMap[language]}
          value={editorCode}
          onChange={handleChange}
          onMount={handleEditorMount}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            wordWrap: 'on',
            suggest: { showSnippets: true },
            automaticLayout: true,
          }}
          loading={
            <div className="editor-loading">
              <span>Loading editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export { defaultCode };
export default CodeEditor;
