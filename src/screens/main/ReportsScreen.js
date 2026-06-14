import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

// ── Animated Bar Item ────────────────────────────────────
function BarItem({ value, label, color, max, index }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);

  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: pct, friction: 8, delay: index * 60, useNativeDriver: false,
    }).start();
  }, [pct]);

  const barHeight = barAnim.interpolate({
    inputRange: [0, 100], outputRange: ['0%', '100%'],
  });

  return (
    <View style={chart.barWrap}>
      <Text style={chart.value}>{value > 0 ? value : ''}</Text>
      <View style={chart.barTrack}>
        <Animated.View style={[chart.bar, { height: barHeight, backgroundColor: color }]} />
      </View>
      <Text style={chart.label}>{label}</Text>
    </View>
  );
}

// ── Bar Chart ────────────────────────────────────────────
function BarChart({ data, color, maxValue }) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <View style={chart.container}>
      {data.map((item, i) => (
        <BarItem key={i} value={item.value} label={item.label} color={color} max={max} index={i} />
      ))}
    </View>
  );
}

const chart = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: 8 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barTrack: { width: '100%', height: 80, justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 6 },
  value: { fontSize: 9, color: 'rgba(248,248,255,0.5)', textAlign: 'center' },
  label: { fontSize: 9, color: 'rgba(248,248,255,0.4)', textAlign: 'center' },
});

// ── Ring Progress ────────────────────────────────────────
function RingProgress({ percentage, color, size = 80, label, value }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: percentage, duration: 1000, useNativeDriver: false }).start();
  }, [percentage]);

  return (
    <View style={ring.container}>
      <View style={[ring.outer, { width: size, height: size, borderRadius: size / 2, borderColor: color + '25' }]}>
        <View style={[ring.inner, { backgroundColor: color + '15' }]}>
          <Text style={[ring.value, { color, fontSize: size * 0.22 }]}>{value}</Text>
          <Text style={ring.sublabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const ring = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  outer: { borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  inner: { width: '80%', height: '80%', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '800' },
  sublabel: { fontSize: 9, color: 'rgba(248,248,255,0.4)', textAlign: 'center' },
});

// ── Stat Tile ────────────────────────────────────────────
function StatTile({ icon, label, value, sub, color }) {
  return (
    <LinearGradient colors={[color + '18', color + '05']} style={tile.container}>
      <Text style={tile.icon}>{icon}</Text>
      <Text style={[tile.value, { color }]}>{value}</Text>
      <Text style={tile.label}>{label}</Text>
      {sub ? <Text style={tile.sub}>{sub}</Text> : null}
    </LinearGradient>
  );
}

const tile = StyleSheet.create({
  container: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  icon: { fontSize: 22 },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 11, color: 'rgba(248,248,255,0.4)', textAlign: 'center' },
  sub: { fontSize: 10, color: 'rgba(248,248,255,0.25)', textAlign: 'center' },
});

// ── Badges Section ───────────────────────────────────────
const ALL_BADGES = [
  { id: 'first', emoji: '🌱', label: 'First Step', desc: 'Complete your first habit', check: (s) => s.totalCompletions >= 1 },
  { id: '3day', emoji: '💪', label: '3 Day Streak', desc: 'Maintain a 3-day streak', check: (s) => s.maxStreak >= 3 },
  { id: '7day', emoji: '✨', label: 'Week Warrior', desc: '7-day streak achieved', check: (s) => s.maxStreak >= 7 },
  { id: '14day', emoji: '⚡', label: 'Two Weeks Strong', desc: '14-day streak achieved', check: (s) => s.maxStreak >= 14 },
  { id: '30day', emoji: '🔥', label: 'Monthly Master', desc: '30-day streak achieved', check: (s) => s.maxStreak >= 30 },
  { id: 'hydro7', emoji: '💧', label: 'Hydration Hero', desc: 'Hit hydration goal 5+ days this week', check: (s) => s.hydrationGoalDays >= 5 },
  { id: 'sleep7', emoji: '🌙', label: 'Sleep Champion', desc: '7+ hrs sleep 5+ days this week', check: (s) => s.goodSleepDays >= 5 },
  { id: 'perfect', emoji: '🏆', label: 'Perfect Day', desc: 'All habits completed today', check: (s) => s.allHabitsDone },
];

