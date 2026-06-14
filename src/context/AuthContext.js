import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveProfile, getProfile } from '../services/dbService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('aurora_user');
      const onboarded = await AsyncStorage.getItem('aurora_onboarded');
      if (storedUser) setUser(JSON.parse(storedUser));
      if (onboarded === 'true') setIsOnboarded(true);
    } catch (e) {
      console.log('Auth load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const existingAccounts = await AsyncStorage.getItem('aurora_accounts');
      const accounts = existingAccounts ? JSON.parse(existingAccounts) : {};

      if (accounts[email.toLowerCase()]) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newUser = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        name,
        createdAt: new Date().toISOString(),
      };

      accounts[email.toLowerCase()] = { password, user: newUser };
      await AsyncStorage.setItem('aurora_accounts', JSON.stringify(accounts));
      await AsyncStorage.setItem('aurora_user', JSON.stringify(newUser));

      // Save to Supabase
      await saveProfile(newUser);

      setUser(newUser);
      setIsOnboarded(false);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const existingAccounts = await AsyncStorage.getItem('aurora_accounts');
      const accounts = existingAccounts ? JSON.parse(existingAccounts) : {};
      const account = accounts[email.toLowerCase()];

      if (!account) return { success: false, error: 'No account found. Please sign up.' };
      if (account.password !== password) return { success: false, error: 'Incorrect password.' };

      // Try to get latest profile from Supabase
      const cloudProfile = await getProfile(account.user.id);
      const finalUser = cloudProfile ? {
        ...account.user,
        name: cloudProfile.name,
        age: cloudProfile.age,
        gender: cloudProfile.gender,
        height: cloudProfile.height,
        weight: cloudProfile.weight,
        activity: cloudProfile.activity,
        goals: cloudProfile.goals,
        wakeTime: cloudProfile.wake_time,
        bedTime: cloudProfile.bed_time,
      } : account.user;

      await AsyncStorage.setItem('aurora_user', JSON.stringify(finalUser));

      const onboardedKey = 'aurora_onboarded_' + account.user.id;
      const onboarded = await AsyncStorage.getItem(onboardedKey);

      setUser(finalUser);
      setIsOnboarded(onboarded === 'true');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('aurora_user');
      await AsyncStorage.removeItem('aurora_onboarded');
      setUser(null);
      setIsOnboarded(false);
    } catch (e) {
      console.log('Sign out error:', e);
    }
  };

  const completeOnboarding = async (profileData) => {
    try {
      const updatedUser = { ...user, ...profileData, onboardedAt: new Date().toISOString() };

      const existingAccounts = await AsyncStorage.getItem('aurora_accounts');
      const accounts = existingAccounts ? JSON.parse(existingAccounts) : {};
      if (accounts[updatedUser.email]) {
        accounts[updatedUser.email].user = updatedUser;
        await AsyncStorage.setItem('aurora_accounts', JSON.stringify(accounts));
      }

      await AsyncStorage.setItem('aurora_user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('aurora_onboarded', 'true');
      await AsyncStorage.setItem('aurora_onboarded_' + updatedUser.id, 'true');

      // Save to Supabase
      await saveProfile(updatedUser);

      setUser(updatedUser);
      setIsOnboarded(true);
    } catch (e) {
      console.log('Onboarding error:', e);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('aurora_user', JSON.stringify(updatedUser));
      await saveProfile(updatedUser);
      setUser(updatedUser);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Social login — remembers one account per provider per device
  const socialAuth = async (provider) => {
    try {
      const storedKey = `aurora_social_${provider}`;
      const stored = await AsyncStorage.getItem(storedKey);

      if (stored) {
        // Existing social account — sign back in
        const { email, password } = JSON.parse(stored);
        return await signIn(email, password);
      } else {
        // First time — create new social account
        const email = `${provider}_user_${Date.now()}@${provider === 'google' ? 'gmail.com' : 'icloud.com'}`;
        const password = `${provider}_oauth_${Date.now()}`;
        const name = provider === 'google' ? 'Google User' : 'Apple User';

        const result = await signUp(email, password, name);
        if (result.success) {
          await AsyncStorage.setItem(storedKey, JSON.stringify({ email, password }));
        }
        return result;
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isOnboarded,
      signUp, signIn, signOut,
      completeOnboarding, updateProfile, socialAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};