import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [notifPrefs, setNotifPrefs] = useState({
    hydration: true, sleep: true, habits: true, insights: true,
  });
  const [units, setUnits] = useState('metric');
  const [healthConnected, setHealthConnected] = useState({
    appleHealth: false, healthConnect: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(`aurora_${user?.id}_settings`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifPrefs(parsed.notifPrefs || notifPrefs);
        setUnits(parsed.units || 'metric');
        setHealthConnected(parsed.healthConnected || healthConnected);
      } else if (user?.notifPrefs) {
        setNotifPrefs(user.notifPrefs);
      }
    } catch (e) {}
  };

  const saveSettings = async (updates) => {
    try {
      const newSettings = { notifPrefs, units, healthConnected, ...updates };
      await AsyncStorage.setItem(`aurora_${user?.id}_settings`, JSON.stringify(newSettings));
    } catch (e) {}
  };

  const toggleNotif = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveSettings({ notifPrefs: updated });

    try {
      const { setupNotifications, cancelAll } = require('../../services/notificationService');
      const anyEnabled = Object.values(updated).some(v => v);
      if (anyEnabled) setupNotifications({ ...user, notifPrefs: updated });
      else cancelAll();
    } catch (e) {}
  };

  const toggleUnits = () => {
    const newUnit = units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnit);
    saveSettings({ units: newUnit });
  };

  const toggleHealthConnection = (key, label) => {
    const updated = { ...healthConnected, [key]: !healthConnected[key] };
    setHealthConnected(updated);
    saveSettings({ healthConnected: updated });
    Alert.alert(
      updated[key] ? 'Connected! ✅' : 'Disconnected',
      updated[key]
        ? `${label} is now connected. Aurora will sync your activity data.`
        : `${label} has been disconnected.`
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const SettingRow = ({ icon, label, sub, right, onPress, color = colors.primary }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {right}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#07071a', '#0a0a1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#F8F8FF" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <SettingRow
            icon="water" label="Hydration Reminders" sub="Every 2 hours"
            color={colors.hydration}
            right={<Switch value={notifPrefs.hydration} onValueChange={() => toggleNotif('hydration')} trackColor={{ true: colors.hydration }} />}
          />
          <SettingRow
            icon="moon" label="Sleep Reminders" sub="Bedtime & wake-up"
            color={colors.sleep}
            right={<Switch value={notifPrefs.sleep} onValueChange={() => toggleNotif('sleep')} trackColor={{ true: colors.sleep }} />}
          />
          <SettingRow
            icon="checkmark-circle" label="Habit Reminders" sub="Daily check-ins"
            color={colors.habits}
            right={<Switch value={notifPrefs.habits} onValueChange={() => toggleNotif('habits')} trackColor={{ true: colors.habits }} />}
          />
          <SettingRow
            icon="sparkles" label="Daily Insights" sub="Morning summary"
            color={colors.companion}
            right={<Switch value={notifPrefs.insights} onValueChange={() => toggleNotif('insights')} trackColor={{ true: colors.companion }} />}
          />
        </View>

        <Text style={styles.sectionTitle}>DEVICE CONNECTIONS</Text>
        <View style={styles.card}>
          <SettingRow
            icon="logo-apple" label="Apple Health"
            sub={healthConnected.appleHealth ? 'Connected' : 'Not connected'}
            color={healthConnected.appleHealth ? colors.success : colors.textMuted}
            right={<Switch value={healthConnected.appleHealth} onValueChange={() => toggleHealthConnection('appleHealth', 'Apple Health')} trackColor={{ true: colors.success }} />}
          />
          <SettingRow
            icon="fitness" label="Health Connect"
            sub={healthConnected.healthConnect ? 'Connected' : 'Not connected'}
            color={healthConnected.healthConnect ? colors.success : colors.textMuted}
            right={<Switch value={healthConnected.healthConnect} onValueChange={() => toggleHealthConnection('healthConnect', 'Health Connect')} trackColor={{ true: colors.success }} />}
          />
        </View>

        <Text style={styles.sectionTitle}>MEASUREMENT UNITS</Text>
        <View style={styles.card}>
          <SettingRow
            icon="speedometer" label="Units"
            sub={units === 'metric' ? 'Metric (ml, kg, cm)' : 'Imperial (oz, lb, ft)'}
            color={colors.accent}
            onPress={toggleUnits}
            right={<Ionicons name="chevron-forward" size={18} color="rgba(248,248,255,0.3)" />}
          />
        </View>

        <Text style={styles.sectionTitle}>PRIVACY & DATA</Text>
        <View style={styles.card}>
          <SettingRow
            icon="shield-checkmark" label="Privacy Policy" sub="How we handle your data"
            color={colors.primaryLight}
            onPress={() => Alert.alert('Privacy', 'Your health data is stored securely and never shared with third parties.')}
            right={<Ionicons name="chevron-forward" size={18} color="rgba(248,248,255,0.3)" />}
          />
          <SettingRow
            icon="cloud-done" label="Cloud Sync" sub="Data synced to Supabase"
            color={colors.success}
            right={<Ionicons name="checkmark-circle" size={20} color={colors.success} />}
          />
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingRow
            icon="log-out" label="Sign Out"
            color={colors.error}
            onPress={handleSignOut}
          />
        </View>

        <Text style={styles.version}>Aurora v1.0.0</Text>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#F8F8FF' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: 'rgba(248,248,255,0.35)', letterSpacing: 1.5, marginBottom: 10, marginTop: 8 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 20, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { color: '#F8F8FF', fontSize: 14, fontWeight: '500' },
  rowSub: { color: 'rgba(248,248,255,0.35)', fontSize: 12, marginTop: 2 },
  version: { textAlign: 'center', color: 'rgba(248,248,255,0.2)', fontSize: 12, marginTop: 8 },
});