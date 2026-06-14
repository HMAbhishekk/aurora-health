export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const calculatePercentage = (current, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
};

export const mlToLiters = (ml) => (ml / 1000).toFixed(1);

export const hoursToHHMM = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const getStreakEmoji = (streak) => {
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '⚡';
  if (streak >= 7)  return '✨';
  if (streak >= 3)  return '💪';
  return '🌱';
};

export const getMotivationalMessage = (percentage) => {
  if (percentage >= 100) return "Goal crushed! Amazing work! 🎉";
  if (percentage >= 75)  return "Almost there, keep going! 💪";
  if (percentage >= 50)  return "Halfway there, you're doing great!";
  if (percentage >= 25)  return "Good start, keep it up!";
  return "Every step counts, let's go!";
};