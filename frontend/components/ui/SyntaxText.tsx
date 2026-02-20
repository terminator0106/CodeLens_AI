import React from 'react';

type Token = {
    type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'variable' | 'bracket' | 'text';
    text: string;
    bracketType?: '()' | '{}' | '[]';
};

const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];

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

interface SyntaxTextProps {
    text: string;
    className?: string;
}

export const SyntaxText: React.FC<SyntaxTextProps> = ({ text, className = '' }) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {text.split('\n').map((para, i) => {
                // Parse basic markdown: **bold**, *italic*, `code`
                const parts: React.ReactNode[] = [];
                let remaining = para;
                let key = 0;

                // Match inline code
                const codeRegex = /`([^`]+)`/g;
                let lastIndex = 0;
                let match;

                while ((match = codeRegex.exec(para)) !== null) {
                    // Add text before code
                    if (match.index > lastIndex) {
                        const beforeText = para.slice(lastIndex, match.index);
                        const formatted = beforeText
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
                            .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
                        parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: formatted }} />);
                    }

                    // Add syntax-highlighted code
                    const code = match[1];
                    const tokens = tokenizeLine(code);
                    parts.push(
                        <code key={key++} className="bg-primary/20 px-2 py-0.5 rounded text-sm font-mono inline-block">
                            {tokens.map((token, ti) => (
                                <TokenSpan key={ti} token={token} />
                            ))}
                        </code>
                    );

                    lastIndex = match.index + match[0].length;
                }

                // Add remaining text
                if (lastIndex < para.length) {
                    const remainingText = para.slice(lastIndex);
                    const formatted = remainingText
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
                    parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: formatted }} />);
                }

                return para.trim() ? (
                    <p key={i} className="leading-relaxed">
                        {parts.length > 0 ? parts : para}
                    </p>
                ) : null;
            })}
        </div>
    );
};
