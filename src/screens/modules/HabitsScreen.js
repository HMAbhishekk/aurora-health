import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useHealth } from '../../context/HealthContext';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

function FireStreak({ streak }) {
  const flame1 = useRef(new Animated.Value(1)).current;
  const flame2 = useRef(new Animated.Value(0.8)).current;
  const flame3 = useRef(new Animated.Value(0.6)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.5)).current;

  const intensity = Math.min(streak / 30, 1);
  const size = 20 + intensity * 24;

  useEffect(() => {
    if (streak === 0) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(flame1, { toValue: 1.3, duration: 400, useNativeDriver: true }),
        Animated.timing(flame1, { toValue: 0.9, duration: 300, useNativeDriver: true }),
        Animated.timing(flame1, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flame2, { toValue: 1.1, duration: 300, useNativeDriver: true }),
        Animated.timing(flame2, { toValue: 0.7, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flame3, { toValue: 0.9, duration: 500, useNativeDriver: true }),
        Animated.timing(flame3, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 3, duration: 600, useNativeDriver: true }),
        Animated.timing(sway, { toValue: -3, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.9, duration: 500, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.4, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [streak]);

  if (streak === 0) return <Text style={fireStyles.noFire}>🌱</Text>;

  return (
    <View style={[fireStyles.container, { width: size + 16, height: size + 20 }]}>
      <Animated.View style={[fireStyles.glow, {
        width: size * 1.5, height: size * 1.5,
        borderRadius: size * 0.75,
        opacity: glow,
      }]} />
      <Animated.Text style={[fireStyles.flame, fireStyles.flame3, {
        fontSize: size * 0.9,
        transform: [{ scale: flame3 }, { translateX: sway }],
      }]}>🔥</Animated.Text>
      <Animated.Text style={[fireStyles.flame, fireStyles.flame2, {
        fontSize: size * 0.75,
        transform: [{ scale: flame2 }, { translateX: Animated.multiply(sway, -0.5) }],
      }]}>🔥</Animated.Text>
      <Animated.Text style={[fireStyles.flame, {
        fontSize: size * 0.6,
        transform: [{ scale: flame1 }],
      }]}>🔥</Animated.Text>
    </View>
  );
}

const fireStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glow: { position: 'absolute', backgroundColor: '#F59E0B' },
  flame: { position: 'absolute' },
  flame2: { opacity: 0.7 },
  flame3: { opacity: 0.5 },
  noFire: { fontSize: 20 },
});

const PRESET_HABITS = [
  { name: 'Meditation', icon: '🧘' },
  { name: 'Reading', icon: '📚' },
  { name: 'Walking', icon: '🚶' },
  { name: 'Stretching', icon: '🤸' },
  { name: 'Journaling', icon: '✍️' },
  { name: 'Supplements', icon: '💊' },
  { name: 'Cold Shower', icon: '🚿' },
  { name: 'Exercise', icon: '💪' },
];

const EMOJI_OPTIONS = ['⭐', '🧘', '📚', '🚶', '🤸', '✍️', '💊', '🚿', '💪', '🎯', '🌅', '🥗'];

