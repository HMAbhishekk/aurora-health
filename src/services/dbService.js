import { supabase } from './supabaseClient';

// ── PROFILES ─────────────────────────────────────────────

export const saveProfile = async (user) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activity: user.activity,
        goals: user.goals || [],
        wake_time: user.wakeTime || '07:00',
        bed_time: user.bedTime || '22:00',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.log('saveProfile error:', e.message);
    return { success: false, error: e.message };
  }
};

export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.log('getProfile error:', e.message);
    return null;
  }
};

// ── HEALTH LOGS ──────────────────────────────────────────

export const saveHealthLog = async (userId, date, todayData) => {
  try {
    const { error } = await supabase
      .from('health_logs')
      .upsert({
        user_id: userId,
        date,
        hydration_consumed: todayData.hydration.consumed,
        hydration_goal: todayData.hydration.goal,
        hydration_logs: todayData.hydration.logs,
        sleep_hours: todayData.sleep.hours,
        sleep_bedtime: todayData.sleep.bedtime,
        sleep_wake_time: todayData.sleep.wakeTime,
        sleep_logged: todayData.sleep.logged,
        nutrition_meals: todayData.nutrition.meals,
        nutrition_calories: todayData.nutrition.totals.calories,
        nutrition_protein: todayData.nutrition.totals.protein,
        nutrition_carbs: todayData.nutrition.totals.carbs,
        nutrition_fat: todayData.nutrition.totals.fat,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.log('saveHealthLog error:', e.message);
    return { success: false };
  }
};

export const getHealthLog = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    if (error) return null;
    return {
      date,
      hydration: {
        consumed: data.hydration_consumed,
        goal: data.hydration_goal,
        logs: data.hydration_logs || [],
      },
      sleep: {
        hours: data.sleep_hours,
        bedtime: data.sleep_bedtime,
        wakeTime: data.sleep_wake_time,
        logged: data.sleep_logged,
      },
      nutrition: {
        meals: data.nutrition_meals || [],
        totals: {
          calories: data.nutrition_calories,
          protein: data.nutrition_protein,
          carbs: data.nutrition_carbs,
          fat: data.nutrition_fat,
        },
      },
    };
  } catch (e) {
    console.log('getHealthLog error:', e.message);
    return null;
  }
};

export const getWeeklyLogs = async (userId) => {
  try {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .in('date', dates)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.log('getWeeklyLogs error:', e.message);
    return [];
  }
};

export const getMonthlyLogs = async (userId) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', firstDay)
      .lte('date', lastDay)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.log('getMonthlyLogs error:', e.message);
    return [];
  }
};

// ── HABITS ───────────────────────────────────────────────

export const saveHabits = async (userId, habits) => {
  try {
    await supabase.from('habits').delete().eq('user_id', userId);

    if (habits.length === 0) return { success: true };

    const { error } = await supabase
      .from('habits')
      .insert(habits.map(h => ({
        id: h.id,
        user_id: userId,
        name: h.name,
        icon: h.icon,
        frequency: h.frequency,
        streak: h.streak,
        completed_dates: h.completedDates || [],
        skipped_dates: h.skippedDates || [],
        paused: h.paused || false,
        last_completed: h.lastCompleted || null,
        created_at: h.createdAt,
      })));

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.log('saveHabits error:', e.message);
    return { success: false };
  }
};

export const getHabits = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(h => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      frequency: h.frequency,
      streak: h.streak,
      completedDates: h.completed_dates || [],
      skippedDates: h.skipped_dates || [],
      paused: h.paused || false,
      lastCompleted: h.last_completed,
      createdAt: h.created_at,
    }));
  } catch (e) {
    console.log('getHabits error:', e.message);
    return [];
  }
};

// ── STREAKS ──────────────────────────────────────────────

export const saveStreaks = async (userId, streaks) => {
  try {
    const { error } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        hydration: streaks.hydration || 0,
        sleep: streaks.sleep || 0,
        habits: streaks.habits || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.log('saveStreaks error:', e.message);
    return { success: false };
  }
};

export const getStreaks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return {};
    return {
      hydration: data.hydration || 0,
      sleep: data.sleep || 0,
      habits: data.habits || 0,
    };
  } catch (e) {
    console.log('getStreaks error:', e.message);
    return {};
  }
};

// ── MEMORIES ─────────────────────────────────────────────

export const saveMemory = async (userId, content) => {
  try {
    const { error } = await supabase
      .from('memories')
      .insert({ user_id: userId, content });
    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.log('saveMemory error:', e.message);
    return { success: false };
  }
};

export const getMemories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.log('getMemories error:', e.message);
    return [];
  }
};