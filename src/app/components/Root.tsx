import { Outlet, NavLink, useNavigate } from 'react-router';
import { HabitProvider } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, BarChart3, CalendarDays, TrendingUp, Menu, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SettingsSidebar } from './SettingsSidebar';
import { useState } from 'react';

export function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <HabitProvider>
      <div className="min-h-screen bg-[var(--hh-bg)] text-[var(--hh-text)] flex">
        {/* Sidebar */}
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <nav className="bg-[var(--hh-sidebar)] border-b border-[var(--hh-border)]">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-[var(--hh-border)] rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-[var(--hh-logo)]">Habit Hero</h1>
                  <div className="hidden md:flex gap-2">
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                          ? 'bg-[var(--hh-nav-active)] text-[var(--hh-nav-active-text)]'
                          : 'text-[var(--hh-muted)] hover:text-[var(--hh-text)] hover:bg-[var(--hh-border)]'
                        }`
                      }
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Daily</span>
                    </NavLink>
                    <NavLink
                      to="/monthly"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                          ? 'bg-[var(--hh-nav-active)] text-[var(--hh-nav-active-text)]'
                          : 'text-[var(--hh-muted)] hover:text-[var(--hh-text)] hover:bg-[var(--hh-border)]'
                        }`
                      }
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-sm">Monthly</span>
                    </NavLink>
                    <NavLink
                      to="/yearly"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                          ? 'bg-[var(--hh-nav-active)] text-[var(--hh-nav-active-text)]'
                          : 'text-[var(--hh-muted)] hover:text-[var(--hh-text)] hover:bg-[var(--hh-border)]'
                        }`
                      }
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">Yearly</span>
                    </NavLink>
                    <NavLink
                      to="/analytics"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                          ? 'bg-[var(--hh-nav-active)] text-[var(--hh-nav-active-text)]'
                          : 'text-[var(--hh-muted)] hover:text-[var(--hh-text)] hover:bg-[var(--hh-border)]'
                        }`
                      }
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Analytics</span>
                    </NavLink>
                  </div>
                </div>
                {/* User info + Sign Out */}
                <div className="flex items-center gap-3">
                  {user && (
                    <span className="hidden sm:block text-xs text-gray-500 truncate max-w-[160px]">
                      {user.email}
                    </span>
                  )}
                  <SettingsSidebar />
                  <button
                    id="sign-out-btn"
                    onClick={handleSignOut}
                    title="Sign out"
                    className="flex items-center gap-1.5 px-3 py-2 text-[var(--hh-muted)] hover:text-[var(--hh-text)] hover:bg-[var(--hh-border)] rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </HabitProvider>
  );
}