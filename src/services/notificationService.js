import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestPermission = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
};

export const cancelAll = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}
};

export const notify = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  } catch (e) {
    console.log('Notify error:', e);
  }
};

const scheduleDailyAt = async (hour, minute, title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: { hour, minute, repeats: true },
    });
  } catch (e) {
    console.log('Schedule error:', e);
  }
};

export const setupNotifications = async (user) => {
  try {
    const granted = await requestPermission();
    if (!granted) return false;

    await cancelAll();

    const firstName = user?.name?.split(' ')[0] || 'there';

    // Morning greeting
    await scheduleDailyAt(7, 0,
      `🌅 Good morning, ${firstName}!`,
      "Your daily health journey starts now. Let's make today count!",
      { screen: 'Home' }
    );

    // Hydration reminders
    const waterHours = [8, 10, 12, 14, 16, 18, 20];
    for (const hour of waterHours) {
      await scheduleDailyAt(hour, 0,
        '💧 Hydration Reminder',
        hour < 12
          ? 'Start your morning strong — drink a glass of water!'
          : hour < 17
          ? 'Afternoon check — staying hydrated keeps your energy up!'
          : 'Evening push — almost at your daily water goal!',
        { screen: 'Hydration' }
      );
    }

    // Midday habit check
    await scheduleDailyAt(12, 30,
      '✅ Habit Check-in',
      'Have you completed your habits today? Small steps, big results!',
      { screen: 'Habits' }
    );

    // Evening habit push
    await scheduleDailyAt(18, 0,
      "🔥 Don't break your streak!",
      'Your habits are waiting. Complete them before the day ends!',
      { screen: 'Habits' }
    );

    // Sleep log reminder
    await scheduleDailyAt(21, 0,
      '🌙 Log your sleep',
      "Don't forget to log today's sleep so Aurora can track your patterns.",
      { screen: 'Sleep' }
    );

    // Bedtime reminder
    await scheduleDailyAt(22, 0,
      '😴 Bedtime Reminder',
      "Time to wind down. A great night's sleep starts now.",
      { screen: 'Sleep' }
    );

    // Weekly summary every Sunday 9am
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Your Weekly Health Summary',
        body: 'Your week is complete! Open Aurora to see your progress.',
        data: { screen: 'Home' },
        sound: true,
      },
      trigger: {
        weekday: 1,
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    return true;
  } catch (e) {
    console.log('Notification setup error:', e);
    return false;
  }
};

export const checkGoalsAndNotify = async (todayData, habits) => {
  try {
    const hour = new Date().getHours();
    const todayStr = new Date().toISOString().split('T')[0];
    const hydPct = Math.round((todayData.hydration.consumed / todayData.hydration.goal) * 100);

    // Hydration goal reached
    if (todayData.hydration.consumed >= todayData.hydration.goal) {
      await notify(
        '🎉 Hydration Goal Crushed!',
        "You've hit your water goal for today! Aurora is proud of you!"
      );
      return;
    }

    // Evening hydration warning
    if (hour >= 20 && hydPct < 75) {
      const remaining = todayData.hydration.goal - todayData.hydration.consumed;
      await notify(
        '💧 Hydration Goal at Risk!',
        `Only ${remaining}ml left to reach your goal. Drink up before bed!`
      );
    }

    // All habits done
    const allDone = habits.length > 0 &&
      habits.every(h => h.completedDates?.includes(todayStr));
    if (allDone) {
      await notify(
        '🔥 All Habits Complete!',
        'You crushed every habit today! Your streak keeps growing!'
      );
      return;
    }

    // Evening pending habits warning
    if (hour >= 19) {
      const pending = habits.filter(h => !h.completedDates?.includes(todayStr));
      if (pending.length > 0) {
        await notify(
          `✅ ${pending.length} Habit${pending.length > 1 ? 's' : ''} Remaining`,
          `"${pending[0].name}"${pending.length > 1 ? ` and ${pending.length - 1} more` : ''} still need attention today!`
        );
      }
    }

    // Sleep not logged by afternoon
    if (hour >= 14 && !todayData.sleep.logged) {
      await notify(
        '🌙 Sleep Log Missing',
        "You haven't logged last night's sleep yet. Help Aurora understand your patterns!"
      );
    }

  } catch (e) {
    console.log('Goal check error:', e);
  }
};

export const sendWeeklySummary = async (todayData, habits, streaks, user) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const doneHabits = habits.filter(h => h.completedDates?.includes(todayStr)).length;
    const hydPct = Math.round((todayData.hydration.consumed / todayData.hydration.goal) * 100);
    const topStreak = Object.values(streaks).length > 0 ? Math.max(...Object.values(streaks)) : 0;
    const firstName = user?.name?.split(' ')[0] || 'Champion';

    await notify(
      `📊 Weekly Summary, ${firstName}!`,
      `Hydration: ${hydPct}% • Habits: ${doneHabits}/${habits.length} done • Best streak: ${topStreak} days 🔥`
    );
  } catch (e) {
    console.log('Weekly summary error:', e);
  }
};