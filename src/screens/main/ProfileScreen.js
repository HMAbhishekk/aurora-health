import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <LinearGradient colors={['#07071a', '#0a0a1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.avatarContainer}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'A'}</Text>
          </LinearGradient>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.infoCard}>
          {[
            { label: 'Age', value: user?.age || 'Not set' },
            { label: 'Height', value: user?.height ? user.height + ' cm' : 'Not set' },
            { label: 'Weight', value: user?.weight ? user.weight + ' kg' : 'Not set' },
            { label: 'Activity', value: user?.activity || 'Not set' },
            { label: 'Wake Time', value: user?.wakeTime || '07:00' },
            { label: 'Bedtime', value: user?.bedTime || '22:00' },
          ].map(item => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {user?.goals?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Goals</Text>
            <View style={styles.goalsWrap}>
              {user.goals.map(goal => (
                <View key={goal} style={styles.goalChip}>
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsBtnText}>⚙️  Settings</Text>
          <Text style={styles.settingsArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#F8F8FF', marginBottom: 24 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#F8F8FF' },
  email: { fontSize: 14, color: 'rgba(248,248,255,0.4)', marginTop: 4 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoLabel: { color: 'rgba(248,248,255,0.4)', fontSize: 15 },
  infoValue: { color: '#F8F8FF', fontSize: 15, fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F8F8FF', marginBottom: 12 },
  goalsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalChip: { backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  goalText: { color: colors.primaryLight, fontSize: 13, fontWeight: '500' },
  settingsBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  settingsBtnText: { color: '#F8F8FF', fontSize: 15, fontWeight: '500' },
  settingsArrow: { color: 'rgba(248,248,255,0.3)', fontSize: 16 },
  signOutButton: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  signOutText: { color: colors.error, fontSize: 16, fontWeight: '600' },
});