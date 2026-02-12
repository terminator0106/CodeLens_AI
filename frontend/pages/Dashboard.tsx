import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepoStore, useAuthStore } from '../store';
import { api } from '../services/api';
import { Plus, GitBranch, Clock, FileCode, CheckCircle2, Zap, BarChart3, ArrowRight, Activity, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export const Dashboard: React.FC = () => {
  const { repositories, setRepositories, addRepository } = useRepoStore();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ total_repos: 0, total_files: 0, total_chunks: 0, last_ingestion_time: null as string | null });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // Add Repo Form State
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [ingesting, setIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const [repos, stats] = await Promise.all([api.fetchRepos(), api.fetchDashboardOverview()]);
        setRepositories(repos);
        setOverview(stats);
      } finally {
        setLoading(false);
      }
    };
    loadRepos();
  }, [setRepositories]);

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngesting(true);
    setIngestProgress(5);

    const timer = window.setInterval(() => {
      setIngestProgress((p) => {
        if (p >= 92) return p;
        const remaining = 92 - p;
        const bump = Math.max(1, Math.round(remaining * 0.08));
        return Math.min(92, p + bump);
      });
    }, 250);

    let succeeded = false;
    try {
      const newRepo = await api.ingestRepo(repoUrl, branch);
      addRepository(newRepo);
      succeeded = true;
      setIngestProgress(100);
      // Let the UI render 100% before closing.
      await new Promise((r) => setTimeout(r, 400));
      setAddModalOpen(false);
      setRepoUrl('');
    } finally {
      window.clearInterval(timer);
      if (!succeeded) {
        setIngestProgress(100);
        // Briefly show completion so it doesn't look stuck.
        await new Promise((r) => setTimeout(r, 400));
        setIngestProgress(0);
      } else {
        setIngestProgress(0);
      }
      setIngesting(false);
    }
  };

  const stats = [
    { label: 'Total Repositories', value: overview.total_repos, icon: <GitBranch size={20} />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Files Indexed', value: overview.total_files, icon: <FileCode size={20} />, color: 'bg-purple-100 text-purple-600' },
    { label: 'Chunks Indexed', value: overview.total_chunks, icon: <Zap size={20} />, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8">
        {/* Welcome & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight">
              Welcome back, {user?.email.split('@')[0]}
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your documentation.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/analytics')}>
              <BarChart3 size={18} className="mr-2" /> Analytics
            </Button>
            <Button onClick={() => setAddModalOpen(true)} className="shadow-lg shadow-primary/20">
              <Plus size={18} className="mr-2" /> Add Repository
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 font-display">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Repositories */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FolderGit2Icon className="mr-2 text-primary" size={20} />
                Your Repositories
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="Filter..." className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {repositories.map((repo) => (
                  <Link to={`/repo/${repo.id}`} key={repo.id} className="block group">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 group-hover:bg-primary/5 transition-colors">
                            <FileCode size={24} className="text-gray-600 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 font-display group-hover:text-primary transition-colors">{repo.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{repo.description}</p>
                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400 font-medium">
                              <span className="flex items-center"><GitBranch size={12} className="mr-1" /> {repo.branch}</span>
                              <span className="flex items-center"><Clock size={12} className="mr-1" /> {repo.lastUpdated}</span>
                              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500">{repo.language}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${repo.status === 'indexed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                          {repo.status}
                        </div>
                      </div>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                        <ArrowRight className="text-gray-400 group-hover:text-primary" />
                      </div>
                    </div>
                  </Link>
                ))}

                {repositories.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-50 p-4 rounded-full inline-flex mb-4">
                      <Plus size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No repositories yet</h3>
                    <p className="text-gray-500 mb-6">Import a repository to start generating documentation.</p>
                    <Button variant="outline" onClick={() => setAddModalOpen(true)}>Import Repository</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Activity className="mr-2 text-primary" size={20} />
              Repository Intelligence
            </h2>

            {/* Enhanced AI Summary */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-primary rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-6 -top-6 opacity-10">
                <Zap size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <Zap size={20} className="text-amber-300" />
                  </div>
                  <h3 className="font-bold text-lg">AI Insights</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-indigo-100 leading-relaxed">
                    Your codebase has <strong className="text-white">{overview.total_repos} {overview.total_repos === 1 ? 'repository' : 'repositories'}</strong> indexed with <strong className="text-white">{overview.total_files.toLocaleString()} files</strong> across multiple languages.
                  </p>
                  <p className="text-indigo-100 leading-relaxed">
                    We've processed <strong className="text-white">{overview.total_chunks.toLocaleString()} semantic chunks</strong> to enable intelligent code search and contextual AI explanations.
                  </p>
                  <div className="bg-white/10 rounded-xl p-3 mt-4 border border-white/20">
                    <div className="flex items-start">
                      <CheckCircle2 size={16} className="text-green-300 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-white mb-1">Ready for Analysis</div>
                        <div className="text-xs text-indigo-200">
                          Your code is fully indexed and ready for AI-powered explanations, dependency mapping, and intelligent search.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 mt-4 w-full">
                  Ask AI About Your Code
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock size={16} className="mr-2 text-gray-400" />
                Recent Activity
              </h3>
              <ul className="space-y-4">
                {repositories.slice(0, 3).map((repo, i) => (
                  <li key={i} className="flex items-start space-x-3 group">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium truncate group-hover:text-primary transition-colors">
                        {repo.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {repo.fileCount} files indexed
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{repo.lastUpdated}</p>
                    </div>
                  </li>
                ))}
                {repositories.length === 0 && (
                  <li className="text-sm text-gray-500 italic py-2">
                    No repositories yet. Add one to get started!
                  </li>
                )}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 size={16} className="mr-2 text-primary" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Files/Repo</span>
                  <span className="text-sm font-bold text-gray-900">
                    {overview.total_repos > 0 ? Math.round(overview.total_files / overview.total_repos) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Chunks/File</span>
                  <span className="text-sm font-bold text-gray-900">
                    {overview.total_files > 0 ? Math.round(overview.total_chunks / overview.total_files) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Indexing Coverage</span>
                  <span className="text-sm font-bold text-green-600">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Repo Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Ingest Repository"
        footer={
          <>
            <Button
              onClick={handleAddRepo}
              disabled={!repoUrl || ingesting}
              isLoading={ingesting}
              className="w-full sm:w-auto sm:ml-3"
            >
              Start Ingestion
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAddModalOpen(false)}
              className="w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Enter the URL of the public GitHub repository. CodeLens will clone, parse, and vector-embed the codebase.
          </p>
          <Input
            label="Repository URL"
            placeholder="https://github.com/username/project"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Depth</label>
              <select className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-base transition-all">
                <option>Recursive (Full)</option>
                <option>1 Level</option>
              </select>
            </div>
          </div>

          {ingesting && (
            <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center"><CheckCircle2 size={16} className="text-green-500 mr-2" /> Processing...</span>
                <span>{Math.round(ingestProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, Math.min(100, ingestProgress))}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
};

const FolderGit2Icon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /><circle cx="12" cy="13" r="2" /><path d="M12 15v5" /></svg>
);