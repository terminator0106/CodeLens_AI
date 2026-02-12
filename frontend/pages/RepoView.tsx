import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileTree } from '../components/repo/FileTree';
import { CodeViewer } from '../components/repo/CodeViewer';
import { useRepoStore } from '../store';
import { api } from '../services/api';
import { ChevronRight, ArrowLeft, MessageSquare, Box, Layers, BookOpen, Settings, Search, GitBranch } from 'lucide-react';
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
                        <div className="p-10 max-w-3xl mx-auto h-full overflow-y-auto">
                            {tabsEnabled ? (
                                <div className="prose prose-lg prose-indigo max-w-none">
                                    <h1 className="font-display tracking-tight text-3xl mb-6 flex items-center">
                                        <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary"><BookOpen size={24} /></span>
                                        {selectedFile.name}
                                    </h1>
                                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-indigo-900 mb-6 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><MessageSquare size={100} /></div>
                                        <div className="flex items-center justify-between gap-4 relative z-10">
                                            <h4 className="font-bold flex items-center gap-2 text-lg">Explanation</h4>
                                            {!!explanation && !explainMessage && !explainError && !explainLoading && (
                                                <span className="text-xs font-semibold uppercase tracking-wide bg-white/70 border border-indigo-100 text-indigo-900 px-2 py-1 rounded-full">
                                                    Generated from indexed code
                                                </span>
                                            )}
                                        </div>
                                        {explainLoading && (
                                            <p className="text-base leading-relaxed text-indigo-800/80 relative z-10 mt-3">Generating explanation…</p>
                                        )}
                                        {explainError && (
                                            <p className="text-base leading-relaxed text-red-700 relative z-10 mt-3">{explainError}</p>
                                        )}
                                        {!explainLoading && !explainError && explainMessage && (
                                            <p className="text-base leading-relaxed text-indigo-800/80 relative z-10 mt-3">{explainMessage}</p>
                                        )}
                                        {!explainLoading && !explainError && !explainMessage && (
                                            <p className="text-base leading-relaxed text-indigo-800/80 relative z-10 mt-3 whitespace-pre-wrap">{explanation || 'No explanation returned.'}</p>
                                        )}
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
                        <div className="p-10 max-w-3xl mx-auto h-full overflow-y-auto">
                            {tabsEnabled ? (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary"><Layers size={20} /></span>
                                            File Metrics
                                        </h2>
                                        <span className="text-xs font-semibold uppercase tracking-wide bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                            Deterministic
                                        </span>
                                    </div>

                                    {metricsLoading && <div className="text-sm text-gray-500">Loading metrics…</div>}
                                    {metricsError && <div className="text-sm text-red-600">{metricsError}</div>}
                                    {!metricsLoading && !metricsError && metrics && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Lines', value: metrics.lines },
                                                { label: 'Chunks', value: metrics.chunks },
                                                { label: 'Avg Chunk Size (tokens)', value: metrics.avg_chunk_size },
                                            ].map((m) => (
                                                <div key={m.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                                    <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{m.label}</div>
                                                    <div className="text-3xl font-bold text-gray-900 mt-2 font-display">{m.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="bg-gray-50 p-6 rounded-full mb-6">
                                        <Layers size={48} className="text-gray-300" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">No file selected</p>
                                    <p className="text-gray-500 mt-2">Select a file to view deterministic metrics.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};