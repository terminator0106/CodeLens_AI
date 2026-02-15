import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useChatStore, useRepoStore } from '../store';
import { api } from '../services/api';
import { Send, Bot, User, Sparkles, Zap, AlignLeft, Code2, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Chat: React.FC = () => {
  const { messages, addMessage, setMessages, isTyping, setTyping, clearChat } = useChatStore();
  const { selectedRepo, repositories, setRepositories, selectRepo } = useRepoStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Keep the chat UI static by preventing page-level scrolling while this page is mounted.
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const loadRepos = async () => {
      setRepoLoading(true);
      try {
        const repos = repositories.length ? repositories : await api.fetchRepos();
        if (repositories.length === 0) {
          setRepositories(repos);
        }

        // Check if repo is specified in URL
        const urlParams = new URLSearchParams(location.search);
        const repoId = urlParams.get('repo');

        if (repoId) {
          const targetRepo = repos.find(r => r.id === repoId);
          if (targetRepo) {
            selectRepo(targetRepo);
            return;
          }
        }

        // Auto-select repo if none selected
        if (!selectedRepo && repos.length > 0) {
          const indexedRepo = repos.find(r => r.status === 'indexed');
          selectRepo(indexedRepo || repos[0]);
        }
      } finally {
        setRepoLoading(false);
      }
    };
    loadRepos();
  }, [location.search, repositories, selectedRepo, setRepositories, selectRepo]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedRepo?.id) {
        clearChat();
        return;
      }
      setHistoryLoading(true);
      try {
        const res = await api.fetchChatHistory(selectedRepo.id, 200);
        setMessages(
          (res.messages || []).map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp || Date.now()),
          }))
        );
      } catch {
        // If history fails, don't block chatting. Just start fresh.
        clearChat();
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [selectedRepo?.id, setMessages, clearChat]);

  const handleRepoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repoId = e.target.value;
    const repo = repositories.find((r) => r.id === repoId) || null;
    selectRepo(repo);
  };

  const handleSend = async (e: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const text = textOverride || input;
    if (!text.trim()) return;

    setInput('');
    addMessage({ id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() });

    setTyping(true);

    try {
      if (!selectedRepo) {
        throw new Error('Select a repository context before chatting.');
      }
      const response = await api.queryChat(selectedRepo.id, text);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content:
          response.referenced_files?.length
            ? `${response.answer}\n\nSources:\n${response.referenced_files.map((p) => `• ${p}`).join('\n')}`
            : response.answer,
        timestamp: new Date(),
      });
    } catch (error) {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: (error as Error).message || 'Unable to process request.',
        timestamp: new Date(),
      });
    } finally {
      setTyping(false);
    }
  };

  const suggestions = [
    { icon: <Zap size={16} />, text: "Explain auth flow", desc: "Trace login logic" },
    { icon: <Code2 size={16} />, text: "Refactor Component", desc: "Modernize syntax" },
    { icon: <AlertTriangle size={16} />, text: "Security Scan", desc: "Find vulnerabilities" },
    { icon: <AlignLeft size={16} />, text: "Summarize Repo", desc: "High level overview" },
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col bg-card rounded-2xl shadow-float border border-border overflow-hidden relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between z-10 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-primary to-indigo-600 p-2 rounded-lg shadow-md">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">AI Code Assistant</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-accent rounded-full mr-1.5 animate-pulse"></span>
                {selectedRepo ? (
                  <span>Asking about: <strong className="text-primary">{selectedRepo.name}</strong></span>
                ) : (
                  <span className="text-destructive">Select a repository to start</span>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded border border-border">
              context
            </span>
            <select
              value={selectedRepo?.id || ''}
              onChange={handleRepoChange}
              className="text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground"
              disabled={repoLoading}
            >
              <option value="" disabled>
                {repoLoading ? 'Loading repos…' : 'Select repository'}
              </option>
              {repositories.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-secondary/10 scroll-smooth">
          {historyLoading && messages.length === 0 && (
            <div className="text-sm text-muted-foreground px-2">Loading previous conversation…</div>
          )}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="bg-secondary p-4 rounded-2xl shadow-card mb-6 ring-1 ring-border">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-display">How can I help you today?</h3>
              <p className="text-muted-foreground mb-10 text-lg">I've indexed your codebase. Ask me about architecture, bugs, or specific files.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={(e) => selectedRepo && handleSend(e, s.text)}
                    disabled={!selectedRepo}
                    className={`flex items-start p-4 text-left bg-secondary border border-border rounded-xl transition-all group ${selectedRepo ? 'hover:border-primary hover:shadow-float' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    <div className="bg-primary/20 text-primary p-2 rounded-lg mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {s.icon}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{s.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-card border border-border ${msg.role === 'user' ? 'bg-secondary' : 'bg-primary'}
                  `}>
                  {msg.role === 'user' ? <User size={16} className="text-foreground" /> : <Bot size={16} className="text-primary-foreground" />}
                </div>
                <div className={`py-3 px-5 rounded-2xl text-[15px] leading-relaxed shadow-card ${msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-secondary text-foreground rounded-bl-none border border-border'
                  }`}>
                  {msg.role === 'ai' ? (
                    <div className="space-y-2">
                      {msg.content.split('\n').map((paraRaw, i) => {
                        const para = paraRaw.replace(/^\*\s+/, '• ');
                        // Parse basic markdown: **bold**, *italic*, `code`
                        const formatted = para
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                          .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
                          .replace(/`(.+?)`/g, '<code class="bg-card text-foreground px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
                        return para.trim() ? (
                          <div key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
                        ) : (
                          <div key={i} className="h-2" />
                        );
                      })}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-card">
                  <Bot size={16} className="text-primary-foreground" />
                </div>
                <div className="bg-secondary py-4 px-5 rounded-2xl rounded-bl-none border border-border shadow-card flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-card border-t border-border z-10">
          <form onSubmit={(e) => handleSend(e)} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedRepo ? 'Ask a question about your code…' : 'Select a repository to start chatting…'}
              disabled={!selectedRepo}
              className={`w-full pl-5 pr-14 py-4 border border-border rounded-xl transition-all shadow-card text-base font-medium ${selectedRepo ? 'bg-secondary focus:bg-secondary/80 focus:ring-4 focus:ring-primary/20 focus:border-primary' : 'bg-secondary/50 cursor-not-allowed text-muted-foreground'}`}
            />
            <button
              type="submit"
              disabled={!selectedRepo || !input.trim()}
              className="absolute right-2 top-2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-card"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-widest">
            AI generated content may be inaccurate
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};