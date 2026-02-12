import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore, useUIStore } from '../../store';
import { Bell, UserCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="min-h-screen bg-paper font-sans text-gray-900 selection:bg-primary/10 selection:text-primary">
      <Sidebar />
      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarOpen ? 'pl-72' : 'pl-20'}`}
      >
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search repositories, files, or symbols..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6 ml-4">
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative p-1">
              <Bell size={22} />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <Link to="/settings" className="flex items-center space-x-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{user?.email}</p>
                <p className="text-xs text-gray-500">Pro Plan</p>
              </div>
              <UserCircle size={36} className="text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 sm:p-10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};