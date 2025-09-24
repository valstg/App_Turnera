import React, { useState, useMemo, useEffect } from 'react';
import type { ScheduleConfig, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { CalendarDaysIcon, SparklesIcon } from '../components/icons';
import { bookingService } from '../services/bookingService';
import BackButton from '../components/BackButton';

// Slot local
interface Slot {
  time: string;
  capacity: number;
}

// Genera slots con default de slotDuration=30 si no viene
const generateSlots = (config: ScheduleConfig): Map<DayOfWeek, Slot[]> => {
  const allSlots = new Map<DayOfWeek, Slot[]>();
  const duration = config.slotDuration ?? 30;

  config.weeklySchedule.forEach((daySetting) => {
    const dayKey = daySetting.day as DayOfWeek;

    if (
      daySetting.isEnabled &&
      daySetting.startTime &&
      daySetting.endTime &&
      duration > 0
    ) {
      const daySlots: Slot[] = [];
      let currentTime = new Date(`1970-01-01T${daySetting.startTime}:00`);
      const endTime = new Date(`1970-01-01T${daySetting.endTime}:00`);

      while (currentTime < endTime) {
        const timeStr = currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        // regla de overbooking más reciente que aplique a ese minuto
        let capacity = 1;
        const relevantRule = (daySetting.overbookingRules ?? [])
          .slice()
          .sort((a, b) => b.startTime.localeCompare(a.startTime))
          .find((rule) => timeStr >= rule.startTime && timeStr < rule.endTime);
        if (relevantRule) capacity = relevantRule.capacity;

        daySlots.push({ time: timeStr, capacity });
        currentTime.setMinutes(currentTime.getMinutes() + duration);
      }

      allSlots.set(dayKey, daySlots);
    } else {
      allSlots.set(dayKey, []);
    }
  });

  return allSlots;
};

const BookingPage: React.FC = () => {
  const { t } = useLanguage();

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; time: string } | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga config desde localStorage (tu UI original), pero si no hay, dejalo vacío.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('companySchedule');
      if (saved) {
        setScheduleConfig(JSON.parse(saved));
      } else {
        // Si querés, acá podríamos fetch a /api/schedule para que siempre haya config:
        // scheduleService.get().then(setScheduleConfig).finally(() => setIsLoading(false));
      }
    } catch (e) {
      console.error('Could not parse schedule for booking page', e);
    }
    setIsLoading(false);
  }, []);

  const dailySlots = useMemo(() => {
    if (!scheduleConfig) return new Map<DayOfWeek, Slot[]>();
    return generateSlots(scheduleConfig);
  }, [scheduleConfig]);

  const hasAnySlots = useMemo(
    () => Array.from(dailySlots.values()).some((slots) => slots.length > 0),
    [dailySlots]
  );

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const customerName = (formData.get('name') as string) || '';
    const customerEmail = (formData.get('email') as string) || '';

    try {
      // ⬇️ el service correcto es addBooking, no createBooking
      console.log(customerName,customerEmail,selectedSlot.day,selectedSlot.time)
      await bookingService.addBooking({
        customerName,
        customerEmail,
        day: selectedSlot.day,
        time: selectedSlot.time,
      });
      setIsBookingConfirmed(true);
    } catch (err: any) {
      setError(t(err?.message || 'error.unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setIsBookingConfirmed(false);
    setSelectedSlot(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        {t('login.signingIn')}...
      </div>
    );
  }

  if (isBookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="bg-green-100 p-4 rounded-full mb-4 inline-block">
            <SparklesIcon className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('publicBooking.success.title')}</h1>
          <p className="text-gray-600 mt-2">{t('publicBooking.success.message')}</p>
          <button
            onClick={resetBooking}
            className="mt-6 w-full px-4 py-2.5 font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg"
          >
            {t('publicBooking.success.bookAnother')}
          </button>
        </div>
      </div>
    );
  }

  if (selectedSlot) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              {t('publicBooking.confirm.title')}
            </h1>
            <div className="mt-4 bg-orange-50 text-center p-3 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-800">
                {t('publicBooking.confirm.slot')} {t(`days.${selectedSlot.day}`)} @ {selectedSlot.time}
              </p>
            </div>
            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t('publicBooking.confirm.yourName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('publicBooking.confirm.yourEmail')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="w-full px-4 py-2.5 font-semibold bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  {t('schedule.overbooking.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg disabled:bg-gray-400"
                >
                  {isSubmitting ? t('publicBooking.confirm.booking') : t('publicBooking.confirm.confirmButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('publicBooking.title')}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 mb-8 px-4">{t('publicBooking.subtitle')}</p>

        {hasAnySlots ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {DAYS_OF_WEEK.map((day) => {
              const slots = dailySlots.get(day as DayOfWeek) || [];
              if (slots.length === 0) return null;

              return (
                <div key={day} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold text-center text-lg mb-4 text-gray-800">{t(`days.${day}`)}</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot({ day: day as DayOfWeek, time: slot.time })}
                        className="w-full text-center p-2.5 rounded-lg bg-orange-100/80 border border-orange-200 text-sm font-semibold text-orange-800 shadow-sm hover:bg-orange-200 hover:border-orange-300 transition-colors"
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-6 bg-white rounded-lg shadow">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900">{t('publicBooking.noSlotsWeek.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('publicBooking.noSlotsWeek.description')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingPage;
