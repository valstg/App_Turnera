import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ScheduleConfig, DaySchedule, User } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import DayScheduleEditor from '../components/DayScheduleEditor';
import CalendarView from '../components/CalendarView';
import { suggestScheduleByRole } from '../services/geminiService';
import { userService } from '../services/userService';
import {
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  LinkIcon,
  UsersIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
} from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, supportedLanguages } from '../contexts/LanguageContext';
import UserManagementPage from '../components/UserManagementPage';
import BookingLinkPage from '../components/BookingLinkPage';
import RatingsPage from '../components/RatingsPage';
import DocumentationExportModal from '../components/DocumentationExportModal';
import BookingsPage from '../pages/BookingPage';

type Tab = 'schedule' | 'bookingLink' | 'userManagement' | 'ratings' | 'bookings';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLanguage();

  const initialSchedule: ScheduleConfig = {
    slotDuration: 30,
    weeklySchedule: DAYS_OF_WEEK.map((day) => ({
      day,
      isEnabled: !['Saturday', 'Sunday'].includes(day),
      startTime: '09:00',
      endTime: '17:00',
      overbookingRules: [],
    })),
  };

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(() => {
    if (user?.role === 'owner') {
      try {
        const savedSchedule = localStorage.getItem('companySchedule');
        if (savedSchedule) {
          return JSON.parse(savedSchedule);
        }
      } catch (e) {
        console.error('Could not parse saved schedule', e);
      }
    }
    return initialSchedule;
  });

  const [aiRole, setAiRole] = useState<string>('Full-time hairstylist');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');

  // Save schedule to localStorage for the owner role
  useEffect(() => {
    if (user?.role === 'owner') {
      localStorage.setItem('companySchedule', JSON.stringify(scheduleConfig));
    }
  }, [scheduleConfig, user?.role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDayUpdate = useCallback((updatedDay: DaySchedule) => {
    setScheduleConfig((prevConfig) => ({
      ...prevConfig,
      weeklySchedule: prevConfig.weeklySchedule.map((day) =>
        day.day === updatedDay.day ? updatedDay : day
      ),
    }));
  }, []);

  const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setScheduleConfig((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSuggestSchedule = async () => {
    if (!aiRole) {
      setError(t('error.gemini.roleRequired'));
      return;
    }
    setIsLoadingAi(true);
    setError(null);
    try {
      const suggestion = await suggestScheduleByRole(aiRole);
      if (suggestion) {
        const fullWeeklySchedule = DAYS_OF_WEEK.map((dayName) => {
          const suggestedDay = suggestion.weeklySchedule?.find((d) => d.day === dayName);
          const existingDay = scheduleConfig.weeklySchedule.find((d) => d.day === dayName)!;

          return {
            day: dayName,
            isEnabled: suggestedDay?.isEnabled ?? existingDay.isEnabled,
            startTime: suggestedDay?.startTime ?? existingDay.startTime,
            endTime: suggestedDay?.endTime ?? existingDay.endTime,
            overbookingRules: suggestedDay?.overbookingRules ?? [],
          };
        });

        setScheduleConfig((prev) => ({
          ...prev,
          slotDuration: suggestion.slotDuration ?? prev.slotDuration,
          weeklySchedule: fullWeeklySchedule,
        }));
      }
    } catch (e: any) {
      setError(t(e.message || 'error.unknown'));
    } finally {
      setIsLoadingAi(false);
    }
  };

  const ScheduleView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-[var(--color-border)] pb-3">
            {t('dashboard.settings.title')}
          </h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="slotDuration" className="block text-sm font-medium text-gray-700">
                {t('dashboard.settings.duration')}
              </label>
              <select
                id="slotDuration"
                name="slotDuration"
                value={scheduleConfig.slotDuration ?? 30}
                onChange={handleConfigChange}
                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md bg-white text-black border"
              >
                <option>15</option>
                <option>30</option>
                <option>45</option>
                <option>60</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-lg border border-orange-100">
          <div className="flex items-start gap-4">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <SparklesIcon className="w-7 h-7 text-[var(--color-primary)] flex-shrink-0" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{t('dashboard.ai.title')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('dashboard.ai.description')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={aiRole}
              onChange={(e) => setAiRole(e.target.value)}
              placeholder={t('dashboard.ai.placeholder')}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
            />
            <button
              onClick={handleSuggestSchedule}
              disabled={isLoadingAi || !import.meta.env.VITE_API_KEY}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoadingAi ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('dashboard.ai.loadingButton')}
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  {t('dashboard.ai.button')}
                </>
              )}
            </button>
            {!import.meta.env.VITE_API_KEY && (
              <p className="text-xs text-center text-yellow-700 bg-yellow-100 p-2 rounded-md">
                {t('error.gemini.apiKeyMissing')}
              </p>
            )}
            {error && (
              <p className="text-sm font-medium text-red-700 bg-red-100 p-3 rounded-md text-center">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-[var(--color-border)] pb-3">
            {t('schedule.title')}
          </h2>
          <div className="space-y-4">
            {scheduleConfig.weeklySchedule.map((day) => (
              <DayScheduleEditor key={day.day} daySchedule={day} onUpdate={handleDayUpdate} />
            ))}
          </div>
        </div>
        <CalendarView config={scheduleConfig} />
      </div>
    </div>
  );

  const OwnerTabs = () => {
    const getTabClass = (tabName: Tab) => {
      const baseClass =
        'flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors';
      return activeTab === tabName
        ? `${baseClass} border-[var(--color-primary)] text-[var(--color-primary)]`
        : `${baseClass} border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`;
    };

    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
          <button onClick={() => setActiveTab('schedule')} className={getTabClass('schedule')}>
            <CalendarDaysIcon className="h-5 w-5" /> {t('tabs.schedule')}
          </button>
          <button onClick={() => setActiveTab('bookingLink')} className={getTabClass('bookingLink')}>
            <LinkIcon className="h-5 w-5" /> {t('tabs.bookingLink')}
          </button>
          <button
            onClick={() => setActiveTab('userManagement')}
            className={getTabClass('userManagement')}
          >
            <UsersIcon className="h-5 w-5" /> {t('tabs.userManagement')}
          </button>
          <button onClick={() => setActiveTab('ratings')} className={getTabClass('ratings')}>
            <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> {t('tabs.ratings')}
          </button>
          {/* 👇 NUEVO: Tab Bookings */}
          <button onClick={() => setActiveTab('bookings')} className={getTabClass('bookings')}>
            <CalendarDaysIcon className="h-5 w-5" /> Bookings
          </button>
        </nav>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleView />;
      case 'bookingLink':
        return <BookingLinkPage />;
      case 'userManagement':
        return <UserManagementPage />;
      case 'ratings':
        return <RatingsPage />;
      case 'bookings':            // 👈 NUEVO caso
        return <BookingsPage />;
      default:
        return <ScheduleView />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      {isDocModalOpen && (
        <DocumentationExportModal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} />
      )}
      <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('dashboard.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors"
                aria-label={t('dashboard.languageSelectorLabel')}
                aria-haspopup="true"
                aria-expanded={isLangMenuOpen}
              >
                <img src={supportedLanguages[locale]?.flagUrl} alt="" className="w-5 h-auto rounded-sm" />
                <span>{supportedLanguages[locale]?.nativeName}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    {Object.entries(supportedLanguages).map(([langCode, langDetails]) => (
                      <button
                        key={langCode}
                        onClick={() => {
                          setLocale(langCode);
                          setIsLangMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                      >
                        <img
                          src={langDetails.flagUrl}
                          alt={`${langDetails.nativeName} flag`}
                          className="w-5 h-auto rounded-sm border border-gray-200"
                        />
                        <span>{langDetails.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors"
              aria-label={t('exportDoc.buttonLabel')}
            >
              <DocumentTextIcon className="w-6 h-6" />
            </button>
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{t(`roles.${user?.role}`)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            {(user?.role === 'owner' || user?.role === 'manager') && (
              <a
                href="#/admin/bookings"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Ver reservas
              </a>
            )}
            <button
              onClick={() => { window.location.hash = '#/admin/bookings'; }}
              className="px-3 py-2 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-md"
            >
              Ver reservas (admin)
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors"
              aria-label={t('dashboard.logout')}
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'owner' ? <OwnerTabs /> : null}
        <div className={user?.role === 'owner' ? 'mt-8' : ''}>
          {user?.role === 'owner' ? renderActiveTab() : <ScheduleView />}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
