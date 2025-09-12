import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_USERS } from '../data/mockUsers';
import { UserIcon, LockClosedIcon, SparklesIcon, EyeIcon, EyeSlashIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(t(err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                    <SparklesIcon className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">{t('login.title')}</h1>
                <p className="text-gray-500 mt-2">{t('login.welcome')}</p>
            </div>
        
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <UserIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition text-black"
                aria-label={t('login.emailPlaceholder')}
              />
            </div>
            <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-none" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition text-black"
                    aria-label={t('login.passwordPlaceholder')}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-[var(--color-text-primary)] focus:outline-none"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
            {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-base font-bold rounded-lg shadow-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.signingIn')}
                  </>
                ) : (
                  t('login.signInButton')
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border-t-4 border-orange-300">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">{t('login.demoAccounts.title')}</h3>
            <ul className="space-y-4">
                {MOCK_USERS.map(u => (
                    <li key={u.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                        <p className="font-bold text-gray-800">{u.name} <span className="font-normal text-gray-500 capitalize">({t(`roles.${u.role}`)})</span></p>
                        <div className="mt-2 grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 items-center">
                            <p className="font-medium text-gray-600">{t('login.demoAccounts.email')}</p>
                            <code className="bg-gray-200 text-gray-700 font-mono px-2 py-0.5 rounded text-xs truncate">{u.email}</code>
                            <p className="font-medium text-gray-600">{t('login.demoAccounts.password')}</p>
                            <code className="bg-gray-200 text-gray-700 font-mono px-2 py-0.5 rounded text-xs">{u.password_plaintext}</code>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;