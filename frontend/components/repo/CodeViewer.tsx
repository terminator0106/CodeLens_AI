import React from 'react';
import { FileNode } from '../../types';

interface CodeViewerProps {
  file: FileNode | null;
  isLoading?: boolean;
  error?: string;
  onAskSymbol?: (payload: { function_name: string; start_line: number; end_line: number }) => void;
}

type DetectedSymbol = {
  function_name: string;
  start_line: number;
  end_line: number;
  start_col: number;
  end_col: number;
};

const leadingIndent = (line: string) => {
  const m = (line || '').match(/^[\t ]*/);
  return (m?.[0] || '').length;
};

const detectSymbols = (content: string, language?: string): DetectedSymbol[] => {
  const lines = (content || '').split('\n');
  const lang = (language || '').toLowerCase();

  const isPython = lang.includes('python') || lang === 'py';
  const isJs =
    lang.includes('typescript') ||
    lang.includes('javascript') ||
    lang === 'ts' ||
    lang === 'tsx' ||
    lang === 'js' ||
    lang === 'jsx';

  const symbols: DetectedSymbol[] = [];

  const findJsEndLine = (startLineIdx: number): number => {
    const maxLookahead = Math.min(lines.length - 1, startLineIdx + 400);

    let braceDepth = 0;
    let started = false;
    for (let i = startLineIdx; i <= maxLookahead; i++) {
      const line = lines[i] || '';
      for (let j = 0; j < line.length; j++) {
        const ch = line[j];
        if (ch === '{') {
          braceDepth++;
          started = true;
        } else if (ch === '}') {
          if (started) braceDepth = Math.max(0, braceDepth - 1);
          if (started && braceDepth === 0) return i + 1;
        }
      }
    }
    return Math.min(lines.length, startLineIdx + 40 + 1);
  };

  const findPyEndLine = (startLineIdx: number): number => {
    const defIndent = leadingIndent(lines[startLineIdx] || '');
    let end = startLineIdx;

    for (let i = startLineIdx + 1; i < lines.length; i++) {
      const line = lines[i] || '';
      const trimmed = line.trim();

      if (!trimmed) {
        end = i;
        continue;
      }
      if (trimmed.startsWith('#')) {
        end = i;
        continue;
      }

      const ind = leadingIndent(line);
      if (ind <= defIndent) {
        return end + 1;
      }
      end = i;
    }
    return end + 1;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';

    if (isPython) {
      const m = line.match(/^\s*(?:async\s+)?def\s+([A-Za-z_][\w]*)\s*\(/);
      if (m) {
        const name = m[1];
        const startCol = line.indexOf(name);
        const endCol = startCol + name.length;
        symbols.push({
          function_name: name,
          start_line: i + 1,
          end_line: findPyEndLine(i),
          start_col: Math.max(0, startCol),
          end_col: Math.max(0, endCol),
        });
      }
      continue;
    }

    if (isJs) {
      const fn = line.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/);
      const arrow = line.match(/^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
      const assign = line.match(/^\s*([A-Za-z_$][\w$]*)\s*=\s*function\s*\(/);
      const name = (fn?.[1] || arrow?.[1] || assign?.[1] || '').trim();
      if (name) {
        const startCol = line.indexOf(name);
        const endCol = startCol + name.length;
        symbols.push({
          function_name: name,
          start_line: i + 1,
          end_line: findJsEndLine(i),
          start_col: Math.max(0, startCol),
          end_col: Math.max(0, endCol),
        });
      }
    }
  }

  return symbols;
};

type Token = {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'variable' | 'bracket' | 'text';
  text: string;
  bracketType?: '()' | '{}' | '[]';
};

const tokenizeLine = (line: string, language?: string): Token[] => {
  const tokens: Token[] = [];
  const lang = (language || '').toLowerCase();

  const keywords = new Set([
    'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while', 'return', 'import', 'export',
    'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'instanceof',
    'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'with',
    'try', 'except', 'finally', 'raise', 'lambda', 'yield', 'pass', 'break', 'continue'
  ]);

  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    // Brackets
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'bracket', text: ch, bracketType: '()' });
      i++;
      continue;
    }
    if (ch === '{' || ch === '}') {
      tokens.push({ type: 'bracket', text: ch, bracketType: '{}' });
      i++;
      continue;
    }
    if (ch === '[' || ch === ']') {
      tokens.push({ type: 'bracket', text: ch, bracketType: '[]' });
      i++;
      continue;
    }

    // Comments
    if (line.slice(i, i + 2) === '//' || line.slice(i, i + 1) === '#') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let str = ch;
      i++;
      while (i < line.length) {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1];
          i += 2;
        } else if (line[i] === quote) {
          str += line[i];
          i++;
          break;
        } else {
          str += line[i];
          i++;
        }
      }
      tokens.push({ type: 'string', text: str });
      continue;
    }

    // Numbers
    if (/\d/.test(ch)) {
      let num = ch;
      i++;
      while (i < line.length && /[\d._]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ type: 'number', text: num });
      continue;
    }

    // Identifiers (keywords, functions, variables)
    if (/[A-Za-z_$]/.test(ch)) {
      let ident = ch;
      i++;
      while (i < line.length && /[\w$]/.test(line[i])) {
        ident += line[i];
        i++;
      }

      // Skip whitespace to check for '('
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;

      if (keywords.has(ident)) {
        tokens.push({ type: 'keyword', text: ident });
      } else if (line[j] === '(') {
        tokens.push({ type: 'function', text: ident });
      } else {
        tokens.push({ type: 'variable', text: ident });
      }
      continue;
    }

    // Everything else
    tokens.push({ type: 'text', text: ch });
    i++;
  }

  return tokens;
};

