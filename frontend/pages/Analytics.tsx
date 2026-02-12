import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { PieChart, BarChart2, TrendingUp, HardDrive, Download, Calendar, Info, Zap, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useRepoStore } from '../store';

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

    if (loading) return <DashboardLayout>Loading...</DashboardLayout>;
    if (!data) return <DashboardLayout>No repositories found.</DashboardLayout>;

    const languageEntries = Object.entries(data.languages || {}).sort((a, b) => b[1] - a[1]);
    const maxLang = languageEntries[0]?.[1] || 1;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight">Analytics & Insights</h1>
                    <p className="text-gray-500 mt-2 text-lg">Deterministic observability for an indexed repository.</p>
                </div>
                <div className="flex space-x-3">
                    <select
                        value={selectedRepo?.id || ''}
                        onChange={onRepoChange}
                        className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
                    >
                        {repositories.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <Button variant="secondary" size="sm">
                        <Download size={16} className="mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Files', value: data.files, icon: <Activity className="text-blue-500" />, sub: 'Files indexed in this repo', trend: 'neutral' },
                    { label: 'Chunks', value: data.chunks, icon: <BarChart2 className="text-purple-500" />, sub: 'Searchable chunks (DB + optional FAISS)', trend: 'neutral' },
                    { label: 'Avg Chunk Size', value: `${data.avg_chunk_size} tokens`, icon: <TrendingUp className="text-green-500" />, sub: 'Mean chunk token count', trend: 'neutral' },
                    { label: 'Ingestion Time', value: `${data.ingestion_time_ms} ms`, icon: <Zap className="text-amber-500" />, sub: 'Measured during latest ingestion', trend: 'neutral' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">{stat.icon}</div>
                        </div>
                        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-gray-900 font-display">{stat.value}</h3>
                        <p className="text-sm text-gray-400 mt-2">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Language Distribution (Files)</h3>
                            <p className="text-sm text-gray-500">Deterministic counts from indexed files.</p>
                        </div>
                        <Info size={18} className="text-gray-300 hover:text-gray-500 cursor-pointer" />
                    </div>

                    <div className="space-y-4">
                        {languageEntries.length === 0 && (
                            <div className="text-sm text-gray-500">No language data available.</div>
                        )}
                        {languageEntries.map(([lang, count]) => (
                            <div key={lang}>
                                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                    <span className="font-mono">{lang}</span>
                                    <span>{count}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.max(2, Math.round((count / maxLang) * 100))}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Language Mix</h3>
                        </div>
                        <div className="space-y-4">
                            {languageEntries.length === 0 && (
                                <div className="text-sm text-gray-500">No language data available.</div>
                            )}
                            {languageEntries.slice(0, 6).map(([lang, count]) => {
                                const pct = Math.round((count / Math.max(1, data.files)) * 100);
                                return (
                                    <div key={lang}>
                                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                            <span className="font-mono">{lang}</span>
                                            <span>{pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.max(2, pct)}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Ingestion</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between"><span>Ingestion time</span><span className="font-mono">{data.ingestion_time_ms} ms</span></div>
                            <div className="flex justify-between"><span>Avg chunk size</span><span className="font-mono">{data.avg_chunk_size} tokens</span></div>
                            <div className="flex justify-between"><span>Total chunks</span><span className="font-mono">{data.chunks}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};