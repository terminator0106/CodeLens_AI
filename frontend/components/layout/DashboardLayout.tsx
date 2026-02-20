import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore, useUIStore, useRepoStore } from '../../store';
import { Bell, UserCircle, Search, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const { repositories, setFilteredRepositories } = useRepoStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRepositories(repositories);
      return;
    }

    const filtered = repositories.filter(repo =>
      repo.name.toLowerCase().includes(query.toLowerCase()) ||
      repo.url?.toLowerCase().includes(query.toLowerCase()) ||
      repo.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRepositories(filtered);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Failed to logout from server:', error);
    }
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
      <Sidebar />
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarOpen ? 'pl-72' : 'pl-20'}`}
      >
        {/* Enhanced Top Header with glass effect */}
        <header className="h-20 bg-card/70 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-30 shadow-soft">
          <div className="flex items-center w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search repositories…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl text-sm text-foreground 
                          focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all placeholder-muted-foreground shadow-card
                          hover:shadow-soft focus:shadow-soft"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <button className="text-muted-foreground hover:text-foreground transition-all relative p-2 rounded-lg hover:bg-accent">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card shadow-sm"></span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-all p-2 rounded-lg hover:bg-destructive/10"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>

            <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
            <Link to="/settings" className="flex items-center space-x-3 group p-2 rounded-xl hover:bg-accent backdrop-blur-sm transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {user?.username || user?.email?.split('@')?.[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{user?.email}</p>
              </div>
              {user?.profile_image_url ? (
                <img
                  src={`/api${user.profile_image_url}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-border group-hover:border-primary 
                           transition-all shadow-card group-hover:shadow-soft"
                />
              ) : (
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center 
                               text-sm font-semibold hover:opacity-90 transition-all 
                               border-2 border-transparent shadow-card group-hover:shadow-soft">
                  {user?.email.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
          <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 shadow-soft p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};