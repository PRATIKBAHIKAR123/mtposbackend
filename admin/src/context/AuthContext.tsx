import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../api/firebase';
import { adminApi } from '../api/admin.api';
import type { User } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  adminProfile: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  devBypassLogin: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [adminProfile, setAdminProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await adminApi.getMe();
      if (profile.systemRole === 'admin') {
        setAdminProfile(profile);
      } else {
        setAdminProfile(null);
        throw new Error('Access Denied: You do not have system administrator privileges.');
      }
    } catch (err: any) {
      console.warn('Profile fetch warning:', err);
      // If unauthorized, clear
      if (err.message?.includes('Access Denied')) {
        throw err;
      }
    }
  };

  useEffect(() => {
    // Check if dev token exists in localStorage
    const localToken = localStorage.getItem('admin_token');
    const localUser = localStorage.getItem('admin_profile');

    if (localToken && localUser) {
      try {
        const parsed = JSON.parse(localUser);
        setAdminProfile(parsed);
      } catch {
        localStorage.removeItem('admin_profile');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem('admin_token', token);
          await fetchProfile();
        } catch (error) {
          console.error('Failed to verify admin status:', error);
          await signOut(auth);
          localStorage.removeItem('admin_token');
          setAdminProfile(null);
        }
      } else if (!localToken) {
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      localStorage.setItem('admin_token', token);
      await fetchProfile();
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      localStorage.setItem('admin_token', token);
      await fetchProfile();
    } finally {
      setLoading(false);
    }
  };

  // Useful for local environments or testing with custom backend tokens
  const devBypassLogin = async (email = 'admin@pos-platform.local') => {
    setLoading(true);
    try {
      const mockProfile: User = {
        id: 'dev-admin-uid',
        email,
        displayName: 'Platform Admin',
        systemRole: 'admin',
        status: 'active',
      };
      localStorage.setItem('admin_token', 'dev-mock-admin-token');
      localStorage.setItem('admin_profile', JSON.stringify(mockProfile));
      setAdminProfile(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_profile');
      setFirebaseUser(null);
      setAdminProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = adminProfile?.systemRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        adminProfile,
        loading,
        isAdmin,
        loginWithEmail,
        loginWithGoogle,
        devBypassLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
