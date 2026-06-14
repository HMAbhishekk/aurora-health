import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { today } from '../utils/dateUtils';
import { useAuth } from './AuthContext';
import {
  saveHealthLog, getHealthLog,
  saveHabits, getHabits,
  saveStreaks, getStreaks,
} from '../services/dbService';

const HealthContext = createContext();

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) throw new Error('useHealth must be used within HealthProvider');
  return context;
};

const defaultDayData = () => ({
  date: today(),
  hydration: { consumed: 0, goal: 2500, logs: [] },
  sleep: { hours: 0, bedtime: null, wakeTime: null, logged: false },
  nutrition: { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
});

export const HealthProvider = ({ children }) => {
  const { user } = useAuth();
  const [todayData, setTodayData] = useState(defaultDayData());
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [insights, setInsights] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadHealthData(user.id);
    } else {
      setTodayData(defaultDayData());
      setHabits([]);
      setStreaks({});
      setInsights([]);
    }
  }, [user?.id]);

  const userKey = (key) => `aurora_${user?.id}_${key}`;

  const loadHealthData = async (userId) => {
    setIsLoading(true);
    try {
      const [cloudLog, cloudHabits, cloudStreaks] = await Promise.all([
        getHealthLog(userId, today()),
        getHabits(userId),
        getStreaks(userId),
      ]);

      if (cloudLog) {
        setTodayData(cloudLog);
      } else {
        const local = await AsyncStorage.getItem(`aurora_${userId}_health_${today()}`);
        if (local) setTodayData(JSON.parse(local));
        else setTodayData(defaultDayData());
      }

      if (cloudHabits.length > 0) {
        setHabits(cloudHabits);
      } else {
        const local = await AsyncStorage.getItem(`aurora_${userId}_habits`);
        if (local) setHabits(JSON.parse(local));
      }

      if (Object.keys(cloudStreaks).length > 0) {
        setStreaks(cloudStreaks);
      } else {
        const local = await AsyncStorage.getItem(`aurora_${userId}_streaks`);
        if (local) setStreaks(JSON.parse(local));
      }

    } catch (e) {
      console.log('Health load error:', e);
      const local = await AsyncStorage.getItem(`aurora_${userId}_health_${today()}`);
      if (local) setTodayData(JSON.parse(local));
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodayData = async (data) => {
    if (!user?.id) return;
    await AsyncStorage.setItem(`aurora_${user.id}_health_${today()}`, JSON.stringify(data));
    saveHealthLog(user.id, today(), data).catch(e => console.log('Supabase sync error:', e));
  };

  // ── HYDRATION ──
  const addWater = async (ml) => {
    const updated = {
      ...todayData,
      hydration: {
        ...todayData.hydration,
        consumed: todayData.hydration.consumed + ml,
        logs: [...todayData.hydration.logs, { ml, time: new Date().toISOString() }],
      },
    };
    setTodayData(updated);
    await saveTodayData(updated);
    await updateStreak('hydration', updated.hydration.consumed >= updated.hydration.goal);
    generateInsights(updated, habits);
    try {
      const { checkGoalsAndNotify } = require('../services/notificationService');
      await checkGoalsAndNotify(updated, habits);
    } catch (e) {}
  };

  const setHydrationGoal = async (goal) => {
    const updated = { ...todayData, hydration: { ...todayData.hydration, goal } };
    setTodayData(updated);
    await saveTodayData(updated);
  };

  // ── SLEEP ──
  const logSleep = async (hours, bedtime, wakeTime) => {
    const updated = {
      ...todayData,
      sleep: { hours, bedtime, wakeTime, logged: true, loggedAt: new Date().toISOString() },
    };
    setTodayData(updated);
    await saveTodayData(updated);
    await updateStreak('sleep', hours >= 7);
    generateInsights(updated, habits);
  };

  // ── HABITS ──
  const createHabit = async (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      name: habit.name,
      icon: habit.icon || '⭐',
      frequency: habit.frequency || 'daily',
      createdAt: new Date().toISOString(),
      streak: 0,
      completedDates: [],
      skippedDates: [],
      paused: false,
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    await AsyncStorage.setItem(userKey('habits'), JSON.stringify(updatedHabits));
    saveHabits(user.id, updatedHabits).catch(e => console.log('Habit sync error:', e));
    return newHabit;
  };

  const completeHabit = async (habitId) => {
    const updatedHabits = habits.map(h => {
      if (h.id !== habitId) return h;
      if (h.completedDates.includes(today())) return h;
      return {
        ...h,
        completedDates: [...h.completedDates, today()],
        streak: h.streak + 1,
        lastCompleted: today(),
      };
    });
    setHabits(updatedHabits);
    await AsyncStorage.setItem(userKey('habits'), JSON.stringify(updatedHabits));
    saveHabits(user.id, updatedHabits).catch(e => console.log('Habit sync error:', e));
    generateInsights(todayData, updatedHabits);
    try {
      const { checkGoalsAndNotify } = require('../services/notificationService');
      await checkGoalsAndNotify(todayData, updatedHabits);
    } catch (e) {}
  };

  const deleteHabit = async (habitId) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    await AsyncStorage.setItem(userKey('habits'), JSON.stringify(updatedHabits));
    saveHabits(user.id, updatedHabits).catch(e => console.log('Habit sync error:', e));
  };

  const skipHabit = async (habitId) => {
    const updatedHabits = habits.map(h => {
      if (h.id !== habitId) return h;
      if (h.skippedDates?.includes(today())) return h;
      return {
        ...h,
        skippedDates: [...(h.skippedDates || []), today()],
      };
    });
    setHabits(updatedHabits);
    await AsyncStorage.setItem(userKey('habits'), JSON.stringify(updatedHabits));
    saveHabits(user.id, updatedHabits).catch(e => console.log('Habit sync error:', e));
  };

  const togglePauseHabit = async (habitId) => {
    const updatedHabits = habits.map(h => {
      if (h.id !== habitId) return h;
      return { ...h, paused: !h.paused };
    });
    setHabits(updatedHabits);
    await AsyncStorage.setItem(userKey('habits'), JSON.stringify(updatedHabits));
    saveHabits(user.id, updatedHabits).catch(e => console.log('Habit sync error:', e));
  };

  const editHabit = async (habitId, updates) => {
    const updatedHabits = habits.map(h => {
      if (h.id !== habitId) return h;
      return { ...h, ...updates };
    });
    setHabits(updatedHabits);
    await AsyncStorage.setItem(userKey('habits'), JSON.stringify(updatedHabits));
    saveHabits(user.id, updatedHabits).catch(e => console.log('Habit sync error:', e));
  };

  const isHabitDoneToday = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.completedDates.includes(today()) : false;
  };

  const isHabitSkippedToday = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? (habit.skippedDates || []).includes(today()) : false;
  };

  // ── NUTRITION ──
  const logMeal = async (meal) => {
    const newMeal = {
      id: Date.now().toString(),
      type: meal.type,
      name: meal.name,
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      loggedAt: new Date().toISOString(),
    };
    const updatedMeals = [...todayData.nutrition.meals, newMeal];
    const totals = updatedMeals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const updated = { ...todayData, nutrition: { meals: updatedMeals, totals } };
    setTodayData(updated);
    await saveTodayData(updated);
  };

  // ── STREAKS ──
  const updateStreak = async (type, goalMet) => {
    const updatedStreaks = {
      ...streaks,
      [type]: goalMet ? (streaks[type] || 0) + 1 : streaks[type] || 0,
    };
    setStreaks(updatedStreaks);
    await AsyncStorage.setItem(userKey('streaks'), JSON.stringify(updatedStreaks));
    saveStreaks(user.id, updatedStreaks).catch(e => console.log('Streak sync error:', e));
  };

  // ── INSIGHTS ──
  const generateInsights = (data = todayData, habitsList = habits) => {
    const newInsights = [];
    const doneHabits = habitsList.filter(h => h.completedDates?.includes(today())).length;

    if (data.hydration.consumed < data.hydration.goal * 0.5) {
      newInsights.push({ id: '1', type: 'hydration', message: "You're behind on hydration today. Try drinking 2 glasses in the next hour.", priority: 'high' });
    } else if (data.hydration.consumed >= data.hydration.goal) {
      newInsights.push({ id: '4', type: 'hydration', message: 'Hydration goal crushed today! Amazing consistency! 💧', priority: 'positive' });
    }

    if (!data.sleep.logged) {
      newInsights.push({ id: '2', type: 'sleep', message: "Don't forget to log your sleep. It helps Aurora give better insights.", priority: 'medium' });
    } else if (data.sleep.hours < 6) {
      newInsights.push({ id: '5', type: 'sleep', message: `You only slept ${data.sleep.hours}h. Try to get at least 7 hours tonight.`, priority: 'high' });
    }

    if (habitsList.length > 0 && doneHabits === habitsList.length) {
      newInsights.push({ id: '3', type: 'habits', message: "All habits completed today! You're on fire! 🔥", priority: 'positive' });
    }

    if (newInsights.length === 0) {
      newInsights.push({ id: '0', type: 'general', message: 'Keep up the great work today! Every healthy choice counts. 💪', priority: 'positive' });
    }

    setInsights(newInsights);
  };

  return (
    <HealthContext.Provider value={{
      todayData, weekData, habits, streaks,
      insights, isLoading,
      addWater, setHydrationGoal,
      logSleep, createHabit, completeHabit,
      deleteHabit, isHabitDoneToday,
      skipHabit, togglePauseHabit, editHabit, isHabitSkippedToday,
      logMeal, generateInsights, loadHealthData,
    }}>
      {children}
    </HealthContext.Provider>
  );
};