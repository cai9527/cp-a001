import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Bell,
  User,
  Menu,
  ChevronLeft,
  Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: '数据监测', icon: LayoutDashboard },
  { path: '/devices', label: '设备管理', icon: Cpu },
  { path: '/realtime', label: '实时监测', icon: Activity },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-dark-50">
      <aside
        className={cn(
          'flex flex-col bg-dark-700 text-white transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-dark-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
              <Wind size={18} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">扬尘监测系统</span>
                <span className="text-xs text-dark-300 leading-tight">Dust Monitoring</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/40'
                    : 'text-dark-200 hover:bg-dark-600 hover:text-white',
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
                <Icon
                  size={18}
                  className={cn(
                    'flex-shrink-0 transition-all duration-200',
                    isActive && 'drop-shadow-sm scale-110',
                  )}
                />
                {!collapsed && (
                  <span className={cn(isActive && 'font-semibold')}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-2 border-t border-dark-500">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-dark-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-dark-600">
              {navItems.find((n) => location.pathname.startsWith(n.path))?.label || '扬尘监测系统'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-50 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-dark-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-dark-500">管理员</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
