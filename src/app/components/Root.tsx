import { Outlet, NavLink } from 'react-router';
import { HabitProvider } from '../context/HabitContext';
import { Calendar, BarChart3, CalendarDays, TrendingUp, Plus, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

export function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <HabitProvider>
      <div className="min-h-screen bg-[#1a1a1a] text-white flex">
        {/* Sidebar */}
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <nav className="bg-[#0a0a0a] border-b border-gray-800">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold text-[#4ADE80]">Habit Tracker</h1>
                  <div className="hidden md:flex gap-2">
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#4ADE80] text-black'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Daily</span>
                    </NavLink>
                    <NavLink
                      to="/monthly"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#4ADE80] text-black'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-sm">Monthly</span>
                    </NavLink>
                    <NavLink
                      to="/yearly"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#4ADE80] text-black'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">Yearly</span>
                    </NavLink>
                    <NavLink
                      to="/analytics"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#4ADE80] text-black'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Analytics</span>
                    </NavLink>
                  </div>
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