export default function HabitsScreen() {
  const {
    habits, createHabit, completeHabit, deleteHabit,
    isHabitDoneToday, skipHabit, togglePauseHabit, editHabit, isHabitSkippedToday,
  } = useHealth();

  const [showModal, setShowModal] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('⭐');

  const [actionHabit, setActionHabit] = useState(null); // habit object for action sheet
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('⭐');

  const scaleAnims = useRef(habits.map(() => new Animated.Value(1))).current;

  const handleComplete = async (habitId, index) => {
    if (isHabitDoneToday(habitId)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const anim = scaleAnims[index] || new Animated.Value(1);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1.15, useNativeDriver: true, friction: 4 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();

    await completeHabit(habitId);
  };

  const handleCreate = async () => {
    if (!habitName.trim()) return;
    await createHabit({ name: habitName.trim(), icon: habitIcon });
    setHabitName('');
    setHabitIcon('⭐');
    setShowModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openActions = (habit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionHabit(habit);
    setEditName(habit.name);
    setEditIcon(habit.icon);
    setEditMode(false);
  };

  const handleSkip = async () => {
    await skipHabit(actionHabit.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActionHabit(null);
  };

  const handlePauseToggle = async () => {
    await togglePauseHabit(actionHabit.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActionHabit(null);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    await editHabit(actionHabit.id, { name: editName.trim(), icon: editIcon });
    setActionHabit(null);
    setEditMode(false);
  };

  const handleDelete = async () => {
    await deleteHabit(actionHabit.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setActionHabit(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeHabits = habits.filter(h => !h.paused);
  const pausedHabits = habits.filter(h => h.paused);
  const doneCount = activeHabits.filter(h => h.completedDates?.includes(todayStr)).length;
  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  return (
    <LinearGradient colors={['#07071a', '#0a1a07']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Habits</Text>
            <Text style={styles.subtitle}>{doneCount}/{activeHabits.length} done today</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <LinearGradient colors={[colors.habits, '#059669']} style={styles.addBtnGradient}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Total streak */}
        {totalStreak > 0 && (
          <View style={styles.totalStreakCard}>
            <View style={styles.totalStreakLeft}>
              <Text style={styles.totalStreakValue}>{totalStreak}</Text>
              <Text style={styles.totalStreakLabel}>Total Streak Days</Text>
            </View>
            <FireStreak streak={Math.min(totalStreak, 30)} />
          </View>
        )}

        {/* Empty state */}
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>Start building your first healthy habit today</Text>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <LinearGradient colors={[colors.habits, '#059669']} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Create First Habit</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeHabits.map((habit, index) => {
              const done = isHabitDoneToday(habit.id);
              const skipped = isHabitSkippedToday(habit.id);
              const anim = scaleAnims[index] || new Animated.Value(1);
              return (
                <Animated.View key={habit.id} style={[styles.habitWrap, { transform: [{ scale: anim }] }]}>
                  <TouchableOpacity
                    style={[styles.habitCard, done && styles.habitCardDone, skipped && styles.habitCardSkipped]}
                    onPress={() => handleComplete(habit.id, index)}
                    onLongPress={() => openActions(habit)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={done
                        ? ['rgba(52,211,153,0.15)', 'rgba(52,211,153,0.05)']
                        : skipped
                        ? ['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.03)']
                        : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                      style={styles.habitGradient}
                    >
                      <Text style={styles.habitIcon}>{habit.icon}</Text>
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitName, done && styles.habitNameDone]}>
                          {habit.name}
                        </Text>
                        <Text style={styles.habitStreak}>
                          {skipped ? 'Skipped today' : habit.streak > 0 ? `${habit.streak} day streak` : 'Start today!'}
                        </Text>
                      </View>

                      <View style={styles.fireWrap}>
                        <FireStreak streak={habit.streak} />
                      </View>

                      <View style={[styles.checkCircle, done && styles.checkCircleDone, skipped && styles.checkCircleSkipped]}>
                        {done && <Text style={styles.checkMark}>✓</Text>}
                        {skipped && !done && <Text style={styles.checkMark}>—</Text>}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {/* Paused habits */}
            {pausedHabits.length > 0 && (
              <>
                <Text style={styles.pausedTitle}>⏸ Paused</Text>
                {pausedHabits.map(habit => (
                  <TouchableOpacity
                    key={habit.id}
                    style={styles.pausedCard}
                    onLongPress={() => openActions(habit)}
                    onPress={() => openActions(habit)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pausedIcon}>{habit.icon}</Text>
                    <Text style={styles.pausedName}>{habit.name}</Text>
                    <Text style={styles.pausedTap}>Tap to resume</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        <Text style={styles.hint}>Long press a habit for more options</Text>
      </ScrollView>

      {/* Add habit modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Habit</Text>

            <Text style={styles.modalLabel}>Quick add</Text>
            <View style={styles.presetsGrid}>
              {PRESET_HABITS.map(p => (
                <TouchableOpacity
                  key={p.name}
                  style={[styles.presetChip, habitName === p.name && styles.presetChipActive]}
                  onPress={() => { setHabitName(p.name); setHabitIcon(p.icon); }}
                >
                  <Text style={styles.presetEmoji}>{p.icon}</Text>
                  <Text style={[styles.presetText, habitName === p.name && styles.presetTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Or custom name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Morning Run"
              placeholderTextColor={colors.textMuted}
              value={habitName}
              onChangeText={setHabitName}
            />

            <TouchableOpacity onPress={handleCreate}>
              <LinearGradient colors={[colors.habits, '#059669']} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Create Habit ✓</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action sheet modal */}
      <Modal visible={!!actionHabit} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {actionHabit && !editMode && (
              <>
                <View style={styles.actionHeader}>
                  <Text style={styles.actionEmoji}>{actionHabit.icon}</Text>
                  <Text style={styles.modalTitle}>{actionHabit.name}</Text>
                </View>

                <TouchableOpacity style={styles.actionRow} onPress={() => setEditMode(true)}>
                  <Text style={styles.actionIcon}>✏️</Text>
                  <Text style={styles.actionLabel}>Edit habit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={handleSkip}>
                  <Text style={styles.actionIcon}>⏭️</Text>
                  <Text style={styles.actionLabel}>Skip today (keeps streak)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={handlePauseToggle}>
                  <Text style={styles.actionIcon}>{actionHabit.paused ? '▶️' : '⏸️'}</Text>
                  <Text style={styles.actionLabel}>{actionHabit.paused ? 'Resume habit' : 'Pause habit'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={handleDelete}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                  <Text style={[styles.actionLabel, { color: colors.error }]}>Delete habit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActionHabit(null)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {actionHabit && editMode && (
              <>
                <Text style={styles.modalTitle}>Edit Habit</Text>

                <Text style={styles.modalLabel}>Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.modalLabel}>Icon</Text>
                <View style={styles.presetsGrid}>
                  {EMOJI_OPTIONS.map(e => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.emojiChip, editIcon === e && styles.presetChipActive]}
                      onPress={() => setEditIcon(e)}
                    >
                      <Text style={styles.presetEmoji}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity onPress={handleSaveEdit}>
                  <LinearGradient colors={[colors.habits, '#059669']} style={styles.modalBtn}>
                    <Text style={styles.modalBtnText}>Save Changes ✓</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setEditMode(false)}>
                  <Text style={styles.cancelText}>Back</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8F8FF' },
  subtitle: { fontSize: 13, color: 'rgba(248,248,255,0.4)', marginTop: 2 },
  addBtn: { borderRadius: 20, overflow: 'hidden' },
  addBtnGradient: { paddingHorizontal: 18, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  totalStreakCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  totalStreakLeft: {},
  totalStreakValue: { fontSize: 40, fontWeight: '800', color: colors.accent },
  totalStreakLabel: { fontSize: 13, color: 'rgba(248,248,255,0.4)', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#F8F8FF', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: 'rgba(248,248,255,0.4)', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  habitWrap: { marginBottom: 12 },
  habitCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  habitCardDone: { borderColor: 'rgba(52,211,153,0.3)' },
  habitCardSkipped: { borderColor: 'rgba(245,158,11,0.25)' },
  habitGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  habitIcon: { fontSize: 30 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', color: '#F8F8FF' },
  habitNameDone: { color: colors.habits },
  habitStreak: { fontSize: 12, color: 'rgba(248,248,255,0.4)', marginTop: 2 },
  fireWrap: { marginRight: 8 },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: colors.habits, borderColor: colors.habits },
  checkCircleSkipped: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  pausedTitle: { fontSize: 13, fontWeight: '600', color: 'rgba(248,248,255,0.35)', marginTop: 8, marginBottom: 10, letterSpacing: 1 },
  pausedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 14,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', opacity: 0.6,
  },
  pausedIcon: { fontSize: 20 },
  pausedName: { flex: 1, color: 'rgba(248,248,255,0.5)', fontSize: 14 },
  pausedTap: { color: 'rgba(248,248,255,0.3)', fontSize: 11 },
  hint: { textAlign: 'center', color: 'rgba(248,248,255,0.2)', fontSize: 12, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#0f0f24', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F8F8FF', marginBottom: 20 },
  modalLabel: { fontSize: 13, color: 'rgba(248,248,255,0.4)', marginBottom: 10, fontWeight: '500' },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  presetChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  emojiChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  presetChipActive: { backgroundColor: 'rgba(52,211,153,0.15)', borderColor: colors.habits },
  presetEmoji: { fontSize: 16 },
  presetText: { color: 'rgba(248,248,255,0.5)', fontSize: 13 },
  presetTextActive: { color: colors.habits, fontWeight: '600' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', color: '#F8F8FF',
    borderRadius: 14, padding: 16, fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16,
  },
  modalBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelText: { color: 'rgba(248,248,255,0.35)', textAlign: 'center', fontSize: 15, paddingVertical: 8 },
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  actionEmoji: { fontSize: 28 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  actionIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  actionLabel: { color: '#F8F8FF', fontSize: 15 },
});