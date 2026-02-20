import React, { useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, MessageSquare, BarChart2, Settings, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../store';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

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
      {/* Enhanced App Header / Logo with Collapse Button */}
      <div className={`h-16 flex items-center ${isSidebarOpen ? 'px-6 justify-between' : 'justify-center'} border-b border-sidebar-border`}>
        <Link
          to="/"
          className="flex items-center hover:opacity-90 transition-all group"
        >
          <div className="bg-sidebar-primary p-2 rounded-xl flex-shrink-0 transition-all shadow-glow">
            <Code className="text-sidebar-primary-foreground" size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-display font-bold text-xl text-sidebar-foreground tracking-tight ml-3 animate-in fade-in duration-200">
              CodeLens
            </span>
          )}
        </Link>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

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
    </div>
  );
};