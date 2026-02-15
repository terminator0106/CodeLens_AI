import React, { useMemo } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, MessageSquare, BarChart2, Settings, LogOut, Code, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { api } from '../../services/api';

export const Sidebar: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Failed to logout from server:', error);
    }
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
      className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 z-40 shadow-soft`}
    >
      {/* Enhanced App Header / Logo */}
      <Link
        to="/"
        className={`h-16 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center'} border-b border-sidebar-border hover:bg-sidebar-accent transition-all group`}
      >
        <div className="bg-sidebar-primary p-2 rounded-xl flex-shrink-0 hover:opacity-90 transition-all shadow-glow">
          <Code className="text-sidebar-primary-foreground" size={24} />
        </div>
        {isSidebarOpen && (
          <span className="font-display font-bold text-xl text-sidebar-foreground tracking-tight ml-3 animate-in fade-in duration-200">
            CodeLens
          </span>
        )}
      </Link>

      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {isSidebarOpen && (
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 font-display">
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
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-ring shadow-card'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`${isActive ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'} transition-colors`}>
                        {item.icon}
                      </span>
                      {isSidebarOpen && <span className="ml-3 whitespace-nowrap font-medium">{item.label}</span>}

                      {/* Enhanced tooltip for collapsed state */}
                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-popover border border-border text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-float">
                          {item.label}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45 border-l border-b border-border"></div>
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

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={toggleSidebar}
          className={`flex w-full items-center ${isSidebarOpen ? 'px-3' : 'justify-center'} py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all`}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          {isSidebarOpen && <span className="ml-3 font-medium">Collapse</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`flex w-full items-center ${isSidebarOpen ? 'px-3' : 'justify-center'} py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all border border-transparent hover:border-destructive`}
        >
          <LogOut size={20} />
          {isSidebarOpen && <span className="ml-3 font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};