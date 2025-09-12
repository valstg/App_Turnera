import React, { useState, useEffect, useMemo } from 'react';
import { Booking } from '../types';
import { bookingService } from '../services/bookingService';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatBubbleBottomCenterTextIcon, StarIcon } from './icons';
import StarRating from './StarRating';

const RatingsPage: React.FC = () => {
    const { t, locale } = useLanguage();
    const [ratings, setRatings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRatings = async () => {
            setIsLoading(true);
            try {
                const ratedBookings = await bookingService.getAllRatedBookings();
                setRatings(ratedBookings);
            } catch (err) {
                setError(t('error.unknown'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchRatings();
    }, [t]);

    const summary = useMemo(() => {
        if (ratings.length === 0) {
            return { average: 0, total: 0 };
        }
        const total = ratings.length;
        const sum = ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const average = sum / total;
        return { average, total };
    }, [ratings]);
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('login.signingIn')}...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{t('adminRatings.title')}</h2>
                        <p className="mt-1 text-gray-600">{t('adminRatings.description')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-orange-50/80 p-6 rounded-xl border border-orange-200 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-orange-700">{t('adminRatings.average')}</p>
                            <p className="text-4xl font-bold text-orange-900">{summary.average.toFixed(1)}</p>
                        </div>
                        <StarIcon className="w-16 h-16 text-yellow-400 opacity-80" solid/>
                    </div>
                     <div className="bg-blue-50/80 p-6 rounded-xl border border-blue-200 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-700">{t('adminRatings.total')}</p>
                            <p className="text-4xl font-bold text-blue-900">{summary.total}</p>
                        </div>
                        <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-blue-500 opacity-80"/>
                    </div>
                </div>
                
                {ratings.length > 0 ? (
                    <div className="space-y-4">
                        {ratings.map(booking => (
                            <div key={booking.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{booking.customerName}</p>
                                        <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <StarRating rating={booking.rating || 0} readOnly size="sm"/>
                                        <p className="text-xs text-gray-500 mt-1">{t('adminRatings.ratedOn')} {formatDate(booking.ratedAt)}</p>
                                    </div>
                                </div>
                                {booking.comment && (
                                    <blockquote className="mt-3 p-3 bg-white border-l-4 border-orange-300 text-gray-700 text-sm italic rounded-r-md">
                                        "{booking.comment}"
                                    </blockquote>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
                        <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-semibold text-gray-900">{t('adminRatings.noRatings')}</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingsPage;