const TokenSpan: React.FC<{ token: Token }> = ({ token }) => {
  const colors = {
    keyword: 'text-purple-400',
    string: 'text-green-400',
    comment: 'text-gray-500 italic',
    number: 'text-orange-400',
    function: 'text-blue-400 font-semibold',
    variable: 'text-cyan-300',
    text: 'text-foreground',
  };

  const bracketColors = {
    '()': 'text-yellow-400',
    '{}': 'text-pink-400',
    '[]': 'text-indigo-400',
  };

  if (token.type === 'bracket' && token.bracketType) {
    return <span className={`${bracketColors[token.bracketType]} font-bold`}>{token.text}</span>;
  }

  return <span className={colors[token.type] || colors.text}>{token.text}</span>;
};

export const CodeViewer: React.FC<CodeViewerProps> = ({ file, isLoading = false, error = '', onAskSymbol }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
        <p className="text-sm font-medium">Loading file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive bg-secondary/20">
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }
  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
        <div className="bg-card p-6 rounded-full shadow-card mb-6">
          <svg className="w-16 h-16 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xl font-medium text-muted-foreground">Select a file to view content</p>
        <p className="text-muted-foreground mt-2">Browse the directory tree on the left</p>
      </div>
    );
  }

  const content = file.content || '// No content available';
  const lines = content.split('\n');
  const symbols = detectSymbols(content, file.language);
  const symbolByLine = new Map<number, DetectedSymbol>();
  symbols.forEach((s) => {
    // Keep the first symbol per line (simple heuristic).
    if (!symbolByLine.has(s.start_line)) symbolByLine.set(s.start_line, s);
  });

  const lineNumberWidth = String(lines.length).length;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-card">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-base text-foreground font-medium">{file.name}</span>
          <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">{file.language}</span>
        </div>
        <div className="text-xs text-muted-foreground">Read-only</div>
      </div>
      <div className="flex-1 overflow-auto bg-background">
        <div className="flex">
          {/* Line numbers column */}
          <div className="sticky left-0 bg-secondary/30 border-r border-border select-none flex-shrink-0">
            <pre className="font-mono text-[15px] leading-[1.7] text-muted-foreground text-right pr-4 pl-4 py-8">
              {lines.map((_, idx) => (
                <div key={idx + 1} className="hover:bg-secondary/50">
                  {String(idx + 1).padStart(lineNumberWidth, ' ')}
                </div>
              ))}
            </pre>
          </div>

          {/* Code content */}
          <div className="flex-1 overflow-x-auto">
            <pre className="font-mono text-[15px] leading-[1.7] px-8 py-8">
              <code>
                {lines.map((line, idx) => {
                  const lineNo = idx + 1;
                  const sym = symbolByLine.get(lineNo);
                  const tokens = tokenizeLine(line, file.language);

                  return (
                    <div key={lineNo} className="relative group/line">
                      {tokens.map((token, tokenIdx) => {
                        // Check if this token matches the function name we want to highlight
                        // Accept both 'function' and 'variable' types since arrow functions might be categorized as variables
                        const isTargetSymbol = sym && onAskSymbol &&
                          (token.type === 'function' || token.type === 'variable') &&
                          token.text === sym.function_name;

                        if (isTargetSymbol) {
                          return (
                            <span key={tokenIdx} className="relative group/ask inline-block">
                              <span className="text-blue-400 font-semibold bg-blue-400/10 px-1 rounded cursor-pointer group-hover/ask:bg-blue-400/20 transition-colors">
                                {token.text}
                              </span>
                              <button
                                type="button"
                                onClick={() => onAskSymbol!({ function_name: sym.function_name, start_line: sym.start_line, end_line: sym.end_line })}
                                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap opacity-0 pointer-events-none group-hover/ask:opacity-100 group-hover/ask:pointer-events-auto group-hover/line:opacity-100 group-hover/line:pointer-events-auto transition-all duration-150 text-xs px-4 py-2 rounded-lg border-2 border-primary bg-primary text-primary-foreground font-bold shadow-xl hover:bg-primary/90 hover:scale-105 z-20"
                                title={`Ask about ${sym.function_name}`}
                              >
                                ✨ Ask this code
                              </button>
                            </span>
                          );
                        }
                        return <TokenSpan key={tokenIdx} token={token} />;
                      })}
                      {'\n'}
                    </div>
                  );
                })}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};