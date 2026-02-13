import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore, useUIStore, useRepoStore } from '../../store';
import { Bell, UserCircle, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
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

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      <Sidebar />
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarOpen ? 'pl-72' : 'pl-20'}`}
      >
        {/* Enhanced Top Header with glass effect */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-8 sticky top-0 z-30 shadow-soft">
          <div className="flex items-center w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search repositories…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-900 
                          focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-500 shadow-card
                          hover:shadow-soft focus:shadow-soft"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6 ml-4">
            <button className="text-gray-400 hover:text-gray-600 transition-all relative p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm"></span>
            </button>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <Link to="/settings" className="flex items-center space-x-3 group p-2 rounded-xl hover:bg-white/50 backdrop-blur-sm transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{user?.email}</p>
                <p className="text-xs text-gray-500 font-medium">Pro Plan</p>
              </div>
              {user?.profile_image_url ? (
                <img
                  src={`/api${user.profile_image_url}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-primary 
                           transition-all shadow-card group-hover:shadow-soft"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-700 text-white rounded-full flex items-center justify-center 
                               text-sm font-semibold group-hover:from-indigo-600 group-hover:to-indigo-800 transition-all 
                               border-2 border-transparent group-hover:border-indigo-600 shadow-card group-hover:shadow-soft">
                  {user?.email.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Enhanced Main Content with glass container */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};