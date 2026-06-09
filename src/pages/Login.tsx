import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, User, Lock, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { authApi } from '@/services';
import { cn } from '@/lib/utils';
import Modal from '@/components/Modal';

export default function Login() {
  const navigate = useNavigate();
  const { login, authLoading, isAuthenticated } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    try {
      const result = await authApi.getCaptcha();
      setCaptchaId(result.captchaId);
      setCaptchaImage(result.image);
    } catch (err) {
      setError((err as Error).message);
      setShowErrorModal(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const showError = (message: string) => {
    setError(message);
    setShowErrorModal(true);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      showError('请输入账号');
      return;
    }
    if (!password.trim()) {
      showError('请输入密码');
      return;
    }
    if (!captcha.trim()) {
      showError('请输入验证码');
      return;
    }

    try {
      await login({ username, password, captcha, captchaId });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      showError((err as Error).message);
      fetchCaptcha();
      setCaptcha('');
    }
  };

  const handleRefreshCaptcha = () => {
    fetchCaptcha();
    setCaptcha('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-white rounded-2xl shadow-card-hover p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/40">
              <Wind size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-dark-600">扬尘监测系统</h1>
            <p className="text-sm text-dark-400 mt-1">Dust Monitoring System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">账号</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号"
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-dark-100 rounded-lg text-dark-600 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-2.5 bg-dark-50 border border-dark-100 rounded-lg text-dark-600 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-500 mb-2">验证码</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    placeholder="请输入4位数字"
                    maxLength={4}
                    className="w-full px-4 py-2.5 bg-dark-50 border border-dark-100 rounded-lg text-dark-600 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border border-dark-100 bg-white hover:bg-dark-50 transition-colors',
                    'w-[150px] h-[42px] justify-center overflow-hidden shadow-sm',
                  )}
                  title="点击刷新验证码"
                >
                  {captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="验证码"
                      className="h-full w-full object-contain"
                      onError={() => {
                        setCaptchaImage('');
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 text-dark-400 text-sm">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>加载中</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={cn(
                'w-full py-2.5 rounded-lg font-medium text-white transition-all duration-200',
                'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
                'shadow-lg shadow-primary-500/40 hover:shadow-primary-500/60',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2',
              )}
            >
              {authLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                <span>登 录</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-100 text-center">
            <p className="text-xs text-dark-300">
              测试账号: <span className="text-dark-500 font-medium">admin / admin123</span>
              <span className="mx-2">|</span>
              <span className="text-dark-500 font-medium">user / user123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-dark-300 mt-6">
          © {new Date().getFullYear()} 扬尘监测系统. All rights reserved.
        </p>
      </div>

      <Modal
        open={showErrorModal}
        title="登录提示"
        onClose={handleCloseErrorModal}
        width="max-w-sm"
      >
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-danger-500" />
            </div>
            <p className="text-dark-600 text-sm">{error}</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCloseErrorModal}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
