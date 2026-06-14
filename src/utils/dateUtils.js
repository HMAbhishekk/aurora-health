export const today = () => new Date().toISOString().split('T')[0];

export const thisWeekDates = () => {
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

export const getDayName = (dateStr) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
};

export const isToday = (dateStr) => dateStr === today();

export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
};

export const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};