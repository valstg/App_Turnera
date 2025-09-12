import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types';
import { SparklesIcon } from '../components/icons';

const RatingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const allBookings = await bookingService.getAllBookings();
        const rated = allBookings.filter(b => b.rating !== undefined);
        setBookings(rated);
      } catch (err: any) {
        setError(t(err.message || 'error.unknown'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchRatings();
  }, [t]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        {t('loading')}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-[var(--color-primary)]" />
          {t('ratings.title')}
        </h1>

        {bookings.length === 0 ? (
          <p className="text-gray-600 text-center">{t('ratings.noRatings')}</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map(b => (
              <li
                key={b.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <p className="font-semibold text-gray-800">
                  {b.customerName} ({b.customerEmail})
                </p>
                <p className="text-sm text-gray-600">
                  {t(`days.${b.day}`)} @ {b.time}
                </p>
                {b.rating !== undefined && (
                  <p className="mt-2 text-yellow-600">
                    ⭐ {b.rating} – {b.comment || t('ratings.noComment')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;
