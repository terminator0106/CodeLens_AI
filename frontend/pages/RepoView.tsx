import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileTree } from '../components/repo/FileTree';
import { CodeViewer } from '../components/repo/CodeViewer';
import { useRepoStore } from '../store';
import { api } from '../services/api';
import { ChevronRight, ArrowLeft, MessageSquare, Box, Layers, BookOpen, Settings, Search, GitBranch, CheckCircle2, Zap, TrendingUp, Network, FileCode } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FileNode } from '../types';

export const RepoView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { fileTree, setFileTree, selectedFile, selectFile, repositories, setRepositories, selectRepo, selectedRepo } = useRepoStore();
    const [activeTab, setActiveTab] = useState<'code' | 'explain' | 'deps'>('code');
    const [searchTerm, setSearchTerm] = useState('');
    const [treeLoading, setTreeLoading] = useState(true);
    const [treeError, setTreeError] = useState('');
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState('');

    const [explainLoading, setExplainLoading] = useState(false);
    const [explainError, setExplainError] = useState('');
    const [explanation, setExplanation] = useState<string>('');
    const [explainMessage, setExplainMessage] = useState<string>('');

    const [metricsLoading, setMetricsLoading] = useState(false);
    const [metricsError, setMetricsError] = useState('');
    const [metrics, setMetrics] = useState<{ lines: number; chunks: number; avg_chunk_size: number } | null>(null);

    useEffect(() => {
        const loadRepoDetails = async () => {
            if (id) {
                setTreeLoading(true);
                setTreeError('');
                try {
                    if (repositories.length === 0) {
                        const repos = await api.fetchRepos();
                        setRepositories(repos);
                    }
                    const repo = repositories.find((entry) => entry.id === id);
                    if (repo) {
                        selectRepo(repo);
                    }
                    const tree = await api.fetchRepoFiles(id);
                    setFileTree(tree);
                } catch (error) {
                    setTreeError((error as Error).message || 'Unable to load repository files.');
                } finally {
                    setTreeLoading(false);
                }
            }
        };
        loadRepoDetails();
        return () => selectFile(null); // Cleanup
    }, [id, setFileTree, selectFile, repositories, setRepositories, selectRepo]);

    const tabsEnabled = Boolean(selectedFile && selectedFile.type === 'file' && selectedFile.fileId);

    useEffect(() => {
        // Reset file-scoped panels when selection changes.
        setExplainError('');
        setExplanation('');
        setExplainMessage('');
        setMetricsError('');
        setMetrics(null);
    }, [selectedFile?.id]);

    useEffect(() => {
        const run = async () => {
            if (!tabsEnabled || !id || !selectedFile?.fileId) return;
            if (activeTab !== 'explain') return;

            setExplainLoading(true);
            setExplainError('');
            setExplanation('');
            setExplainMessage('');
            try {
                const res = await api.explainFile(id, selectedFile.fileId);
                if (res.message) {
                    setExplainMessage(res.message);
                } else {
                    setExplanation(res.explanation || '');
                }
            } catch (err) {
                setExplainError((err as Error).message || 'Unable to explain file.');
            } finally {
                setExplainLoading(false);
            }
        };
        run();
    }, [activeTab, tabsEnabled, id, selectedFile?.fileId]);

    useEffect(() => {
        const run = async () => {
            if (!tabsEnabled || !id || !selectedFile?.fileId) return;
            if (activeTab !== 'deps') return;

            setMetricsLoading(true);
            setMetricsError('');
            setMetrics(null);
            try {
                const res = await api.fetchFileMetrics(id, selectedFile.fileId);
                setMetrics(res);
            } catch (err) {
                setMetricsError((err as Error).message || 'Unable to load file metrics.');
            } finally {
                setMetricsLoading(false);
            }
        };
        run();
    }, [activeTab, tabsEnabled, id, selectedFile?.fileId]);

    const handleSelectFile = async (node: FileNode) => {
        if (node.type !== 'file' || !id || !node.fileId) {
            selectFile(node);
            return;
        }
        setFileLoading(true);
        setFileError('');
        try {
            const content = await api.fetchFileContent(id, node.fileId);
            selectFile({
                ...node,
                content: content.content,
                language: content.language || node.language,
                filePath: content.file_path,
            });
        } catch (error) {
            setFileError((error as Error).message || 'Unable to load file content.');
            selectFile({ ...node, content: '' });
        } finally {
            setFileLoading(false);
        }
    };

    // Very basic filter logic (visual only for this mock)
    const filteredTree = searchTerm
        ? fileTree.map(node => ({
            ...node,
            children: node.children?.filter(child => child.name.toLowerCase().includes(searchTerm.toLowerCase()))
        })).filter(node => node.children && node.children.length > 0 || node.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : fileTree;


    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden font-sans text-gray-900">
            {/* Context Header */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-900 font-bold text-sm">{selectedRepo?.name || 'Repository'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-mono border border-gray-200">{selectedRepo?.branch || 'main'}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <GitBranch size={10} className="mr-1" />
                            <span>{selectedRepo?.branch || 'main'}</span>
                            <span className="mx-1">•</span>
                            <span className="text-green-600 font-medium">Indexed</span>
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="bg-gray-100/80 p-1 rounded-lg flex space-x-1">
                    <button
                        disabled={!tabsEnabled}
                        onClick={() => tabsEnabled && setActiveTab('code')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'code' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${!tabsEnabled ? 'opacity-50 cursor-not-allowed hover:text-gray-500' : ''}`}
                    >
                        Code
                    </button>
                    <button
                        disabled={!tabsEnabled}
                        onClick={() => tabsEnabled && setActiveTab('explain')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'explain' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${!tabsEnabled ? 'opacity-50 cursor-not-allowed hover:text-gray-500' : ''}`}
                    >
                        Explain
                    </button>
                    <button
                        disabled={!tabsEnabled}
                        onClick={() => tabsEnabled && setActiveTab('deps')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'deps' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${!tabsEnabled ? 'opacity-50 cursor-not-allowed hover:text-gray-500' : ''}`}
                    >
                        Graph
                    </button>
                </div>

                <div className="flex items-center">
                    <Button size="sm" variant="outline" className="hidden sm:flex">
                        <Settings size={16} className="mr-2" /> Repo Settings
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar File Tree */}
                <aside className="w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
                    <div className="p-4 border-b border-gray-200/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {treeLoading && (
                            <div className="text-sm text-gray-500 px-3 py-2">Loading files...</div>
                        )}
                        {treeError && (
                            <div className="text-sm text-red-600 px-3 py-2">{treeError}</div>
                        )}
                        {!treeLoading && !treeError && filteredTree.map(node => (
                            <FileTree
                                key={node.id}
                                node={node}
                                onSelect={handleSelectFile}
                                selectedId={selectedFile?.id}
                            />
                        ))}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden relative bg-white">
                    {activeTab === 'code' && (
                        <CodeViewer file={selectedFile} isLoading={fileLoading} error={fileError} />
                    )}

                    {activeTab === 'explain' && (
                        <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto">
                            {tabsEnabled ? (
                                <div className="max-w-none">
                                    <div className="flex items-center justify-between mb-8">
                                        <h1 className="font-display tracking-tight text-3xl flex items-center">
                                            <span className="bg-primary/10 p-3 rounded-xl mr-4 text-primary"><BookOpen size={28} /></span>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{selectedFile.name}</div>
                                                <div className="text-sm text-gray-500 font-normal mt-1">{selectedFile.filePath}</div>
                                            </div>
                                        </h1>
                                        {!!explanation && !explainMessage && !explainError && !explainLoading && (
                                            <span className="text-xs font-semibold uppercase tracking-wide bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full flex items-center">
                                                <CheckCircle2 size={14} className="mr-1.5" />
                                                AI Generated
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/20 p-8 rounded-2xl border border-indigo-100 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5"><MessageSquare size={150} /></div>
                                        <div className="relative z-10">
                                            <h4 className="font-bold flex items-center gap-2 text-xl text-indigo-900 mb-4">
                                                <Zap size={20} className="text-amber-500" />
                                                AI Explanation
                                            </h4>
                                            {explainLoading && (
                                                <div className="flex items-center space-x-3 text-indigo-800">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                                    <p className="text-base">Analyzing code and generating explanation…</p>
                                                </div>
                                            )}
                                            {explainError && (
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                                    <p className="text-base text-red-700">{explainError}</p>
                                                </div>
                                            )}
                                            {!explainLoading && !explainError && explainMessage && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                    <p className="text-base text-amber-900">{explainMessage}</p>
                                                </div>
                                            )}
                                            {!explainLoading && !explainError && !explainMessage && explanation && (
                                                <div className="prose prose-lg prose-indigo max-w-none">
                                                    <div className="text-base leading-relaxed text-gray-800 space-y-4">
                                                        {explanation.split('\n').map((para, i) => {
                                                            // Parse basic markdown: **bold**, *italic*, `code`
                                                            const formatted = para
                                                                .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
                                                                .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
                                                                .replace(/`(.+?)`/g, '<code class="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded text-sm font-mono">$1</code>');
                                                            return para.trim() ? (
                                                                <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            {!explainLoading && !explainError && !explainMessage && !explanation && (
                                                <p className="text-base text-gray-600">No explanation available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="bg-gray-50 p-6 rounded-full mb-6">
                                        <BookOpen size={48} className="text-gray-300" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">No file selected</p>
                                    <p className="text-gray-500 mt-2">Select a file from the explorer to view a grounded explanation.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'deps' && (
                        <div className="p-10 max-w-6xl mx-auto h-full overflow-y-auto">
                            {tabsEnabled ? (
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                            <span className="bg-primary/10 p-3 rounded-xl mr-3 text-primary"><Network size={24} /></span>
                                            File Analysis
                                        </h2>
                                        <span className="text-xs font-semibold uppercase tracking-wide bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full">
                                            Deterministic
                                        </span>
                                    </div>

                                    {metricsLoading && (
                                        <div className="flex items-center space-x-3 text-gray-500">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                            <div className="text-sm">Loading analysis…</div>
                                        </div>
                                    )}
                                    {metricsError && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{metricsError}</div>
                                    )}
                                    {!metricsLoading && !metricsError && metrics && (
                                        <div className="space-y-8">
                                            {/* Key Metrics */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Total Lines', value: metrics.lines, icon: <FileCode size={20} />, color: 'blue' },
                                                    { label: 'Code Chunks', value: metrics.chunks, icon: <Box size={20} />, color: 'purple' },
                                                    { label: 'Avg Chunk Size', value: `${metrics.avg_chunk_size} tokens`, icon: <Layers size={20} />, color: 'amber' },
                                                ].map((m) => (
                                                    <div key={m.label} className={`bg-gradient-to-br from-${m.color}-50 to-white p-6 rounded-xl border border-${m.color}-100 shadow-sm hover:shadow-md transition-shadow`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className={`text-sm text-${m.color}-600 font-semibold uppercase tracking-wider`}>{m.label}</div>
                                                            <div className={`text-${m.color}-500`}>{m.icon}</div>
                                                        </div>
                                                        <div className="text-3xl font-bold text-gray-900 font-display">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* File Structure Visualization */}
                                            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                                    <TrendingUp size={20} className="mr-2 text-primary" />
                                                    Code Complexity Flow
                                                </h3>
                                                <div className="space-y-4">
                                                    {/* Complexity bar */}
                                                    <div>
                                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                            <span className="font-medium">Lines of Code Distribution</span>
                                                            <span className="text-gray-500">{metrics.lines} total lines</span>
                                                        </div>
                                                        <div className="h-12 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-xl relative overflow-hidden border border-gray-200">
                                                            <div className="absolute inset-0 flex items-center px-4">
                                                                <div className="h-8 bg-gradient-to-r from-green-500 to-amber-500 rounded-lg shadow-lg"
                                                                    style={{ width: `${Math.min(100, (metrics.chunks / (metrics.lines / 100)) * 10)}%` }}>
                                                                </div>
                                                            </div>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-gray-700 drop-shadow">
                                                                    {metrics.chunks} chunks extracted
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Token distribution */}
                                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                            <div className="text-sm text-blue-600 font-medium mb-1">Indexing Coverage</div>
                                                            <div className="text-2xl font-bold text-blue-900">{Math.round((metrics.chunks * metrics.avg_chunk_size) / Math.max(1, metrics.lines))}%</div>
                                                            <div className="text-xs text-blue-600 mt-1">tokens per line ratio</div>
                                                        </div>
                                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                                            <div className="text-sm text-purple-600 font-medium mb-1">Chunk Density</div>
                                                            <div className="text-2xl font-bold text-purple-900">{(metrics.chunks / Math.max(1, metrics.lines / 100)).toFixed(2)}</div>
                                                            <div className="text-xs text-purple-600 mt-1">chunks per 100 lines</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Insights */}
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                                                <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                                                    <Zap size={18} className="mr-2 text-amber-500" />
                                                    Analysis Insights
                                                </h4>
                                                <ul className="space-y-2 text-sm text-indigo-800">
                                                    <li className="flex items-start">
                                                        <CheckCircle2 size={16} className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                                                        <span>This file contains <strong>{metrics.chunks}</strong> semantically meaningful code chunks for RAG retrieval.</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle2 size={16} className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                                                        <span>Average chunk size of <strong>{metrics.avg_chunk_size} tokens</strong> ensures optimal context window usage.</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle2 size={16} className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                                                        <span>Total <strong>{metrics.lines} lines</strong> analyzed and indexed for semantic search.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="bg-gray-50 p-6 rounded-full mb-6">
                                        <Network size={48} className="text-gray-300" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">No file selected</p>
                                    <p className="text-gray-500 mt-2">Select a file to view code analysis and metrics.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};