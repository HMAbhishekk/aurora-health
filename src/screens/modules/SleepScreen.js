import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealth } from '../../context/HealthContext';
import { colors } from '../../constants/colors';

export default function SleepScreen() {
  const { todayData, logSleep } = useHealth();
  const [hours, setHours] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await logSleep(parseFloat(hours) || 0, bedtime, wakeTime);
    setSaved(true);
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#0d1f3c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Sleep</Text>

        {todayData.sleep.logged ? (
          <View style={styles.loggedCard}>
            <Text style={styles.loggedEmoji}>🌙</Text>
            <Text style={styles.loggedHours}>{todayData.sleep.hours}h</Text>
            <Text style={styles.loggedLabel}>logged last night</Text>
            {todayData.sleep.hours >= 7
              ? <Text style={styles.goodSleep}>Great sleep! Keep it up 💪</Text>
              : <Text style={styles.badSleep}>Try to get 7-9 hours for best recovery</Text>}
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Log Last Night's Sleep</Text>
            <Text style={styles.inputLabel}>Hours slept</Text>
            <TextInput style={styles.input} placeholder="e.g. 7.5" placeholderTextColor={colors.textMuted} value={hours} onChangeText={setHours} keyboardType="decimal-pad" />
            <Text style={styles.inputLabel}>Bedtime</Text>
            <TextInput style={styles.input} placeholder="e.g. 11:00 PM" placeholderTextColor={colors.textMuted} value={bedtime} onChangeText={setBedtime} />
            <Text style={styles.inputLabel}>Wake time</Text>
            <TextInput style={styles.input} placeholder="e.g. 7:00 AM" placeholderTextColor={colors.textMuted} value={wakeTime} onChangeText={setWakeTime} />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Sleep Log</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Sleep Tips</Text>
          {['Keep a consistent sleep schedule', 'Avoid screens 1 hour before bed', 'Keep your room cool and dark', 'Avoid caffeine after 2 PM'].map(tip => (
            <Text key={tip} style={styles.tip}>• {tip}</Text>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 24 },
  loggedCard: { backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: colors.sleep + '40' },
  loggedEmoji: { fontSize: 48, marginBottom: 8 },
  loggedHours: { fontSize: 48, fontWeight: '800', color: colors.sleep },
  loggedLabel: { color: colors.textSecondary, fontSize: 15, marginBottom: 12 },
  goodSleep: { color: colors.success, fontSize: 14, fontWeight: '500' },
  badSleep: { color: colors.warning, fontSize: 14, fontWeight: '500', textAlign: 'center' },
  formCard: { backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 20 },
  inputLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.sleep, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  tipsCard: { backgroundColor: colors.backgroundCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  tipsTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
  tip: { color: colors.textSecondary, fontSize: 14, marginBottom: 8, lineHeight: 20 },
});