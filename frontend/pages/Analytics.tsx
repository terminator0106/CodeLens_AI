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
                <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl border border-white/20 shadow-float">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-700 font-medium">Loading analytics...</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
    
    if (!data) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white/90 backdrop-blur-md p-12 rounded-xl border border-white/20 shadow-float text-center">
                    <div className="w-16 h-16 bg-gray-100/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart2 size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No repositories found</h3>
                    <p className="text-gray-600">Add a repository to view analytics and insights.</p>
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
                    <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight animate-fade-in">Analytics & Insights</h1>
                    <p className="text-gray-600 mt-2 text-lg animate-fade-in animation-delay-100">Deterministic observability for an indexed repository.</p>
                </div>
                <div className="flex space-x-3 animate-fade-in animation-delay-200">
                    <select
                        value={selectedRepo?.id || ''}
                        onChange={onRepoChange}
                        className="text-sm bg-white/90 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2.5 text-gray-700 shadow-float hover:shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                    >
                        {repositories.map((r) => (
                            <option key={r.id} value={r.id} className="bg-white text-gray-700">{r.name}</option>
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
                    { label: 'Files', value: data.files, icon: <Activity className="text-blue-500" />, sub: 'Files indexed in this repo', trend: 'neutral', gradient: 'from-blue-50/80 to-blue-100/60' },
                    { label: 'Chunks', value: data.chunks, icon: <BarChart2 className="text-purple-500" />, sub: 'Searchable chunks (DB + optional FAISS)', trend: 'neutral', gradient: 'from-purple-50/80 to-purple-100/60' },
                    { label: 'Avg Chunk Size', value: `${data.avg_chunk_size} tokens`, icon: <TrendingUp className="text-green-500" />, sub: 'Mean chunk token count', trend: 'neutral', gradient: 'from-green-50/80 to-green-100/60' },
                    { label: 'Ingestion Time', value: `${data.ingestion_time_ms} ms`, icon: <Zap className="text-amber-500" />, sub: 'Measured during latest ingestion', trend: 'neutral', gradient: 'from-amber-50/80 to-amber-100/60' },
                ].map((stat, i) => (
                    <div 
                        key={i} 
                        className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-float hover:shadow-glow transition-all duration-300 group hover:scale-105 animate-fade-in`}
                        style={{ animationDelay: `${i * 100 + 300}ms` }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/60 backdrop-blur-md rounded-xl group-hover:bg-white/80 transition-all duration-300 shadow-lift">
                                {stat.icon}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-gray-900 font-display mb-2">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-md p-8 rounded-xl border border-white/20 shadow-float hover:shadow-glow transition-all duration-500 animate-fade-in animation-delay-700">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl mb-2">Language Distribution</h3>
                            <p className="text-sm text-gray-600">Deterministic counts from indexed files.</p>
                        </div>
                        <div className="p-2 bg-gray-100/60 backdrop-blur-md rounded-lg hover:bg-gray-100/80 transition-all duration-300">
                            <Info size={18} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {languageEntries.length === 0 && (
                            <div className="text-sm text-gray-500 p-8 text-center bg-gray-50/60 backdrop-blur-md rounded-lg border border-gray-200/50">
                                No language data available.
                            </div>
                        )}
                        {languageEntries.map(([lang, count], index) => {
                            const percentage = Math.max(2, Math.round((count / maxLang) * 100));
                            const colors = [
                                'from-blue-400 to-blue-600',
                                'from-purple-400 to-purple-600', 
                                'from-green-400 to-green-600',
                                'from-amber-400 to-amber-600',
                                'from-rose-400 to-rose-600',
                                'from-indigo-400 to-indigo-600',
                                'from-cyan-400 to-cyan-600',
                                'from-teal-400 to-teal-600'
                            ];
                            const gradientClass = colors[index % colors.length];
                            
                            return (
                                <div key={lang} className="group">
                                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-3">
                                        <span className="font-mono text-base flex items-center">
                                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradientClass} mr-3 shadow-sm`}></div>
                                            {lang}
                                        </span>
                                        <span className="text-gray-600 font-semibold">{count} files</span>
                                    </div>
                                    <div className="w-full bg-gray-100/60 backdrop-blur-md rounded-full h-3 overflow-hidden shadow-inner">
                                        <div 
                                            className={`bg-gradient-to-r ${gradientClass} h-3 rounded-full transition-all duration-1000 ease-out shadow-sm group-hover:shadow-md`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="space-y-6">
                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl border border-white/20 shadow-float hover:shadow-glow transition-all duration-500 animate-fade-in animation-delay-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-xl">Language Mix</h3>
                            <div className="w-8 h-8 bg-purple-100/60 backdrop-blur-md rounded-lg flex items-center justify-center">
                                <PieChart size={16} className="text-purple-500" />
                            </div>
                        </div>
                        <div className="space-y-5">
                            {languageEntries.length === 0 && (
                                <div className="text-sm text-gray-500 p-4 text-center bg-gray-50/60 backdrop-blur-md rounded-lg border border-gray-200/50">
                                    No language data available.
                                </div>
                            )}
                            {languageEntries.slice(0, 6).map(([lang, count], index) => {
                                const pct = Math.round((count / Math.max(1, data.files)) * 100);
                                const colors = [
                                    'from-blue-400 to-blue-600',
                                    'from-purple-400 to-purple-600', 
                                    'from-green-400 to-green-600',
                                    'from-amber-400 to-amber-600',
                                    'from-rose-400 to-rose-600',
                                    'from-indigo-400 to-indigo-600'
                                ];
                                const gradientClass = colors[index % colors.length];
                                
                                return (
                                    <div key={lang} className="group">
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-2">
                                            <span className="font-mono flex items-center">
                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradientClass} mr-2`}></div>
                                                {lang}
                                            </span>
                                            <span className="text-gray-600 font-semibold">{pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100/60 backdrop-blur-md rounded-full h-2 overflow-hidden shadow-inner">
                                            <div 
                                                className={`bg-gradient-to-r ${gradientClass} h-2 rounded-full transition-all duration-1000 ease-out`} 
                                                style={{ width: `${Math.max(2, pct)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl border border-white/20 shadow-float hover:shadow-glow transition-all duration-500 animate-fade-in animation-delay-900">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-xl">Ingestion Details</h3>
                            <div className="w-8 h-8 bg-green-100/60 backdrop-blur-md rounded-lg flex items-center justify-center">
                                <HardDrive size={16} className="text-green-500" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50/60 to-blue-100/40 backdrop-blur-md rounded-lg border border-blue-200/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Ingestion time</span>
                                    <span className="font-mono font-semibold text-blue-600">{data.ingestion_time_ms} ms</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-purple-50/60 to-purple-100/40 backdrop-blur-md rounded-lg border border-purple-200/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Avg chunk size</span>
                                    <span className="font-mono font-semibold text-purple-600">{data.avg_chunk_size} tokens</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-green-50/60 to-green-100/40 backdrop-blur-md rounded-lg border border-green-200/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Total chunks</span>
                                    <span className="font-mono font-semibold text-green-600">{data.chunks}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};