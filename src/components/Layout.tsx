import { useState, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Bell,
  User,
  Menu,
  ChevronLeft,
  Wind,
  LogOut,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { cn, hasPermission } from '@/lib/utils';
import { useAppStore } from '@/store';
import { PERMISSIONS } from '../../shared/types';
import Modal from '@/components/Modal';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  permission: typeof PERMISSIONS[keyof typeof PERMISSIONS];
}

const allNavItems: NavItem[] = [
  { path: '/dashboard', label: '数据监测', icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
  { path: '/devices', label: '设备管理', icon: Cpu, permission: PERMISSIONS.VIEW_DEVICES },
  { path: '/realtime', label: '实时监测', icon: Activity, permission: PERMISSIONS.VIEW_REALTIME },
];

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: '设备告警',
    message: '西区二号监测站 PM2.5 数值超标，请及时处理',
    time: '5 分钟前',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: '设备离线',
    message: '南区二号监测站 已离线超过 30 分钟',
    time: '1 小时前',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: '系统通知',
    message: '系统将于今晚 23:00-24:00 进行维护升级',
    time: '2 小时前',
    read: true,
  },
  {
    id: '4',
    type: 'success',
    title: '设备恢复',
    message: '东区一号监测站 已恢复正常在线状态',
    time: '昨天',
    read: true,
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => hasPermission(user?.role, item.permission));
  }, [user?.role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} className="text-warning-500" />;
      case 'success':
        return <CheckCircle size={18} className="text-success-500" />;
      default:
        return <Info size={18} className="text-primary-500" />;
    }
  };

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-warning-50';
      case 'success':
        return 'bg-success-50';
      default:
        return 'bg-primary-50';
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

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
              {allNavItems.find((n) => location.pathname.startsWith(n.path))?.label || '扬尘监测系统'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-50 rounded-lg transition-colors"
              title="消息通知"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-dark-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-dark-500">{user?.nickname || '用户'}</span>
                <div className="flex items-center gap-1">
                  <Shield size={12} className={cn(user?.role === 'admin' ? 'text-primary-500' : 'text-dark-300')} />
                  <span className={cn('text-xs', user?.role === 'admin' ? 'text-primary-500' : 'text-dark-400')}>
                    {user?.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-dark-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                title="退出登录"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal
        open={showNotifications}
        title="消息通知"
        onClose={() => setShowNotifications(false)}
        width="max-w-md"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-dark-400">
              共 {notifications.length} 条消息，{unreadCount} 条未读
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-500 hover:text-primary-600 font-medium"
              >
                全部已读
              </button>
            )}
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={cn(
                  'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm',
                  notification.read
                    ? 'bg-white border-dark-100'
                    : cn(getNotificationBg(notification.type), 'border-transparent'),
                )}
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        notification.read ? 'text-dark-500' : 'text-dark-600',
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-danger-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className={cn(
                      'text-xs mt-1 line-clamp-2',
                      notification.read ? 'text-dark-400' : 'text-dark-500',
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-dark-300 mt-2">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
