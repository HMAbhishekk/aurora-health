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

export default function LoginScreen({ navigation }) {
  const { signIn, socialAuth } = useAuth();
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

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); shake(); return; }
    setLoading(true);
    setError('');
    const result = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError('');
    const result = await socialAuth(provider);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your health journey</Text>

          {/* Error */}
          {error ? (
            <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Inputs */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign in button */}
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <LinearGradient colors={['#9F6FFF', '#7C3AED']} style={styles.signInBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.signInText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('google')} disabled={loading}>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('apple')} disabled={loading}>
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <TouchableOpacity style={styles.signupBtn} onPress={() => navigation.replace('Signup')}>
            <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Create one</Text></Text>
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
    backgroundColor: '#7C3AED', top: -80, right: -80, opacity: 0.08,
  },
  scroll: { flexGrow: 1, padding: 28, paddingTop: 80, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 40, gap: 12 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
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
  signInBtn: {
    borderRadius: 16, paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
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
  signupBtn: { alignItems: 'center' },
  signupText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  signupLink: { color: '#9F6FFF', fontWeight: '600' },
});