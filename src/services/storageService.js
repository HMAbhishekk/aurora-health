import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: 'aurora_user',
  ONBOARDED: 'aurora_onboarded',
  HABITS: 'aurora_habits',
  STREAKS: 'aurora_streaks',
  HEALTH_PREFIX: 'aurora_health_',
  MEMORIES: 'aurora_memories',
  SETTINGS: 'aurora_settings',
};

export const storage = {
  // Generic
  set: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.log('Storage set error:', e);
      return false;
    }
  },

  get: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.log('Storage get error:', e);
      return null;
    }
  },

  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Health memories (for AI companion context)
  addMemory: async (memory) => {
    try {
      const existing = await AsyncStorage.getItem(KEYS.MEMORIES);
      const memories = existing ? JSON.parse(existing) : [];
      const newMemory = {
        id: Date.now().toString(),
        content: memory,
        createdAt: new Date().toISOString(),
      };
      const updated = [newMemory, ...memories].slice(0, 50); // keep last 50
      await AsyncStorage.setItem(KEYS.MEMORIES, JSON.stringify(updated));
      return newMemory;
    } catch (e) {
      console.log('Memory error:', e);
    }
  },

  getMemories: async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.MEMORIES);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : {
        notifications: true,
        hydrationReminders: true,
        sleepReminders: true,
        habitReminders: true,
        units: 'metric',
      };
    } catch (e) {
      return {};
    }
  },

  saveSettings: async (settings) => {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      return false;
    }
  },

  // Clear all app data
  clearAll: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const auroraKeys = keys.filter(k => k.startsWith('aurora_'));
      await AsyncStorage.multiRemove(auroraKeys);
      return true;
    } catch (e) {
      return false;
    }
  },
};

export { KEYS };