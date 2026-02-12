import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useChatStore, useRepoStore } from '../store';
import { api } from '../services/api';
import { Send, Bot, User, Sparkles, Zap, AlignLeft, Code2, AlertTriangle } from 'lucide-react';

export const Chat: React.FC = () => {
  const { messages, addMessage, isTyping, setTyping } = useChatStore();
  const { selectedRepo, repositories, setRepositories, selectRepo } = useRepoStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [repoLoading, setRepoLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const loadRepos = async () => {
      if (repositories.length) return;
      setRepoLoading(true);
      try {
        const repos = await api.fetchRepos();
        setRepositories(repos);
      } finally {
        setRepoLoading(false);
      }
    };
    loadRepos();
  }, [selectedRepo, repositories, setRepositories, selectRepo]);

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
      <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-primary to-indigo-600 p-2 rounded-lg shadow-md">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-display">Repo Assistant</h2>
              <div className="flex items-center text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                {selectedRepo ? `Active repo: ${selectedRepo.name}` : 'Select a repo to start'}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
              context
            </span>
            <select
              value={selectedRepo?.id || ''}
              onChange={handleRepoChange}
              className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 ring-1 ring-gray-100">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display">How can I help you today?</h3>
              <p className="text-gray-500 mb-10 text-lg">I've indexed your codebase. Ask me about architecture, bugs, or specific files.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={(e) => selectedRepo && handleSend(e, s.text)}
                    disabled={!selectedRepo}
                    className={`flex items-start p-4 text-left bg-white border border-gray-200 rounded-xl transition-all group ${selectedRepo ? 'hover:border-primary hover:shadow-md' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    <div className="bg-indigo-50 text-primary p-2 rounded-lg mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      {s.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{s.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm border border-gray-100 ${msg.role === 'user' ? 'bg-white' : 'bg-primary'
                  }`}>
                  {msg.role === 'user' ? <User size={16} className="text-gray-700" /> : <Bot size={16} className="text-white" />}
                </div>
                <div className={`py-3 px-5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}>
                  {msg.role === 'ai' ? (
                    <div className="space-y-2">
                      {msg.content.split('\n').map((para, i) => {
                        // Parse basic markdown: **bold**, *italic*, `code`
                        const formatted = para
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                          .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
                          .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
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
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white py-4 px-5 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100 z-10">
          <form onSubmit={(e) => handleSend(e)} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedRepo ? 'Ask a question about your code…' : 'Select a repository to start chatting…'}
              disabled={!selectedRepo}
              className={`w-full pl-5 pr-14 py-4 border border-gray-200 rounded-xl transition-all shadow-sm text-base font-medium ${selectedRepo ? 'bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary' : 'bg-gray-100 cursor-not-allowed text-gray-500'}`}
            />
            <button
              type="submit"
              disabled={!selectedRepo || !input.trim()}
              className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest">
            AI generated content may be inaccurate
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};