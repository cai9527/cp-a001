import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Devices from '@/pages/Devices';
import DeviceDetail from '@/pages/DeviceDetail';
import Realtime from '@/pages/Realtime';
import DataVisualization from '@/pages/DataVisualization';
import Login from '@/pages/Login';
import { useAppStore } from '@/store';
import { hasPermission } from '@/lib/utils';
import { PERMISSIONS } from '../shared/types';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function RequirePermission({ permission, children }: { permission: typeof PERMISSIONS[keyof typeof PERMISSIONS]; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasPermission(user?.role, permission)) {
    return <Navigate to="/devices" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { initAuth, user } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const getDefaultRoute = () => {
    if (hasPermission(user?.role, PERMISSIONS.VIEW_DASHBOARD)) {
      return '/dashboard';
    }
    if (hasPermission(user?.role, PERMISSIONS.VIEW_VISUALIZATION)) {
      return '/visualization';
    }
    if (hasPermission(user?.role, PERMISSIONS.VIEW_DEVICES)) {
      return '/devices';
    }
    if (hasPermission(user?.role, PERMISSIONS.VIEW_REALTIME)) {
      return '/realtime';
    }
    return '/login';
  };

  return (
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to={getDefaultRoute()} replace />} />
        <Route
          path="dashboard"
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_DASHBOARD}>
              <Dashboard />
            </RequirePermission>
          }
        />
        <Route
          path="devices"
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_DEVICES}>
              <Devices />
            </RequirePermission>
          }
        />
        <Route
          path="devices/:id"
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_DEVICES}>
              <DeviceDetail />
            </RequirePermission>
          }
        />
        <Route
          path="realtime"
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_REALTIME}>
              <Realtime />
            </RequirePermission>
          }
        />
        <Route
          path="visualization"
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_VISUALIZATION}>
              <DataVisualization />
            </RequirePermission>
          }
        />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
