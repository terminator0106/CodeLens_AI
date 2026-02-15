import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepoStore, useAuthStore } from '../store';
import { api } from '../services/api';
import { Plus, GitBranch, Clock, FileCode, CheckCircle2, Zap, BarChart3, ArrowRight, Activity, Search, Trash2, Filter, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { GridOverlay } from '../components/ui/grid-feature-cards';

export const Dashboard: React.FC = () => {
  const { repositories, filteredRepositories, setRepositories, addRepository, removeRepository } = useRepoStore();
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

  // Delete Repo State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter and Sort State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Close filter dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

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

  const handleDeleteRepo = async () => {
    if (!repoToDelete) return;
    setDeleting(true);
    try {
      await api.deleteRepo(repoToDelete);
      removeRepository(repoToDelete);
      setDeleteModalOpen(false);
      setRepoToDelete(null);
    } catch (error) {
      console.error('Failed to delete repository:', error);
      alert((error as Error).message || 'Failed to delete repository');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (repoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRepoToDelete(repoId);
    setDeleteModalOpen(true);
  };

  const applyFiltersAndSort = (repos: typeof repositories) => {
    let filtered = [...repos];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(repo => {
        if (statusFilter === 'completed') return repo.status === 'indexed';
        if (statusFilter === 'progress') return repo.status === 'processing';
        if (statusFilter === 'failed') return repo.status === 'error';
        return true;
      });
    }

    // Apply language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(repo => repo.language === languageFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
        case 'largest':
          return (b.fileCount || 0) - (a.fileCount || 0);
        case 'mostFiles':
          return (b.fileCount || 0) - (a.fileCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getAvailableLanguages = () => {
    const languages = new Set(repositories.map(repo => repo.language).filter(Boolean));
    return Array.from(languages).sort();
  };

  const stats = [
    { label: 'Total Repositories', value: overview.total_repos, icon: <GitBranch size={20} />, color: 'bg-chart-blue text-chart-blue-foreground' },
    { label: 'Files Indexed', value: overview.total_files, icon: <FileCode size={20} />, color: 'bg-chart-purple text-chart-purple-foreground' },
    { label: 'Chunks Indexed', value: overview.total_chunks, icon: <Zap size={20} />, color: 'bg-chart-yellow text-chart-yellow-foreground' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8">
        {/* Welcome & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display tracking-tight">
              Welcome back, {user?.email.split('@')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your documentation.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/analytics')}>
              <BarChart3 size={18} className="mr-2" /> Analytics
            </Button>
            <Button onClick={() => setAddModalOpen(true)} className="shadow-card">
              <Plus size={18} className="mr-2" /> Add Repository
            </Button>
          </div>
        </div>

        {/* Enhanced Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="relative overflow-hidden bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-border shadow-card ai-card hover:shadow-glow hover:scale-105 transition-all duration-300 flex items-center justify-between group">
              <GridOverlay />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2 font-display tracking-tight">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-card relative z-10`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Repositories */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center">
                <FolderGit2Icon className="mr-2 text-primary" size={20} />
                Your Repositories
              </h2>
              <div className="flex items-center space-x-3">
                {/* Repository Filter */}
                <div className="relative filter-dropdown">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center space-x-2 px-4 py-3 text-sm border border-border rounded-xl bg-card/80 backdrop-blur-sm hover:bg-card transition-all shadow-card hover:shadow-float"
                  >
                    <Filter size={16} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Filter & Sort</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </button>
                  {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-card/95 backdrop-blur-xl rounded-2xl shadow-float border border-border z-20">
                      <div className="p-6 space-y-5">
                        {/* Status Filter */}
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-2">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-input"
                          >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="progress">In Progress</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                        {/* Language Filter */}
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-2">Language</label>
                          <select
                            value={languageFilter}
                            onChange={(e) => setLanguageFilter(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-input"
                          >
                            <option value="all">All Languages</option>
                            {getAvailableLanguages().map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>
                        {/* Sort Options */}
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-2">Sort By</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-input"
                          >
                            <option value="recent">Recently Ingested</option>
                            <option value="largest">Largest Repository</option>
                            <option value="mostFiles">Most Files</option>
                          </select>
                        </div>
                        {/* Reset Filter */}
                        <button
                          onClick={() => {
                            setStatusFilter('all');
                            setLanguageFilter('all');
                            setSortBy('recent');
                          }}
                          className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 bg-secondary rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applyFiltersAndSort(filteredRepositories).map((repo) => (
                  <div key={repo.id} className="relative group">
                    <Link to={`/repo/${repo.id}`} className="block">
                      <div className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-float transition-all duration-200 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-4">
                            <div className="bg-secondary p-3 rounded-lg border border-border group-hover:bg-primary/5 transition-colors">
                              <FileCode size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground font-display group-hover:text-primary transition-colors">{repo.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{repo.description}</p>
                              <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground/80 font-medium">
                                <span className="flex items-center"><GitBranch size={12} className="mr-1" /> {repo.branch}</span>
                                <span className="flex items-center"><Clock size={12} className="mr-1" /> {repo.lastUpdated}</span>
                                <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">{repo.language}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${repo.status === 'indexed' ? 'bg-chart-green text-chart-green-foreground border-chart-green/20' : 'bg-chart-yellow text-chart-yellow-foreground border-chart-yellow/20'
                              }`}>
                              {repo.status}
                            </div>
                          </div>
                        </div>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                          <ArrowRight className="text-muted-foreground group-hover:text-primary" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}

                {applyFiltersAndSort(filteredRepositories).length === 0 && repositories.length === 0 && (
                  <div className="text-center py-20 bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-border shadow-card">
                    <div className="bg-gradient-to-br from-secondary/50 to-card p-6 rounded-full inline-flex mb-6 shadow-card">
                      <Plus size={40} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No repositories yet</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">Import your first repository to start generating intelligent documentation and AI-powered code insights.</p>
                    <Button variant="primary" onClick={() => setAddModalOpen(true)} className="shadow-card">
                      <Plus size={18} className="mr-2" />
                      Import Repository
                    </Button>
                  </div>
                )}

                {applyFiltersAndSort(filteredRepositories).length === 0 && repositories.length > 0 && (
                  <div className="text-center py-20 bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-border shadow-card">
                    <div className="bg-gradient-to-br from-secondary/50 to-card p-6 rounded-full inline-flex mb-6 shadow-card">
                      <Search size={40} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No repositories found</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">Try adjusting your search terms or filter settings to find what you're looking for.</p>
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setLanguageFilter('all');
                        setSortBy('recent');
                      }}
                      className="px-6 py-3 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground border-2 border-primary rounded-xl transition-all duration-200 shadow-card hover:shadow-float backdrop-blur-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center">
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
                  <div className="bg-primary/20 p-2 rounded-lg mr-3">
                    <Zap size={20} className="text-accent" />
                  </div>
                  <h3 className="font-bold text-lg">AI Insights</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-foreground/80 leading-relaxed">
                    Your codebase has <strong className="text-white">{overview.total_repos} {overview.total_repos === 1 ? 'repository' : 'repositories'}</strong> indexed with <strong className="text-white">{overview.total_files.toLocaleString()} files</strong> across multiple languages.
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    We've processed <strong className="text-white">{overview.total_chunks.toLocaleString()} semantic chunks</strong> to enable intelligent code search and contextual AI explanations.
                  </p>
                  <div className="bg-primary/10 rounded-xl p-3 mt-4 border border-primary/20">
                    <div className="flex items-start">
                      <CheckCircle2 size={16} className="text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-white mb-1">Ready for Analysis</div>
                        <div className="text-xs text-foreground/60">
                          Your code is fully indexed and ready for AI-powered explanations, dependency mapping, and intelligent search.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-primary/20 text-white border-primary/30 hover:bg-primary/30 mt-4 w-full"
                  onClick={() => {
                    if (repositories.length > 0) {
                      const repoToSelect = repositories.find(r => r.status === 'indexed') || repositories[0];
                      navigate(`/chat?repo=${repoToSelect.id}`);
                    } else {
                      navigate('/chat');
                    }
                  }}
                >
                  Ask AI About Your Code
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Clock size={16} className="mr-2 text-muted-foreground" />
                Recent Activity
              </h3>
              <ul className="space-y-4">
                {repositories.slice(0, 3).map((repo, i) => (
                  <li key={i} className="flex items-start space-x-3 group">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium truncate group-hover:text-primary transition-colors">
                        {repo.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {repo.fileCount} files indexed
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{repo.lastUpdated}</p>
                    </div>
                  </li>
                ))}
                {repositories.length === 0 && (
                  <li className="text-sm text-muted-foreground italic py-2">
                    No repositories yet. Add one to get started!
                  </li>
                )}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-6 border border-primary/30">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <BarChart3 size={16} className="mr-2 text-primary" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Files/Repo</span>
                  <span className="text-sm font-bold text-foreground">
                    {overview.total_repos > 0 ? Math.round(overview.total_files / overview.total_repos) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Chunks/File</span>
                  <span className="text-sm font-bold text-foreground">
                    {overview.total_files > 0 ? Math.round(overview.total_chunks / overview.total_files) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Indexing Coverage</span>
                  <span className="text-sm font-bold text-foreground">100%</span>
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
          <p className="text-sm text-muted-foreground leading-relaxed">
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
              <label className="block text-sm font-semibold text-foreground mb-2">Depth</label>
              <select className="block w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-base transition-all">
                <option>Recursive (Full)</option>
                <option>1 Level</option>
              </select>
            </div>
          </div>

          {ingesting && (
            <div className="mt-6 bg-secondary p-4 rounded-xl border border-border">
              <div className="flex justify-between text-sm font-medium text-foreground mb-2">
                <span className="flex items-center"><CheckCircle2 size={16} className="text-chart-green-foreground mr-2" /> Processing...</span>
                <span>{Math.round(ingestProgress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, Math.min(100, ingestProgress))}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Repo Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Repository"
        footer={
          <>
            <Button
              onClick={handleDeleteRepo}
              disabled={deleting}
              isLoading={deleting}
              className="w-full sm:w-auto sm:ml-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              className="w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ This action cannot be undone.
            </p>
          </div>
          <p className="text-sm text-foreground">
            This will permanently delete the repository and all associated data including:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
            <li>All indexed files and code chunks</li>
            <li>Vector embeddings and FAISS index</li>
            <li>Chat history for this repository</li>
            <li>Analytics and metadata</li>
          </ul>
          <p className="text-sm text-foreground font-medium">
            Are you sure you want to delete <span className="text-red-600">{repositories.find(r => r.id === repoToDelete)?.name}</span>?
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

const FolderGit2Icon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /><circle cx="12" cy="13" r="2" /><path d="M12 15v5" /></svg>
);