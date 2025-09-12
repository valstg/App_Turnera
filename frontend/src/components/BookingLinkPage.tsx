import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LinkIcon, ClipboardDocumentIcon, ChatBubbleBottomCenterTextIcon } from './icons';

const LinkCard: React.FC<{ title: string; description: string; url: string; Icon: React.FC<{className?: string}>; copyText: string; copiedText: string; }> = ({ title, description, url, Icon, copyText, copiedText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-start gap-4">
                 <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
                    <Icon className="w-7 h-7 text-[var(--color-primary)]"/>
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <p className="mt-1 text-gray-600 max-w-2xl">{description}</p>
                 </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <input
                    type="text"
                    value={url}
                    readOnly
                    className="w-full flex-grow px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    aria-label={title}
                />
                <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200"
                >
                    <ClipboardDocumentIcon className="w-5 h-5"/>
                    <span>{copied ? copiedText : copyText}</span>
                </button>
            </div>
        </div>
    );
};

const BookingLinkPage: React.FC = () => {
    const { t } = useLanguage();
    const bookingUrl = `${window.location.origin}${window.location.pathname}#/book`;
    const ratingUrl = `${window.location.origin}${window.location.pathname}#/rate`;

    return (
        <div className="space-y-8">
            <LinkCard
                title={t('bookingLink.title')}
                description={t('bookingLink.description')}
                url={bookingUrl}
                Icon={LinkIcon}
                copyText={t('bookingLink.copy')}
                copiedText={t('bookingLink.copied')}
            />
            <LinkCard
                title={t('ratingLink.title')}
                description={t('ratingLink.description')}
                url={ratingUrl}
                Icon={ChatBubbleBottomCenterTextIcon}
                copyText={t('bookingLink.copy')}
                copiedText={t('bookingLink.copied')}
            />
        </div>
    );
};

export default BookingLinkPage;