function BadgesSection({ stats }) {
  const earned = ALL_BADGES.filter(b => b.check(stats));
  const locked = ALL_BADGES.filter(b => !b.check(stats));

  return (
    <View style={styles.badgesCard}>
      <Text style={styles.badgesTitle}>🏅 Achievements ({earned.length}/{ALL_BADGES.length})</Text>
      <View style={styles.badgesGrid}>
        {earned.map(b => (
          <View key={b.id} style={[styles.badgeItem, styles.badgeEarned]}>
            <Text style={styles.badgeEmoji}>{b.emoji}</Text>
            <Text style={styles.badgeLabel}>{b.label}</Text>
          </View>
        ))}
        {locked.map(b => (
          <View key={b.id} style={[styles.badgeItem, styles.badgeLocked]}>
            <Text style={[styles.badgeEmoji, { opacity: 0.3 }]}>{b.emoji}</Text>
            <Text style={[styles.badgeLabel, { opacity: 0.3 }]}>{b.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────
export default function ReportsScreen() {
  const { user } = useAuth();
  const { habits, streaks, todayData } = useHealth();
  const [tab, setTab] = useState('weekly');
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, [user?.id]);

  const loadWeeklyData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const key = `aurora_${user.id}_health_${dateStr}`;
        const stored = await AsyncStorage.getItem(key);
        const data = stored ? JSON.parse(stored) : null;
        days.push({
          date: dateStr,
          label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
          hydration: data?.hydration?.consumed || 0,
          hydrationGoal: data?.hydration?.goal || 2500,
          sleep: data?.sleep?.hours || 0,
          sleepLogged: data?.sleep?.logged || false,
          calories: data?.nutrition?.totals?.calories || 0,
          mealsLogged: data?.nutrition?.meals?.length || 0,
        });
      }
      setWeeklyData(days);
    } catch (e) {
      console.log('Load weekly error:', e);
    } finally {
      setLoading(false);
    }
  };

  const avgHydration = weeklyData.length
    ? Math.round(weeklyData.reduce((s, d) => s + d.hydration, 0) / weeklyData.length) : 0;
  const avgSleep = weeklyData.length
    ? (weeklyData.filter(d => d.sleep > 0).reduce((s, d) => s + d.sleep, 0) /
      Math.max(weeklyData.filter(d => d.sleep > 0).length, 1)).toFixed(1) : 0;
  const hydrationGoalDays = weeklyData.filter(d => d.hydration >= d.hydrationGoal).length;
  const goodSleepDays = weeklyData.filter(d => d.sleep >= 7).length;
  const totalCalories = weeklyData.reduce((s, d) => s + d.calories, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const doneHabits = habits.filter(h => h.completedDates?.includes(todayStr)).length;
  const habitCompletionRate = habits.length > 0
    ? Math.round((doneHabits / habits.length) * 100) : 0;

  const consistencyScore = Math.round(
    (hydrationGoalDays / 7 * 35) +
    (goodSleepDays / 7 * 35) +
    (habitCompletionRate / 100 * 30)
  );

  const hydrationChartData = weeklyData.map(d => ({
    label: d.label,
    value: Math.round(d.hydration / 100) * 100,
  }));

  const sleepChartData = weeklyData.map(d => ({
    label: d.label,
    value: parseFloat(d.sleep.toFixed(1)),
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return colors.habits;
    if (score >= 60) return colors.accent;
    if (score >= 40) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent 🌟';
    if (score >= 60) return 'Good 💪';
    if (score >= 40) return 'Fair 📈';
    return 'Needs Work 🎯';
  };

  const monthlyInsights = [
    hydrationGoalDays >= 5 && '💧 Great hydration consistency this week!',
    goodSleepDays >= 5 && '🌙 You slept 7+ hours most nights!',
    doneHabits === habits.length && habits.length > 0 && '✅ All habits completed today!',
    Object.values(streaks).some(v => v >= 7) && '🔥 7+ day streak maintained!',
    parseFloat(avgSleep) < 6 && '⚠️ Try to improve sleep duration next week.',
    avgHydration < 1500 && '⚠️ Hydration needs improvement — aim for 2500ml daily.',
  ].filter(Boolean);

  const scoreColor = getScoreColor(consistencyScore);
  const maxStreak = Object.values(streaks).length > 0 ? Math.max(...Object.values(streaks)) : 0;

  const totalCompletions = habits.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0);
  const allHabitsDone = habits.length > 0 && habits.every(h => h.completedDates?.includes(todayStr));

  const badgeStats = {
    totalCompletions,
    maxStreak,
    hydrationGoalDays,
    goodSleepDays,
    allHabitsDone,
  };

  return (
    <LinearGradient colors={['#07071a', '#0a0a1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reports</Text>
            <Text style={styles.subtitle}>Your health at a glance</Text>
          </View>
          <View style={[styles.scoreBadge, { borderColor: scoreColor + '40' }]}>
            <Text style={[styles.scoreNum, { color: scoreColor }]}>{consistencyScore}</Text>
            <Text style={styles.scoreLabel}>score</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabWrap}>
          {['weekly', 'monthly'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Consistency Score Card */}
        <LinearGradient
          colors={[scoreColor + '20', scoreColor + '08']}
          style={[styles.scoreCard, { borderColor: scoreColor + '30' }]}
        >
          <View style={styles.scoreCardLeft}>
            <Text style={styles.scoreCardLabel}>CONSISTENCY SCORE</Text>
            <Text style={[styles.scoreCardValue, { color: scoreColor }]}>{consistencyScore}/100</Text>
            <Text style={[styles.scoreCardStatus, { color: scoreColor }]}>{getScoreLabel(consistencyScore)}</Text>
          </View>
          <View style={styles.scoreRings}>
            <RingProgress
              percentage={hydrationGoalDays / 7 * 100}
              color={colors.hydration}
              size={64}
              value={`${hydrationGoalDays}/7`}
              label="Hydration"
            />
            <RingProgress
              percentage={goodSleepDays / 7 * 100}
              color={colors.sleep}
              size={64}
              value={`${goodSleepDays}/7`}
              label="Sleep"
            />
          </View>
        </LinearGradient>

        {/* Stat tiles */}
        <View style={styles.tilesRow}>
          <StatTile icon="💧" label="Avg Hydration" value={`${avgHydration}ml`} sub="Goal: 2500ml" color={colors.hydration} />
          <StatTile icon="🌙" label="Avg Sleep" value={`${avgSleep}h`} sub="Target: 7h" color={colors.sleep} />
        </View>
        <View style={styles.tilesRow}>
          <StatTile icon="✅" label="Habits Today" value={`${doneHabits}/${habits.length}`} sub={`${habitCompletionRate}% done`} color={colors.habits} />
          <StatTile icon="🔥" label="Best Streak" value={`${maxStreak}d`} sub="Keep going!" color={colors.accent} />
        </View>

        {/* Hydration Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>💧 Hydration This Week</Text>
            <Text style={[styles.chartSub, { color: colors.hydration }]}>{avgHydration}ml avg</Text>
          </View>
          <BarChart data={hydrationChartData} color={colors.hydration} maxValue={3000} />
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: colors.hydration }]} />
            <Text style={styles.legendText}>Daily water intake (ml)</Text>
          </View>
        </View>

        {/* Sleep Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>🌙 Sleep This Week</Text>
            <Text style={[styles.chartSub, { color: colors.sleep }]}>{avgSleep}h avg</Text>
          </View>
          <BarChart data={sleepChartData} color={colors.sleep} maxValue={10} />
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: colors.sleep }]} />
            <Text style={styles.legendText}>Hours slept per night</Text>
          </View>
        </View>

        {/* Sleep Consistency */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🛏️ Sleep Consistency</Text>
          <View style={styles.consistencyRow}>
            {weeklyData.map((d, i) => (
              <View key={i} style={styles.consistencyDay}>
                <View style={[
                  styles.consistencyDot,
                  {
                    backgroundColor: !d.sleepLogged
                      ? 'rgba(255,255,255,0.08)'
                      : d.sleep >= 7
                      ? colors.success
                      : d.sleep >= 5
                      ? colors.warning
                      : colors.error,
                  },
                ]} />
                <Text style={styles.consistencyLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.consistencyLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>7h+</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>5-7h</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>&lt;5h</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
              <Text style={styles.legendText}>Not logged</Text>
            </View>
          </View>
        </View>

        {/* Monthly view */}
        {tab === 'monthly' && (
          <View style={styles.monthlyCard}>
            <Text style={styles.monthlyTitle}>📆 This Month (Projected)</Text>
            <View style={styles.monthlyGrid}>
              {[
                { label: 'Total Water', value: `${(avgHydration * 30 / 1000).toFixed(0)}L`, icon: '💧', color: colors.hydration },
                { label: 'Avg Sleep', value: `${avgSleep}h`, icon: '🌙', color: colors.sleep },
                { label: 'Calories', value: `${totalCalories}`, icon: '🍱', color: colors.nutrition },
                { label: 'Best Streak', value: `${maxStreak}d`, icon: '🔥', color: colors.accent },
              ].map(item => (
                <View key={item.label} style={styles.monthlyItem}>
                  <Text style={styles.monthlyIcon}>{item.icon}</Text>
                  <Text style={[styles.monthlyValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={styles.monthlyLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Aurora Insights */}
        {monthlyInsights.length > 0 && (
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>💡 Aurora's Insights</Text>
            {monthlyInsights.map((insight, i) => (
              <View key={i} style={styles.insightRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Focus Areas */}
        <View style={styles.improvCard}>
          <Text style={styles.improvTitle}>🎯 Focus Areas</Text>
          {avgHydration < 2000 && (
            <View style={styles.improvRow}>
              <Ionicons name="water-outline" size={16} color={colors.hydration} />
              <Text style={styles.improvText}>Increase daily water intake to 2500ml</Text>
            </View>
          )}
          {parseFloat(avgSleep) < 7 && (
            <View style={styles.improvRow}>
              <Ionicons name="moon-outline" size={16} color={colors.sleep} />
              <Text style={styles.improvText}>Aim for 7-8 hours of sleep nightly</Text>
            </View>
          )}
          {habitCompletionRate < 80 && habits.length > 0 && (
            <View style={styles.improvRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.habits} />
              <Text style={styles.improvText}>Complete all habits daily for better consistency</Text>
            </View>
          )}
          {avgHydration >= 2000 && parseFloat(avgSleep) >= 7 && habitCompletionRate >= 80 && (
            <View style={styles.improvRow}>
              <Ionicons name="trophy-outline" size={16} color={colors.accent} />
              <Text style={styles.improvText}>You're crushing all your goals! Keep it up! 🏆</Text>
            </View>
          )}
        </View>

        {/* Badges */}
        <BadgesSection stats={badgeStats} />

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8F8FF' },
  subtitle: { fontSize: 13, color: 'rgba(248,248,255,0.4)', marginTop: 2 },
  scoreBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, borderWidth: 1 },
  scoreNum: { fontSize: 24, fontWeight: '800' },
  scoreLabel: { fontSize: 10, color: 'rgba(248,248,255,0.4)' },
  tabWrap: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: 'rgba(248,248,255,0.4)', fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  scoreCard: { borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
  scoreCardLeft: { gap: 4 },
  scoreCardLabel: { fontSize: 10, color: 'rgba(248,248,255,0.4)', letterSpacing: 1.5, fontWeight: '600' },
  scoreCardValue: { fontSize: 36, fontWeight: '800' },
  scoreCardStatus: { fontSize: 14, fontWeight: '600' },
  scoreRings: { flexDirection: 'row', gap: 12 },
  tilesRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  chartCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 15, fontWeight: '600', color: '#F8F8FF' },
  chartSub: { fontSize: 13, fontWeight: '700' },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: 'rgba(248,248,255,0.35)' },
  consistencyRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  consistencyDay: { alignItems: 'center', gap: 6 },
  consistencyDot: { width: 28, height: 28, borderRadius: 14 },
  consistencyLabel: { fontSize: 10, color: 'rgba(248,248,255,0.4)' },
  consistencyLegendRow: { flexDirection: 'row', gap: 14, marginTop: 8, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  monthlyCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  monthlyTitle: { fontSize: 16, fontWeight: '600', color: '#F8F8FF', marginBottom: 16 },
  monthlyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  monthlyItem: { width: (width - 96) / 2, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, gap: 4 },
  monthlyIcon: { fontSize: 24 },
  monthlyValue: { fontSize: 20, fontWeight: '800' },
  monthlyLabel: { fontSize: 11, color: 'rgba(248,248,255,0.4)', textAlign: 'center' },
  insightsCard: { backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
  insightsTitle: { fontSize: 15, fontWeight: '600', color: '#F8F8FF', marginBottom: 14 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  insightDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6 },
  insightText: { flex: 1, fontSize: 14, color: 'rgba(248,248,255,0.7)', lineHeight: 20 },
  improvCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  improvTitle: { fontSize: 15, fontWeight: '600', color: '#F8F8FF', marginBottom: 14 },
  improvRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  improvText: { flex: 1, fontSize: 14, color: 'rgba(248,248,255,0.6)', lineHeight: 20 },
  badgesCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  badgesTitle: { fontSize: 15, fontWeight: '600', color: '#F8F8FF', marginBottom: 14 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeItem: { width: (width - 96) / 3, alignItems: 'center', borderRadius: 14, padding: 12, gap: 6, borderWidth: 1 },
  badgeEarned: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)' },
  badgeLocked: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' },
  badgeEmoji: { fontSize: 26 },
  badgeLabel: { fontSize: 10, color: 'rgba(248,248,255,0.6)', textAlign: 'center' },
});