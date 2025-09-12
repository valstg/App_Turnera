import { User } from '../types';
import { MOCK_USERS } from '../data/mockUsers';

const USERS_STORAGE_KEY = 'app_users';

// This service simulates a backend user database using localStorage.

const getUsers = (): Promise<(User & { password_plaintext: string })[]> => {
  return new Promise((resolve) => {
    try {
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      if (usersJson) {
        resolve(JSON.parse(usersJson));
      } else {
        // Seed with mock data if no users are in storage
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
        resolve(MOCK_USERS);
      }
    } catch (error) {
      console.error('Failed to retrieve users from localStorage', error);
      // Fallback to mock users in case of parsing error
      resolve(MOCK_USERS);
    }
  });
};

const saveUsers = (users: (User & { password_plaintext: string })[]): Promise<void> => {
    return new Promise((resolve) => {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        resolve();
    });
};

const authenticateUser = async (email: string, password_plaintext: string): Promise<(User & { password_plaintext: string }) | null> => {
    const users = await getUsers();
    const foundUser = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password_plaintext === password_plaintext
    );
    return foundUser || null;
};

const addUser = async (user: User): Promise<void> => {
    if (!user.password) {
        throw new Error("Password is required for new users.");
    }
    const users = await getUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (emailExists) {
        throw new Error('error.user.emailExists');
    }
    const newUser = {
        ...user,
        id: `user-${Date.now()}`,
        password_plaintext: user.password
    };
    delete newUser.password; // remove the temporary password field
    
    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
};

const updateUser = async (userId: string, updatedUser: User): Promise<void> => {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found.");
    }

    const emailExists = users.some(u => u.id !== userId && u.email.toLowerCase() === updatedUser.email.toLowerCase());
     if (emailExists) {
        throw new Error('error.user.emailExists');
    }

    const userToUpdate = users[userIndex];
    userToUpdate.name = updatedUser.name;
    userToUpdate.email = updatedUser.email;
    userToUpdate.role = updatedUser.role;

    if (updatedUser.password) {
        userToUpdate.password_plaintext = updatedUser.password;
    }

    users[userIndex] = userToUpdate;
    await saveUsers(users);
};

const deleteUser = async (userId: string): Promise<void> => {
    const users = await getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    if (users.length === updatedUsers.length) {
        throw new Error("User not found for deletion.");
    }
    await saveUsers(updatedUsers);
};

export const userService = {
  getUsers,
  authenticateUser,
  addUser,
  updateUser,
  deleteUser
};
