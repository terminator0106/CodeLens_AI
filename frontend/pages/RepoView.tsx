import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileTree } from '../components/repo/FileTree';
import { CodeViewer } from '../components/repo/CodeViewer';
import { useRepoStore, useUIStore } from '../store';
import { api } from '../services/api';
import { ChevronRight, ArrowLeft, MessageSquare, Box, Layers, BookOpen, Settings, Search, GitBranch, CheckCircle2, Zap, TrendingUp, Network, FileCode } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FileNode } from '../types';
import { SyntaxText } from '../components/ui/SyntaxText';

export const RepoView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { fileTree, setFileTree, selectedFile, selectFile, repositories, setRepositories, selectRepo, selectedRepo, removeRepository } = useRepoStore();
    const navigate = useNavigate();
    const explainLevel = useUIStore((s) => s.explainLevel);
    const setExplainLevel = useUIStore((s) => s.setExplainLevel);
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

    const [symbolFocus, setSymbolFocus] = useState<{ function_name: string; start_line: number; end_line: number } | null>(null);
    const [whyLoading, setWhyLoading] = useState(false);
    const [whyError, setWhyError] = useState('');
    const [whyText, setWhyText] = useState('');

    const [riskLoading, setRiskLoading] = useState(false);
    const [riskError, setRiskError] = useState('');
    const [risk, setRisk] = useState<{ security: string[]; performance: string[]; maintainability: string[]; notes?: { security?: string; performance?: string; maintainability?: string } } | null>(null);

    const [metricsLoading, setMetricsLoading] = useState(false);
    const [metricsError, setMetricsError] = useState('');
    const [metrics, setMetrics] = useState<{ lines: number; chunks: number; avg_chunk_size: number } | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsError, setSettingsError] = useState('');
    const [repoAnalytics, setRepoAnalytics] = useState<{
        files: number;
        chunks: number;
        languages: Record<string, number>;
        avg_chunk_size: number;
        ingestion_time_ms: number;
    } | null>(null);
    const [reingesting, setReingesting] = useState(false);
    const [deleting, setDeleting] = useState(false);

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
        setSymbolFocus(null);
        setWhyError('');
        setWhyText('');
        setRiskError('');
        setRisk(null);
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
                const res = symbolFocus
                    ? await api.explainSymbol(id, selectedFile.fileId, {
                        function_name: symbolFocus.function_name,
                        start_line: symbolFocus.start_line,
                        end_line: symbolFocus.end_line,
                        level: explainLevel,
                    })
                    : await api.explainFile(id, selectedFile.fileId, { level: explainLevel });
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
    }, [activeTab, tabsEnabled, id, selectedFile?.fileId, symbolFocus, explainLevel]);

    useEffect(() => {
        const run = async () => {
            if (!tabsEnabled || !id || !selectedFile?.fileId) return;
            if (activeTab !== 'deps') return;

            setRiskLoading(true);
            setRiskError('');
            try {
                const res = await api.fetchRiskRadar(id, selectedFile.fileId);
                setRisk(res);
            } catch (err) {
                setRiskError((err as Error).message || 'Unable to load risk radar.');
            } finally {
                setRiskLoading(false);
            }
        };
        run();
    }, [activeTab, id, tabsEnabled, selectedFile?.fileId]);

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

    const handleAskSymbol = (payload: { function_name: string; start_line: number; end_line: number }) => {
        setSymbolFocus(payload);
        setActiveTab('explain');
    };

    const handleWhyWritten = async () => {
        if (!id || !selectedFile?.fileId) return;

        setWhyLoading(true);
        setWhyError('');
        setWhyText('');
        try {
            const res = await api.whyWritten(id, selectedFile.fileId, {
                function_name: symbolFocus?.function_name,
                start_line: symbolFocus?.start_line,
                end_line: symbolFocus?.end_line,
                level: explainLevel,
            });
            if (res.message) {
                setWhyError(res.message);
            } else {
                setWhyText(res.explanation || '');
            }
        } catch (err) {
            setWhyError((err as Error).message || 'Unable to generate rationale.');
        } finally {
            setWhyLoading(false);
        }
    };

    const openSettings = async () => {
        if (!id || !selectedRepo) return;
        setIsSettingsOpen(true);
        if (repoAnalytics || settingsLoading) return;
        setSettingsLoading(true);
        setSettingsError('');
        try {
            const analytics = await api.fetchRepoAnalytics(id);
            setRepoAnalytics(analytics);
        } catch (error) {
            setSettingsError((error as Error).message || 'Unable to load repository analytics.');
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleReingest = async () => {
        if (!id || !selectedRepo) return;
        setReingesting(true);
        try {
            api.clearExplainCache(id);
            await api.reingestRepo(id, selectedRepo.branch || 'main');
            alert('Re-ingestion started. This may take a few minutes.');
        } catch (error) {
            console.error('Failed to re-ingest repository:', error);
            alert((error as Error).message || 'Failed to re-ingest repository');
        } finally {
            setReingesting(false);
        }
    };

    const handleDeleteRepo = async () => {
        if (!id) return;
        setDeleting(true);
        try {
            api.clearExplainCache(id);
            await api.deleteRepo(id);
            removeRepository(id);
            setIsSettingsOpen(false);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete repository:', error);
            alert((error as Error).message || 'Failed to delete repository');
        } finally {
            setDeleting(false);
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
        <div className="h-screen bg-background flex flex-col overflow-hidden font-sans text-foreground">
            {/* Context Header */}
            <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-card">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="p-2 hover:bg-secondary/40 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <span className="text-foreground font-bold text-sm">{selectedRepo?.name || 'Repository'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-secondary/40 text-muted-foreground text-xs font-mono border border-border">{selectedRepo?.branch || 'main'}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <GitBranch size={10} className="mr-1" />
                            <span>{selectedRepo?.branch || 'main'}</span>
                            <span className="mx-1">•</span>
                            <span className="text-accent font-medium">Indexed</span>
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="bg-secondary/30 p-1 rounded-lg flex space-x-1">
                    <button
                        disabled={!tabsEnabled}
                        onClick={() => tabsEnabled && setActiveTab('code')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'code' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'} ${!tabsEnabled ? 'opacity-50 cursor-not-allowed hover:text-muted-foreground' : ''}`}
                    >
                        Code
                    </button>
                    <button
                        disabled={!tabsEnabled}
                        onClick={() => tabsEnabled && setActiveTab('explain')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'explain' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'} ${!tabsEnabled ? 'opacity-50 cursor-not-allowed hover:text-muted-foreground' : ''}`}
                    >
                        Explain
                    </button>
                    <button
                        disabled={!tabsEnabled}
                        onClick={() => tabsEnabled && setActiveTab('deps')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'deps' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'} ${!tabsEnabled ? 'opacity-50 cursor-not-allowed hover:text-muted-foreground' : ''}`}
                    >
                        Graph
                    </button>
                </div>

                <div className="flex items-center">
                    <Button
                        size="sm"
                        variant="outline"
                        className="hidden sm:flex"
                        onClick={openSettings}
                        disabled={!selectedRepo}
                    >
                        <Settings size={16} className="mr-2" /> Repo Settings
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar File Tree */}
                <aside className="w-80 bg-secondary/20 border-r border-border flex-shrink-0 flex flex-col">
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {treeLoading && (
                            <div className="text-sm text-muted-foreground px-3 py-2">Loading files...</div>
                        )}
                        {treeError && (
                            <div className="text-sm text-red-500 px-3 py-2">{treeError}</div>
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
                <main className="flex-1 overflow-hidden relative bg-background">
                    {activeTab === 'code' && (
                        <CodeViewer file={selectedFile} isLoading={fileLoading} error={fileError} onAskSymbol={handleAskSymbol} />
                    )}

                    {activeTab === 'explain' && (
                        <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto">
                            {tabsEnabled ? (
                                <div className="max-w-none">
                                    <div className="flex items-center justify-between mb-8">
                                        <h1 className="font-display tracking-tight text-3xl flex items-center">
                                            <span className="bg-primary/10 p-3 rounded-xl mr-4 text-primary"><BookOpen size={28} /></span>
                                            <div>
                                                <div className="text-2xl font-bold text-foreground">{selectedFile.name}</div>
                                                <div className="text-sm text-muted-foreground font-normal mt-1">{selectedFile.filePath}</div>
                                                {symbolFocus && (
                                                    <div className="text-xs text-muted-foreground font-normal mt-1">
                                                        Scope: <span className="text-foreground font-medium">{symbolFocus.function_name}</span> (lines {symbolFocus.start_line}-{symbolFocus.end_line})
                                                        <button
                                                            type="button"
                                                            className="ml-2 inline-flex items-center rounded-md border border-border/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/90 hover:text-foreground hover:bg-secondary/40 transition-colors"
                                                            onClick={() => setSymbolFocus(null)}
                                                        >
                                                            clear
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </h1>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-secondary/30 p-1 rounded-lg flex space-x-1">
                                                {(['beginner', 'intermediate', 'expert'] as const).map((lvl) => (
                                                    <button
                                                        key={lvl}
                                                        type="button"
                                                        onClick={() => setExplainLevel(lvl)}
                                                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${explainLevel === lvl
                                                            ? 'bg-primary/20 text-primary shadow-sm underline underline-offset-4 decoration-2 decoration-primary'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleWhyWritten}
                                                disabled={explainLoading || whyLoading}
                                            >
                                                {whyLoading ? 'Thinking…' : 'Why written this way?'}
                                            </Button>
                                            {/* {!!explanation && !explainMessage && !explainError && !explainLoading && (
                                                <span className="text-xs font-semibold uppercase tracking-wide bg-accent/20 border border-accent text-accent px-3 py-1.5 rounded-full flex items-center">
                                                    <CheckCircle2 size={14} className="mr-1.5" />
                                                    AI Generated
                                                </span>
                                            )} */}
                                        </div>
                                    </div>
                                    <div className="bg-primary/10 p-8 rounded-2xl border border-primary/20 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5"><MessageSquare size={150} /></div>
                                        <div className="relative z-10">
                                            <h4 className="font-bold flex items-center gap-2 text-xl text-foreground mb-4">
                                                <Zap size={20} className="text-accent" />
                                                AI Explanation
                                            </h4>
                                            {explainLoading && (
                                                <div className="flex items-center space-x-3 text-foreground">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                                    <p className="text-base">Analyzing code and generating explanation…</p>
                                                </div>
                                            )}
                                            {explainError && (
                                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                                    <p className="text-base text-red-400">{explainError}</p>
                                                </div>
                                            )}
                                            {!explainLoading && !explainError && explainMessage && (
                                                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                                                    <p className="text-base text-foreground">{explainMessage}</p>
                                                </div>
                                            )}
                                            {!explainLoading && !explainError && !explainMessage && explanation && (
                                                <div className="prose prose-lg prose-invert max-w-none">
                                                    <div className="text-base leading-relaxed text-foreground">
                                                        <SyntaxText text={explanation} />
                                                    </div>
                                                </div>
                                            )}
                                            {!explainLoading && !explainError && !explainMessage && !explanation && (
                                                <p className="text-base text-muted-foreground">No explanation available.</p>
                                            )}
                                        </div>
                                    </div>

                                    {(whyText || whyError) && (
                                        <div className="mt-6 bg-card p-6 rounded-2xl border border-border shadow-card">
                                            <div className="text-sm font-bold text-foreground mb-2">Why this is written this way</div>
                                            {whyError && (
                                                <div className="text-sm text-red-400">{whyError}</div>
                                            )}
                                            {whyText && (
                                                <div className="text-sm text-foreground leading-relaxed">{whyText}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <div className="bg-secondary/40 p-6 rounded-full mb-6">
                                        <BookOpen size={48} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-xl font-bold text-foreground">No file selected</p>
                                    <p className="text-muted-foreground mt-2">Select a file from the explorer to view a grounded explanation.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'deps' && (
                        <div className="p-10 max-w-6xl mx-auto h-full overflow-y-auto">
                            {tabsEnabled ? (
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold text-foreground flex items-center">
                                            <span className="bg-primary/10 p-3 rounded-xl mr-3 text-primary"><Network size={24} /></span>
                                            File Analysis
                                        </h2>
                                        <span className="text-xs font-semibold uppercase tracking-wide bg-secondary/40 border border-border text-foreground px-3 py-1.5 rounded-full">
                                            AI-assisted
                                        </span>
                                    </div>

                                    <div className="bg-card p-6 rounded-2xl border border-border shadow-float mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-lg font-bold text-foreground">Risk Radar</div>
                                            <span className="text-xs font-semibold uppercase tracking-wide bg-secondary/40 border border-border text-foreground px-3 py-1.5 rounded-full">AI-assisted</span>
                                        </div>
                                        {riskLoading && <div className="text-sm text-muted-foreground">Scanning…</div>}
                                        {riskError && !riskLoading && <div className="text-sm text-red-400">{riskError}</div>}
                                        {!riskLoading && !riskError && risk && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-cols-fr">
                                                {([
                                                    { title: 'Security', key: 'security', items: risk.security },
                                                    { title: 'Performance', key: 'performance', items: risk.performance },
                                                    { title: 'Maintainability', key: 'maintainability', items: risk.maintainability },
                                                ] as const).map((col) => (
                                                    <div key={col.title} className="bg-secondary/20 border border-border rounded-xl p-4 min-w-0">
                                                        <div className="text-sm font-bold text-foreground mb-2">{col.title}</div>
                                                        {col.items.length === 0 ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                {risk.notes?.[col.key] || 'Looks good — no obvious signals found in this file.'}
                                                            </div>
                                                        ) : (
                                                            <ul className="space-y-2 text-xs text-foreground">
                                                                {col.items.map((x) => (
                                                                    <li key={x} className="flex items-start gap-2 leading-relaxed">
                                                                        <span className="text-foreground mt-0.5 flex-shrink-0">•</span>
                                                                        <span className="break-words min-w-0 flex-1">{x}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {metricsLoading && (
                                        <div className="flex items-center space-x-3 text-muted-foreground">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                            <div className="text-sm">Loading analysis…</div>
                                        </div>
                                    )}
                                    {metricsError && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">{metricsError}</div>
                                    )}
                                    {!metricsLoading && !metricsError && metrics && (
                                        <div className="space-y-8">
                                            {/* Key Metrics */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Total Lines', value: metrics.lines, icon: <FileCode size={20} />, color: 'primary' },
                                                    { label: 'Code Chunks', value: metrics.chunks, icon: <Box size={20} />, color: 'primary' },
                                                    { label: 'Avg Chunk Size', value: `${metrics.avg_chunk_size} tokens`, icon: <Layers size={20} />, color: 'primary' },
                                                ].map((m) => (
                                                    <div key={m.label} className={`bg-card p-6 rounded-xl border border-border shadow-float ai-card hover:shadow-glow transition-all`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className={`text-sm text-muted-foreground font-semibold uppercase tracking-wider`}>{m.label}</div>
                                                            <div className={`text-primary`}>{m.icon}</div>
                                                        </div>
                                                        <div className="text-3xl font-bold text-foreground font-display">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* File Structure Visualization */}
                                            <div className="bg-card p-8 rounded-2xl border border-border shadow-float ai-card">
                                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                                                    <TrendingUp size={20} className="mr-2 text-primary" />
                                                    Code Complexity Flow
                                                </h3>
                                                <div className="space-y-4">
                                                    {/* Complexity bar */}
                                                    <div>
                                                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                            <span className="font-medium">Lines of Code Distribution</span>
                                                            <span className="text-muted-foreground">{metrics.lines} total lines</span>
                                                        </div>
                                                        <div className="h-12 bg-secondary/30 rounded-xl relative overflow-hidden border border-border">
                                                            <div className="absolute inset-0 flex items-center px-4">
                                                                <div className="h-8 bg-gradient-to-r from-accent/50 to-primary rounded-lg shadow-lg"
                                                                    style={{ width: `${Math.min(100, (metrics.chunks / (metrics.lines / 100)) * 10)}%` }}>
                                                                </div>
                                                            </div>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-foreground drop-shadow">
                                                                    {metrics.chunks} chunks extracted
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Token distribution */}
                                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                                        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                                                            <div className="text-sm text-primary font-medium mb-1">Indexing Coverage</div>
                                                            <div className="text-2xl font-bold text-foreground">{Math.round((metrics.chunks * metrics.avg_chunk_size) / Math.max(1, metrics.lines))}%</div>
                                                            <div className="text-xs text-muted-foreground mt-1">tokens per line ratio</div>
                                                        </div>
                                                        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                                                            <div className="text-sm text-primary font-medium mb-1">Chunk Density</div>
                                                            <div className="text-2xl font-bold text-foreground">{(metrics.chunks / Math.max(1, metrics.lines / 100)).toFixed(2)}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">chunks per 100 lines</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Insights */}
                                            <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                                                <h4 className="font-bold text-foreground mb-3 flex items-center">
                                                    <Zap size={18} className="mr-2 text-accent" />
                                                    Analysis Insights
                                                </h4>
                                                <ul className="space-y-2 text-sm text-foreground">
                                                    <li className="flex items-start">
                                                        <CheckCircle2 size={16} className="mr-2 mt-0.5 text-accent flex-shrink-0" />
                                                        <span>This file contains <strong>{metrics.chunks}</strong> semantically meaningful code chunks for RAG retrieval.</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle2 size={16} className="mr-2 mt-0.5 text-accent flex-shrink-0" />
                                                        <span>Average chunk size of <strong>{metrics.avg_chunk_size} tokens</strong> ensures optimal context window usage.</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle2 size={16} className="mr-2 mt-0.5 text-accent flex-shrink-0" />
                                                        <span>Total <strong>{metrics.lines} lines</strong> analyzed and indexed for semantic search.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <div className="bg-secondary/40 p-6 rounded-full mb-6">
                                        <Network size={48} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-xl font-bold text-foreground">No file selected</p>
                                    <p className="text-muted-foreground mt-2">Select a file to view code analysis and metrics.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <Modal
                isOpen={isSettingsOpen}
                onClose={() => !deleting && !reingesting && setIsSettingsOpen(false)}
                title="Repository Settings"
                footer={
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            variant="secondary"
                            onClick={() => setIsSettingsOpen(false)}
                            disabled={deleting || reingesting}
                            className="w-full sm:w-auto"
                        >
                            Close
                        </Button>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
                            <Button
                                onClick={handleReingest}
                                disabled={reingesting || deleting || !selectedRepo}
                                isLoading={reingesting}
                                className="w-full sm:w-auto"
                            >
                                Re-run Ingestion
                            </Button>
                            <Button
                                onClick={handleDeleteRepo}
                                disabled={deleting}
                                isLoading={deleting}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete Repository
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    {selectedRepo && (
                        <div className="bg-secondary/30 border border-border rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Repository Metadata</h3>
                            <p className="text-sm text-foreground"><span className="font-medium">Name:</span> {selectedRepo.name}</p>
                            <p className="text-sm text-foreground break-all"><span className="font-medium">URL:</span> {selectedRepo.url}</p>
                            <p className="text-sm text-foreground"><span className="font-medium">Branch:</span> {selectedRepo.branch}</p>
                            <p className="text-sm text-foreground"><span className="font-medium">Status:</span> {selectedRepo.status}</p>
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-2">Ingestion Summary</h3>
                        {settingsLoading && <p className="text-sm text-muted-foreground">Loading analytics…</p>}
                        {settingsError && !settingsLoading && (
                            <p className="text-sm text-red-400">{settingsError}</p>
                        )}
                        {repoAnalytics && !settingsLoading && !settingsError && (
                            <div className="space-y-1 text-sm text-foreground">
                                <p><span className="font-medium">Files:</span> {repoAnalytics.files}</p>
                                <p><span className="font-medium">Chunks:</span> {repoAnalytics.chunks}</p>
                                <p><span className="font-medium">Avg chunk size:</span> {repoAnalytics.avg_chunk_size} tokens</p>
                                <p><span className="font-medium">Ingestion time:</span> {repoAnalytics.ingestion_time_ms} ms</p>
                            </div>
                        )}
                        {!settingsLoading && !settingsError && !repoAnalytics && (
                            <p className="text-sm text-muted-foreground">No ingestion analytics found for this repository yet.</p>
                        )}
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h3>
                        <p className="text-sm text-red-400/80">
                            Deleting this repository will permanently remove indexed files, code chunks, vector embeddings,
                            chat history, and analytics. This action cannot be undone.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};