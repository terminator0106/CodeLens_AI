import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { PieChart, BarChart2, TrendingUp, HardDrive, Download, Calendar, Info, Zap, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useRepoStore } from '../store';
import { GridOverlay } from '../components/ui/grid-feature-cards';

export const Analytics: React.FC = () => {
    const { repositories, setRepositories, selectedRepo, selectRepo } = useRepoStore();
    const [data, setData] = useState<{
        files: number;
        chunks: number;
        languages: Record<string, number>;
        avg_chunk_size: number;
        ingestion_time_ms: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const repos = repositories.length ? repositories : await api.fetchRepos();
                if (repositories.length === 0) {
                    setRepositories(repos);
                }
                const active = selectedRepo || repos[0] || null;
                if (active && !selectedRepo) {
                    selectRepo(active);
                }
                if (active) {
                    const analytics = await api.fetchRepoAnalytics(active.id);
                    setData(analytics);
                } else {
                    setData(null);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!selectedRepo) return;
            setLoading(true);
            try {
                const analytics = await api.fetchRepoAnalytics(selectedRepo.id);
                setData(analytics);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedRepo?.id]);

    const onRepoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const repoId = e.target.value;
        const repo = repositories.find((r) => r.id === repoId) || null;
        selectRepo(repo);
    };

    const exportToCSV = () => {
        if (!selectedRepo || !data) return;

        // Prepare CSV data
        const csvData = [
            ['Metric', 'Value'],
            ['Repository Name', selectedRepo.name],
            ['Repository ID', selectedRepo.id],
            ['Total Files', data.files],
            ['Total Chunks', data.chunks],
            ['Average Chunk Size (tokens)', data.avg_chunk_size],
            ['Ingestion Time (ms)', data.ingestion_time_ms],
            ['Languages', ''],
            ...Object.entries(data.languages || {}).map(([lang, count]) => [`  ${lang}`, count])
        ];

        // Convert to CSV string
        const csvString = csvData.map(row =>
            row.map(field => `"${field}"`).join(',')
        ).join('\n');

        // Create and download file
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedRepo.name}-analytics.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-card/90 backdrop-blur-md p-8 rounded-xl border border-border shadow-float">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-foreground font-medium">Loading analytics...</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

    if (!data) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-card/90 backdrop-blur-md p-12 rounded-xl border border-border shadow-float text-center">
                    <div className="w-16 h-16 bg-secondary/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart2 size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No repositories found</h3>
                    <p className="text-muted-foreground">Add a repository to view analytics and insights.</p>
                </div>
            </div>
        </DashboardLayout>
    );

    const languageEntries = Object.entries(data.languages || {}).sort((a, b) => b[1] - a[1]);
    const maxLang = languageEntries[0]?.[1] || 1;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-display tracking-tight animate-fade-in">Analytics & Insights</h1>
                    <p className="text-muted-foreground mt-2 text-lg animate-fade-in animation-delay-100">Deterministic observability for an indexed repository.</p>
                </div>
                <div className="flex space-x-3 animate-fade-in animation-delay-200">
                    <select
                        value={selectedRepo?.id || ''}
                        onChange={onRepoChange}
                        className="text-sm bg-black/60 backdrop-blur-md border border-border rounded-lg px-4 py-2.5 text-foreground shadow-float hover:shadow-chart transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                    >
                        {repositories.map((r) => (
                            <option key={r.id} value={r.id} className="bg-black text-muted-foreground">
                                {r.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={exportToCSV}
                        disabled={!selectedRepo || !data}
                        className={`${!selectedRepo || !data ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} transition-transform duration-200`}
                    >
                        <Download size={16} className="mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Files', value: data.files, icon: <Activity className="text-primary" />, sub: 'Files indexed in this repo', trend: 'neutral' },
                    { label: 'Chunks', value: data.chunks, icon: <BarChart2 className="text-primary" />, sub: 'Searchable chunks (DB + optional FAISS)', trend: 'neutral' },
                    { label: 'Avg Chunk Size', value: `${data.avg_chunk_size} tokens`, icon: <TrendingUp className="text-primary" />, sub: 'Mean chunk token count', trend: 'neutral' },
                    { label: 'Ingestion Time', value: `${data.ingestion_time_ms} ms`, icon: <Zap className="text-primary" />, sub: 'Measured during latest ingestion', trend: 'neutral' },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`relative overflow-hidden bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-border shadow-float ai-card hover:shadow-glow transition-all duration-300 group hover:scale-105 animate-fade-in`}
                        style={{ animationDelay: `${i * 100 + 300}ms` }}
                    >
                        <GridOverlay />
                        <div className="relative z-10 flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-all duration-300">
                                {stat.icon}
                            </div>
                        </div>
                        <p className="relative z-10 text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="relative z-10 text-3xl font-bold text-foreground font-display mb-2">{stat.value}</h3>
                        <p className="relative z-10 text-sm text-muted-foreground">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 relative overflow-hidden bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-border shadow-float ai-card hover:shadow-glow transition-all duration-500 animate-fade-in animation-delay-700">
                    <GridOverlay />
                    <div className="relative z-10 flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-foreground text-xl mb-2">Language Distribution</h3>
                            <p className="text-sm text-muted-foreground">Deterministic counts from indexed files.</p>
                        </div>
                        <div className="p-2 bg-secondary/40 rounded-lg hover:bg-secondary/60 transition-all duration-300">
                            <Info size={18} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <div className="relative z-10 space-y-6">
                        {languageEntries.length === 0 && (
                            <div className="text-sm text-muted-foreground p-8 text-center bg-secondary/20 rounded-lg border border-border">
                                No language data available.
                            </div>
                        )}
                        {languageEntries.map(([lang, count]) => {
                            const percentage = Math.max(2, Math.round((count / maxLang) * 100));
                            return (
                                <div key={lang} className="group">
                                    <div className="flex justify-between items-center text-sm font-medium text-foreground mb-3">
                                        <span className="font-mono text-base flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-muted-foreground mr-3 shadow-sm"></div>
                                            {lang}
                                        </span>
                                        <span className="text-muted-foreground font-semibold">{count} files</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 ease-out shadow-sm group-hover:shadow-md"
                                            style={{ width: `${Math.max(8, percentage)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="space-y-6">
                    <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-border shadow-float ai-card hover:shadow-glow transition-all duration-500 animate-fade-in animation-delay-800">
                        <GridOverlay />
                        <div className="relative z-10 flex justify-between items-center mb-6">
                            <h3 className="font-bold text-foreground text-xl">Language Mix</h3>
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <PieChart size={16} className="text-primary" />
                            </div>
                        </div>
                        <div className="relative z-10 space-y-5">
                            {languageEntries.length === 0 && (
                                <div className="text-sm text-muted-foreground p-4 text-center bg-secondary/20 rounded-lg border border-border">
                                    No language data available.
                                </div>
                            )}
                            {languageEntries.slice(0, 6).map(([lang, count]) => {
                                const pct = Math.round((count / Math.max(1, data.files)) * 100);

                                return (
                                    <div key={lang} className="group">
                                        <div className="flex justify-between items-center text-sm font-medium text-foreground mb-2">
                                            <span className="font-mono flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></div>
                                                {lang}
                                            </span>
                                            <span className="text-muted-foreground font-semibold">{pct}%</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.max(8, Math.max(2, pct))}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-border shadow-float ai-card hover:shadow-glow transition-all duration-500 animate-fade-in animation-delay-900">
                        <GridOverlay />
                        <div className="relative z-10 flex justify-between items-center mb-6">
                            <h3 className="font-bold text-foreground text-xl">Ingestion Details</h3>
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <HardDrive size={16} className="text-primary" />
                            </div>
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-foreground font-medium">Ingestion time</span>
                                    <span className="font-mono font-semibold text-primary">{data.ingestion_time_ms} ms</span>
                                </div>
                            </div>
                            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-foreground font-medium">Avg chunk size</span>
                                    <span className="font-mono font-semibold text-accent">{data.avg_chunk_size} tokens</span>
                                </div>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-foreground font-medium">Total chunks</span>
                                    <span className="font-mono font-semibold text-primary">{data.chunks}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};