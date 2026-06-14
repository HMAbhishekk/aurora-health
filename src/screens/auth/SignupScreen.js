import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/colors';

export default function SignupScreen({ navigation }) {
  const { signUp, socialAuth } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSignup = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields.'); shake(); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); shake(); return; }
    setLoading(true);
    setError('');
    const result = await signUp(email.trim().toLowerCase(), password, name.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSocialSignup = async (provider) => {
    setLoading(true);
    setError('');
    const result = await socialAuth(provider);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      shake();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07071a', '#120833', '#0a1628']} style={StyleSheet.absoluteFill} />
      <View style={styles.bgGlow} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient colors={['#9F6FFF', '#7C3AED', '#06D6A0']} style={styles.logoCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.logoText}>A</Text>
            </LinearGradient>
            <Text style={styles.appName}>Aurora</Text>
          </View>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your personalized health journey today</Text>

          {error ? (
            <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Min. 6 characters" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <LinearGradient colors={['#9F6FFF', '#7C3AED']} style={styles.signUpBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.signUpText}>Create Account</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialSignup('google')} disabled={loading}>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialSignup('apple')} disabled={loading}>
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Sign in</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  bgGlow: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#06D6A0', top: -80, left: -80, opacity: 0.06,
  },
  scroll: { flexGrow: 1, padding: 28, paddingTop: 80, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 40, gap: 12 },
  logoCircle: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 24, fontWeight: '300', color: '#F8F8FF', letterSpacing: 6 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8F8FF', marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'rgba(248,248,255,0.45)', marginBottom: 32, lineHeight: 22 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12,
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: { color: colors.error, fontSize: 14, flex: 1 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: 'rgba(248,248,255,0.5)', marginBottom: 8, fontWeight: '500', letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#F8F8FF', fontSize: 15, paddingVertical: 15 },
  eyeBtn: { padding: 4 },
  signUpBtn: {
    borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  signUpText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  socialText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loginBtn: { alignItems: 'center' },
  loginText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  loginLink: { color: '#9F6FFF', fontWeight: '600' },
});