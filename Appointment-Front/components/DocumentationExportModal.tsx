import React, { useRef, useState } from 'react';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { ClipboardDocumentIcon } from './icons';

interface DocumentationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentationExportModal: React.FC<DocumentationExportModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const contentRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (contentRef.current) {
            navigator.clipboard.writeText(contentRef.current.innerHTML)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => console.error('Failed to copy text: ', err));
        }
    };
    
    // This styling is intentionally verbose to ensure it's self-contained when copied to clipboard.
    const h1Styles: React.CSSProperties = { fontSize: '1.875rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' };
    const h2Styles: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem' };
    const h3Styles: React.CSSProperties = { fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.75rem' };
    const pStyles: React.CSSProperties = { marginBottom: '1rem', lineHeight: '1.6' };
    const ulStyles: React.CSSProperties = { listStyleType: 'disc', paddingLeft: '2rem', marginBottom: '1rem' };
    const codeStyles: React.CSSProperties = { backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontSize: '0.9em' };
    const tableStyles: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', border: '1px solid #e5e7eb' };
    const thStyles: React.CSSProperties = { border: '1px solid #e5e7eb', padding: '0.75rem', textAlign: 'left', backgroundColor: '#f9fafb', fontWeight: 'bold' };
    const tdStyles: React.CSSProperties = { border: '1px solid #e5e7eb', padding: '0.75rem', verticalAlign: 'top' };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('exportDoc.title')}>
            <div className="p-1">
                <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200">
                     <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg">
                        <h4 className="font-bold">{t('exportDoc.instructions.title')}</h4>
                        <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                            <li>{t('exportDoc.instructions.step1')}</li>
                            <li>{t('exportDoc.instructions.step2')}</li>
                            <li>{t('exportDoc.instructions.step3')}</li>
                        </ol>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200"
                        >
                            <ClipboardDocumentIcon className="w-5 h-5"/>
                            <span>{copied ? t('exportDoc.copied') : t('exportDoc.copyButton')}</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div ref={contentRef}>
                        <h1 style={h1Styles}>Technical and Functional Documentation: Appointment Scheduling System</h1>
                        
                        <h2 style={h2Styles}>1. Functional Summary</h2>
                        <p style={pStyles}>The system is a web application designed for businesses to manage their availability and allow customers to book appointments. Employees can set up a weekly work schedule, define appointment durations, and even establish "overbooking" rules for high-demand periods.</p>
                        <h3 style={h3Styles}>Key Features:</h3>
                        <ul style={ulStyles}>
                            <li><strong>Authentication & Roles:</strong> Login system with different user roles (`owner`, `manager`, `leader`, `employee`).</li>
                            <li><strong>Schedule Management:</strong> Detailed configuration of the work week, including active/inactive days, start/end times, and appointment duration.</li>
                            <li><strong>Overbooking Rules:</strong> Ability to define increased appointment capacity for specific time slots.</li>
                            <li><strong>AI Suggestions (Gemini):</strong> A feature that automatically generates a typical work schedule based on a professional role (e.g., "Hairdresser", "Dentist").</li>
                            <li><strong>User Management:</strong> The "Owner" role can create, edit, and delete other system users.</li>
                            <li><strong>Public Booking Link:</strong> A unique link is generated for businesses to share with their clients for booking.</li>
                            <li><strong>Rating System:</strong> Customers can rate and comment on their appointments, and the "Owner" can view all ratings in their dashboard.</li>
                            <li><strong>Internationalization (i18n):</strong> The interface is available in multiple languages.</li>
                        </ul>

                        <h2 style={h2Styles}>2. Functional Specifications (User Flows)</h2>
                        <h3 style={h3Styles}>2.1. User Roles and Permissions</h3>
                        <table style={tableStyles}>
                            <thead>
                                <tr>
                                    <th style={thStyles}>Role</th>
                                    <th style={thStyles}>Permissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={tdStyles}><strong>Customer (Unauthenticated)</strong></td>
                                    <td style={tdStyles}>
                                        <ul style={{...ulStyles, marginBottom: 0}}>
                                            <li>View public booking page.</li>
                                            <li>Book an appointment.</li>
                                            <li>View public rating page.</li>
                                            <li>Find their appointment by email and leave a rating.</li>
                                        </ul>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={tdStyles}><strong>Employee / Leader / Manager</strong></td>
                                    <td style={tdStyles}>
                                        <ul style={{...ulStyles, marginBottom: 0}}>
                                            <li>Log into the dashboard.</li>
                                            <li>View and edit the company schedule.</li>
                                            <li>Log out.</li>
                                        </ul>
                                    </td>
                                </tr>
                                 <tr>
                                    <td style={tdStyles}><strong>Owner</strong></td>
                                    <td style={tdStyles}>
                                        <ul style={{...ulStyles, marginBottom: 0}}>
                                            <li>All permissions of other roles.</li>
                                            <li>Access the <strong>User Management</strong> tab.</li>
                                            <li>Access the <strong>Booking Link</strong> tab.</li>
                                            <li>Access the <strong>Ratings</strong> tab.</li>
                                        </ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <h2 style={h2Styles}>3. Technical Specifications (For PHP/Vue Team)</h2>
                        <h3 style={h3Styles}>3.1. Proposed Architecture</h3>
                         <ul style={ulStyles}>
                            <li><strong>Frontend:</strong> Single Page Application (SPA) built with <strong>Vue.js 3</strong>.</li>
                            <li><strong>Backend:</strong> RESTful API built with <strong>PHP</strong> (Laravel or Symfony recommended).</li>
                            <li><strong>Database:</strong> <strong>MySQL</strong> or <strong>PostgreSQL</strong>.</li>
                        </ul>

                        <h3 style={h3Styles}>3.2. Data Model (Database Schema)</h3>
                        <p style={pStyles}>The following tables are required:</p>
                        <ul style={ulStyles}>
                            <li><code style={codeStyles}>users</code> (id, name, email, password, role)</li>
                            <li><code style={codeStyles}>schedule_settings</code> (id, slot_duration)</li>
                            <li><code style={codeStyles}>weekly_schedules</code> (id, day, is_enabled, start_time, end_time)</li>
                            <li><code style={codeStyles}>overbooking_rules</code> (id, weekly_schedule_id, start_time, end_time, capacity)</li>
                            <li><code style={codeStyles}>bookings</code> (id, customer_name, customer_email, day, time, booked_at, rating, comment, rated_at)</li>
                        </ul>

                        <h3 style={h3Styles}>3.3. API Endpoints (Backend-Frontend Contract)</h3>
                        <table style={tableStyles}>
                            <thead>
                                <tr>
                                    <th style={thStyles}>Method</th>
                                    <th style={thStyles}>Route</th>
                                    <th style={thStyles}>Protection</th>
                                    <th style={thStyles}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style={tdStyles}>POST</td><td style={tdStyles}><code style={codeStyles}>/api/login</code></td><td style={tdStyles}>Public</td><td style={tdStyles}>Authenticates a user.</td></tr>
                                <tr><td style={tdStyles}>GET</td><td style={tdStyles}><code style={codeStyles}>/api/schedule</code></td><td style={tdStyles}>Token</td><td style={tdStyles}>Returns the full schedule configuration.</td></tr>
                                <tr><td style={tdStyles}>PUT</td><td style={tdStyles}><code style={codeStyles}>/api/schedule</code></td><td style={tdStyles}>Token</td><td style={tdStyles}>Updates the schedule configuration.</td></tr>
                                <tr><td style={tdStyles}>POST</td><td style={tdStyles}><code style={codeStyles}>/api/schedule/suggest</code></td><td style={tdStyles}>Token</td><td style={tdStyles}>Calls the Gemini API from the backend to suggest a schedule.</td></tr>
                                <tr><td style={tdStyles}>GET</td><td style={tdStyles}><code style={codeStyles}>/api/users</code></td><td style={tdStyles}>Token (Owner)</td><td style={tdStyles}>Returns a list of all users.</td></tr>
                                <tr><td style={tdStyles}>POST</td><td style={tdStyles}><code style={codeStyles}>/api/users</code></td><td style={tdStyles}>Token (Owner)</td><td style={tdStyles}>Creates a new user.</td></tr>
                                <tr><td style={tdStyles}>GET</td><td style={tdStyles}><code style={codeStyles}>/api/public/schedule</code></td><td style={tdStyles}>Public</td><td style={tdStyles}>Returns the public booking schedule.</td></tr>
                                <tr><td style={tdStyles}>POST</td><td style={tdStyles}><code style={codeStyles}>/api/public/bookings</code></td><td style={tdStyles}>Public</td><td style={tdStyles}>Creates a new booking.</td></tr>
                                <tr><td style={tdStyles}>POST</td><td style={tdStyles}><code style={codeStyles}>/api/public/ratings/find</code></td><td style={tdStyles}>Public</td><td style={tdStyles}>Finds a booking to be rated.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DocumentationExportModal;
