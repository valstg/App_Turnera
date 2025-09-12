import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { userService } from '../services/userService';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

const UserManagementPage: React.FC = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const userList = await userService.getUsers();
            setUsers(userList);
        } catch (e) {
            setError(t('error.unknown'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    useEffect(() => {
        if(notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification])

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setError(null);
        setIsSubmitting(false);
    };

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const userData: User = {
            id: editingUser?.id || '',
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as UserRole,
            password: formData.get('password') as string,
        };
        
        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, userData);
                setNotification(t('userManagement.notifications.userUpdated'));
            } else {
                await userService.addUser(userData);
                setNotification(t('userManagement.notifications.userCreated'));
            }
            await fetchUsers();
            handleCloseModal();
        } catch (err: any) {
            setError(t(err.message || 'error.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsSubmitting(true);
        try {
            await userService.deleteUser(userToDelete.id);
            setNotification(t('userManagement.notifications.userDeleted'));
            setUserToDelete(null);
            await fetchUsers();
        } catch (err: any) {
            setError(t(err.message || 'error.unknown'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('login.signingIn')}...</div>;
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
            {notification && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                    <p>{notification}</p>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('userManagement.title')}</h2>
                    <p className="mt-1 text-gray-600">{t('userManagement.description')}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors"
                >
                    <PlusIcon className="w-5 h-5"/>
                    {t('userManagement.addUser')}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('userManagement.table.name')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('userManagement.table.email')}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('userManagement.table.role')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('userManagement.table.actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{t(`roles.${user.role}`)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleOpenModal(user)} className="p-2 text-gray-500 hover:text-[var(--color-primary)] rounded-full hover:bg-orange-100 transition-colors" aria-label={`Edit ${user.name}`}>
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => handleDeleteClick(user)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" aria-label={`Delete ${user.name}`}>
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? t('userManagement.form.editUserTitle') : t('userManagement.form.addUserTitle')}>
                    <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('userManagement.form.name')}</label>
                            <input type="text" name="name" id="name" defaultValue={editingUser?.name} required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('userManagement.form.email')}</label>
                            <input type="email" name="email" id="email" defaultValue={editingUser?.email} required className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">{t('userManagement.form.role')}</label>
                            <select name="role" id="role" defaultValue={editingUser?.role || 'employee'} required className="mt-1 block w-full pl-3 pr-10 py-2.5 border-gray-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] sm:text-sm rounded-md bg-gray-50 border">
                                <option value="employee">{t('roles.employee')}</option>
                                <option value="leader">{t('roles.leader')}</option>
                                <option value="manager">{t('roles.manager')}</option>
                                <option value="owner">{t('roles.owner')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('userManagement.form.password')}</label>
                            <input type="password" name="password" id="password" required={!editingUser} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
                            {editingUser && <p className="mt-1 text-xs text-gray-500">{t('userManagement.form.passwordHint')}</p>}
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">{t('userManagement.form.cancel')}</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors disabled:bg-gray-400">
                                {isSubmitting ? t('userManagement.form.saving') : t('userManagement.form.save')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {userToDelete && (
                 <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title={t('userManagement.delete.confirmTitle')}>
                    <div className="p-6">
                        <p className="text-gray-600">{t('userManagement.delete.confirmMessage', { name: userToDelete.name })}</p>
                        <div className="mt-6 flex justify-end gap-3">
                             <button type="button" onClick={() => setUserToDelete(null)} className="px-4 py-2 text-sm font-semibold bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">{t('userManagement.form.cancel')}</button>
                             <button onClick={confirmDelete} disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:bg-red-400">
                                {isSubmitting ? t('userManagement.delete.deleting') : t('userManagement.delete.deleteButton')}
                            </button>
                        </div>
                    </div>
                 </Modal>
            )}
        </div>
    );
};

export default UserManagementPage;
