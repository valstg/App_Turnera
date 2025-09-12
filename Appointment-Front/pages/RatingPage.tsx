import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { SparklesIcon } from '../components/icons';
import StarRating from '../components/StarRating';

type RatingPageState = 'find' | 'rate' | 'success';

const RatingPage: React.FC = () => {
    const { t } = useLanguage();
    const [pageState, setPageState] = useState<RatingPageState>('find');
    const [email, setEmail] = useState('');
    const [bookingToRate, setBookingToRate] = useState<Booking | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFindBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const booking = await bookingService.findBookingToRateByEmail(email);
            if (booking) {
                setBookingToRate(booking);
                setPageState('rate');
            } else {
                setError(t('error.rating.noBookingFound'));
            }
        } catch (err: any) {
            setError(t(err.message || 'error.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitRating = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!bookingToRate) return;
        if (rating === 0) {
            setError(t('error.rating.mustSelectRating'));
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await bookingService.submitRating(bookingToRate.id, rating, comment);
            setPageState('success');
        } catch (err: any) {
            setError(t(err.message || 'error.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContent = () => {
        switch (pageState) {
            case 'find':
                return (
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h1 className="text-2xl font-bold text-gray-900 text-center">{t('publicRating.find.title')}</h1>
                            <p className="text-center text-gray-600 mt-2">{t('publicRating.find.description')}</p>
                            <form onSubmit={handleFindBooking} className="mt-6 space-y-4">
                                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                                <div>
                                    <label htmlFor="email" className="sr-only">{t('publicRating.find.emailPlaceholder')}</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('publicRating.find.emailPlaceholder')}
                                        required
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg disabled:bg-gray-400">
                                    {isSubmitting ? t('publicRating.find.finding') : t('publicRating.find.findButton')}
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case 'rate':
                if (!bookingToRate) return null;
                return (
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h1 className="text-2xl font-bold text-gray-900 text-center">{t('publicRating.rate.title')}</h1>
                            <p className="text-center text-gray-600 mt-2">{t('publicRating.rate.subtitle', { day: t(`days.${bookingToRate.day}`), time: bookingToRate.time })}</p>
                            <form onSubmit={handleSubmitRating} className="mt-6 space-y-6">
                                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                                <div className="text-center">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('publicRating.rate.ratingLabel')}</label>
                                    <div className="flex justify-center">
                                      <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">{t('publicRating.rate.commentsLabel')}</label>
                                    <textarea
                                        id="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={t('publicRating.rate.commentsPlaceholder')}
                                        rows={4}
                                        className="mt-1 w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg disabled:bg-gray-400">
                                    {isSubmitting ? t('publicRating.rate.submitting') : t('publicRating.rate.submitButton')}
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case 'success':
                return (
                    <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
                        <div className="bg-green-100 p-4 rounded-full mb-4 inline-block">
                            <SparklesIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('publicRating.success.title')}</h1>
                        <p className="text-gray-600 mt-2">{t('publicRating.success.message')}</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <header className="absolute top-0 left-0 w-full p-4">
                 <h1 className="text-2xl font-bold text-gray-900 text-center">{t('publicRating.title')}</h1>
            </header>
            <main className="w-full flex justify-center">
               {renderContent()}
            </main>
        </div>
    );
};

export default RatingPage;
