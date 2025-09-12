import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password_plaintext: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
      sessionStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password_plaintext: string): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
            const foundUser = await userService.authenticateUser(email, password_plaintext);
            if (foundUser) {
              const { password, ...userToStore } = foundUser;
              setUser(userToStore);
              sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
              setIsLoading(false);
              resolve();
            } else {
              setIsLoading(false);
              reject(new Error('error.login.invalidCredentials'));
            }
        } catch (error) {
            setIsLoading(false);
            reject(new Error('error.login.invalidCredentials'));
        }
      }, 500); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
    // For simplicity, navigating to home. A router would handle this better.
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};