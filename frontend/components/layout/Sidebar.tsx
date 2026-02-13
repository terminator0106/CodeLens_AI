import React, { useMemo } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, MessageSquare, BarChart2, Settings, LogOut, Code, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';

export const Sidebar: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navGroups = useMemo(() => [
    {
      title: 'MAIN',
      items: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/dashboard' },
        { icon: <FolderGit2 size={20} />, label: 'Repositories', to: '/dashboard#repos' },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { icon: <MessageSquare size={20} />, label: 'AI Chat', to: '/chat' },
        { icon: <BarChart2 size={20} />, label: 'Analytics', to: '/analytics' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { icon: <Settings size={20} />, label: 'Settings', to: '/settings' },
      ]
    }
  ], []);

  return (
    <div
      className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white/80 backdrop-blur-xl border-r border-white/50 flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 z-40 shadow-soft`}
    >
      {/* Enhanced App Header / Logo */}
      <Link
        to="/"
        className={`h-16 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center'} border-b border-white/50 hover:bg-white/50 transition-all group`}
      >
        <div className="bg-gradient-to-br from-primary to-indigo-700 p-2 rounded-xl flex-shrink-0 group-hover:from-indigo-600 group-hover:to-indigo-800 transition-all shadow-glow">
          <Code className="text-white" size={24} />
        </div>
        {isSidebarOpen && (
          <span className="font-display font-bold text-xl text-gray-900 tracking-tight ml-3 animate-in fade-in duration-200">
            CodeLens
          </span>
        )}
      </Link>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {isSidebarOpen && (
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 font-display">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center ${isSidebarOpen ? 'px-3' : 'justify-center px-2'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${isActive
                      ? 'bg-gradient-to-r from-primary/10 to-indigo-50 text-primary border border-primary/20 shadow-card'
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 backdrop-blur-sm'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`}>
                        {item.icon}
                      </span>
                      {isSidebarOpen && <span className="ml-3 whitespace-nowrap font-medium">{item.label}</span>}

                      {/* Enhanced tooltip for collapsed state */}
                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-float">
                          {item.label}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/90 rotate-45"></div>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/50 space-y-2">
        <button
          onClick={toggleSidebar}
          className={`flex w-full items-center ${isSidebarOpen ? 'px-3' : 'justify-center'} py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-white/60 hover:text-gray-900 transition-all backdrop-blur-sm`}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          {isSidebarOpen && <span className="ml-3 font-medium">Collapse</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`flex w-full items-center ${isSidebarOpen ? 'px-3' : 'justify-center'} py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all backdrop-blur-sm border border-transparent hover:border-red-200`}
        >
          <LogOut size={20} />
          {isSidebarOpen && <span className="ml-3 font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};