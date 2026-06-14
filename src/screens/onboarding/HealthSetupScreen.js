import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';

const goals = [
  'Improve Hydration', 'Sleep Better', 'Build Better Habits',
  'Eat Healthier', 'Improve Energy', 'Be Consistent',
];
const activityLevels = [
  { label: 'Sedentary', desc: 'Little or no exercise', icon: '🪑' },
  { label: 'Lightly Active', desc: 'Light exercise 1-3 days/week', icon: '🚶' },
  { label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week', icon: '🏃' },
  { label: 'Very Active', desc: 'Hard exercise 6-7 days/week', icon: '⚡' },
];

export default function HealthSetupScreen() {
  const { completeOnboarding, user } = useAuth();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('22:00');
  const [notifPrefs, setNotifPrefs] = useState({
    hydration: true, sleep: true, habits: true, insights: true,
  });
  const [error, setError] = useState('');

  const toggleGoal = (goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleFinish = async () => {
    const profileData = {
      age, gender, height, weight, activity,
      goals: selectedGoals,
      wakeTime, bedTime,
      notifPrefs,
    };
    await completeOnboarding(profileData);
    try {
      const { setupNotifications } = require('../../services/notificationService');
      await setupNotifications({ ...profileData, name: user?.name });
    } catch (e) {
      console.log('Notification setup error:', e);
    }
  };

  const handleNext = () => {
    setError('');

    if (step === 0) {
      if (!age || !height || !weight || !gender) {
        setError('Please fill in all fields to continue.');
        return;
      }
      if (isNaN(age) || parseInt(age) < 5 || parseInt(age) > 120) {
        setError('Please enter a valid age.');
        return;
      }
      if (isNaN(height) || parseInt(height) < 50 || parseInt(height) > 280) {
        setError('Please enter a valid height in cm.');
        return;
      }
      if (isNaN(weight) || parseInt(weight) < 10 || parseInt(weight) > 400) {
        setError('Please enter a valid weight in kg.');
        return;
      }
    }

    if (step === 1) {
      if (!activity) {
        setError('Please select your activity level.');
        return;
      }
    }

    if (step === 2) {
      if (selectedGoals.length === 0) {
        setError('Please select at least one health goal.');
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07071a', '#120833', '#0a1628']} style={StyleSheet.absoluteFill} />

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / 4) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>Step {step + 1} of 4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Step 0 — Personal Info */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEyebrow}>PERSONAL INFO</Text>
            <Text style={styles.title}>Tell us about{'\n'}yourself</Text>
            <Text style={styles.subtitle}>This helps Aurora personalize your health insights</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 24"
                placeholderTextColor={colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 175"
                placeholderTextColor={colors.textMuted}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70"
                placeholderTextColor={colors.textMuted}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.chipRow}>
                {['Male', 'Female', 'Other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, gender === g && styles.chipActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 1 — Activity Level */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEyebrow}>LIFESTYLE</Text>
            <Text style={styles.title}>How active{'\n'}are you?</Text>
            <Text style={styles.subtitle}>Aurora uses this to calculate your daily health targets</Text>

            {activityLevels.map(level => (
              <TouchableOpacity
                key={level.label}
                style={[styles.optionCard, activity === level.label && styles.optionCardActive]}
                onPress={() => setActivity(level.label)}
              >
                <Text style={styles.optionIcon}>{level.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, activity === level.label && styles.optionLabelActive]}>
                    {level.label}
                  </Text>
                  <Text style={styles.optionDesc}>{level.desc}</Text>
                </View>
                {activity === level.label && (
                  <View style={styles.optionCheck}>
                    <Text style={styles.optionCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2 — Health Goals */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEyebrow}>YOUR GOALS</Text>
            <Text style={styles.title}>What do you{'\n'}want to achieve?</Text>
            <Text style={styles.subtitle}>Select all that apply — Aurora will focus on what matters to you</Text>

            <View style={styles.goalsGrid}>
              {goals.map(goal => (
                <TouchableOpacity
                  key={goal}
                  style={[styles.goalChip, selectedGoals.includes(goal) && styles.goalChipActive]}
                  onPress={() => toggleGoal(goal)}
                >
                  <Text style={[styles.goalText, selectedGoals.includes(goal) && styles.goalTextActive]}>
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedGoals.length > 0 && (
              <Text style={styles.goalsCount}>
                {selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''} selected ✓
              </Text>
            )}
          </View>
        )}

        {/* Step 3 — Lifestyle & Notifications */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEyebrow}>LIFESTYLE & ALERTS</Text>
            <Text style={styles.title}>When do you{'\n'}sleep & wake?</Text>
            <Text style={styles.subtitle}>Aurora times your reminders around your schedule</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Wake-up Time</Text>
              <View style={styles.timeRow}>
                {['06:00', '07:00', '08:00', '09:00'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeChip, wakeTime === t && styles.timeChipActive]}
                    onPress={() => setWakeTime(t)}
                  >
                    <Text style={[styles.timeChipText, wakeTime === t && styles.timeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bedtime</Text>
              <View style={styles.timeRow}>
                {['21:00', '22:00', '23:00', '00:00'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeChip, bedTime === t && styles.timeChipActive]}
                    onPress={() => setBedTime(t)}
                  >
                    <Text style={[styles.timeChipText, bedTime === t && styles.timeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notifications</Text>
              {[
                { key: 'hydration', label: 'Hydration Reminders', icon: '💧' },
                { key: 'sleep', label: 'Sleep Reminders', icon: '🌙' },
                { key: 'habits', label: 'Habit Reminders', icon: '✅' },
                { key: 'insights', label: 'Daily Insights', icon: '✨' },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.notifRow}
                  onPress={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                >
                  <Text style={styles.notifLabel}>{item.icon}  {item.label}</Text>
                  <View style={[styles.toggle, notifPrefs[item.key] && styles.toggleActive]}>
                    <View style={[styles.toggleDot, notifPrefs[item.key] && styles.toggleDotActive]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomWrap}>
        {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={['#9F6FFF', '#7C3AED']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextBtnText}>
              {step < 3 ? 'Continue →' : '🚀 Start My Journey'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => { setError(''); setStep(step - 1); }}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  progressWrap: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 8,
    gap: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  scroll: { padding: 28, paddingTop: 16, paddingBottom: 160 },
  stepContainer: { gap: 0 },
  stepEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 3,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F8F8FF',
    lineHeight: 42,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(248,248,255,0.45)',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 13,
    color: 'rgba(248,248,255,0.5)',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#F8F8FF',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipActive: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderColor: '#7C3AED',
  },
  chipText: { color: 'rgba(248,248,255,0.5)', fontSize: 14 },
  chipTextActive: { color: '#9F6FFF', fontWeight: '600' },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 12,
    gap: 14,
  },
  optionCardActive: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  optionIcon: { fontSize: 28 },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(248,248,255,0.6)',
    marginBottom: 2,
  },
  optionLabelActive: { color: '#9F6FFF' },
  optionDesc: { fontSize: 12, color: 'rgba(248,248,255,0.35)' },
  optionCheck: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center',
  },
  optionCheckText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  goalChipActive: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderColor: '#7C3AED',
  },
  goalText: { color: 'rgba(248,248,255,0.5)', fontSize: 14 },
  goalTextActive: { color: '#9F6FFF', fontWeight: '600' },
  goalsCount: {
    color: '#06D6A0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  timeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  timeChipActive: { backgroundColor: 'rgba(124,58,237,0.25)', borderColor: '#7C3AED' },
  timeChipText: { color: 'rgba(248,248,255,0.5)', fontSize: 14 },
  timeChipTextActive: { color: '#9F6FFF', fontWeight: '700' },
  notifRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  notifLabel: { color: 'rgba(248,248,255,0.7)', fontSize: 14 },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)', padding: 3,
  },
  toggleActive: { backgroundColor: '#7C3AED' },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleDotActive: { transform: [{ translateX: 18 }] },
  errorMsg: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomWrap: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 28,
    paddingBottom: 44,
    backgroundColor: 'rgba(7,7,26,0.95)',
    gap: 12,
  },
  nextBtn: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backBtnText: { color: 'rgba(255,255,255,0.35)', fontSize: 15 },
});