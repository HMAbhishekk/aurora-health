import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { colors } from '../../constants/colors';
import { getGreeting, calculatePercentage } from '../../utils/helpers';

const { width } = Dimensions.get('window');

function FloatingCard({ children, style, delay = 0, onPress, color }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 40, delay, useNativeDriver: true }),
    ]).start();

    // Floating loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -6, duration: 2000 + delay * 0.5, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 2000 + delay * 0.5, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(pressScale, { toValue: 0.95, useNativeDriver: true, friction: 8 }),
      Animated.timing(shadowOpacity, { toValue: 0.5, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(shadowOpacity, { toValue: 0.2, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[
      style,
      {
        opacity,
        transform: [{ scale }, { translateY }, { scale: pressScale }],
      },
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { todayData, habits, streaks, insights, addWater } = useHealth();

  const headerY = useRef(new Animated.Value(-30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  const hydrationPct = calculatePercentage(todayData.hydration.consumed, todayData.hydration.goal);
  const todayStr = new Date().toISOString().split('T')[0];
  const doneHabits = habits.filter(h => h.completedDates?.includes(todayStr)).length;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerY, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleWater = (ml) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addWater(ml);
  };

  const statCards = [
    {
      emoji: '💧', value: `${hydrationPct}%`,
      label: 'Hydration', color: colors.hydration,
      gradient: ['rgba(56,189,248,0.2)', 'rgba(56,189,248,0.05)'],
      border: 'rgba(56,189,248,0.3)', screen: 'Hydration',
    },
    {
      emoji: '🌙', value: `${todayData.sleep.hours || 0}h`,
      label: 'Sleep', color: colors.sleep,
      gradient: ['rgba(129,140,248,0.2)', 'rgba(129,140,248,0.05)'],
      border: 'rgba(129,140,248,0.3)', screen: 'Sleep',
    },
    {
      emoji: '✅', value: `${doneHabits}/${habits.length}`,
      label: 'Habits', color: colors.habits,
      gradient: ['rgba(52,211,153,0.2)', 'rgba(52,211,153,0.05)'],
      border: 'rgba(52,211,153,0.3)', screen: 'Habits',
    },
  ];

  return (
    <LinearGradient colors={['#07071a', '#0f0a2e', '#071228']} style={styles.container}>
      {/* Background orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0] || 'Friend'} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'A'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Insight Card */}
        <FloatingCard delay={100} style={styles.insightWrap}>
          <LinearGradient
            colors={['rgba(124,58,237,0.85)', 'rgba(91,33,182,0.75)']}
            style={styles.insightCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.insightRow}>
              <View style={styles.insightIconWrap}>
                <Text style={styles.insightIcon}>✨</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightEyebrow}>DAILY INSIGHT</Text>
                <Text style={styles.insightText}>
                  {insights[0]?.message || `Ready for a great day, ${user?.name?.split(' ')[0]}? Let's hit your health goals!`}
                </Text>
              </View>
            </View>
            {/* Shimmer */}
            <View style={styles.shimmer} />
          </LinearGradient>
        </FloatingCard>

        {/* 3D Floating Stat Cards */}
        <View style={styles.statsRow}>
          {statCards.map((card, i) => (
            <FloatingCard
              key={card.label}
              delay={200 + i * 100}
              style={styles.statCardWrap}
              onPress={() => navigation.navigate(card.screen)}
              color={card.color}
            >
              <LinearGradient colors={card.gradient} style={[styles.statCard, { borderColor: card.border }]}>
                {/* 3D depth shadow */}
                <View style={[styles.statShadow, { backgroundColor: card.color }]} />
                <Text style={styles.statEmoji}>{card.emoji}</Text>
                <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
                {/* Shine */}
                <View style={styles.statShine} />
              </LinearGradient>
            </FloatingCard>
          ))}
        </View>

        {/* Quick Add Water */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add Water</Text>
          <View style={styles.waterRow}>
            {[150, 250, 350, 500].map((ml, i) => (
              <FloatingCard key={ml} delay={400 + i * 50} style={{ flex: 1 }} onPress={() => handleWater(ml)}>
                <LinearGradient
                  colors={['rgba(56,189,248,0.15)', 'rgba(56,189,248,0.05)']}
                  style={styles.waterBtn}
                >
                  <Text style={styles.waterBtnText}>+{ml}</Text>
                  <Text style={styles.waterBtnUnit}>ml</Text>
                </LinearGradient>
              </FloatingCard>
            ))}
          </View>
        </View>

        {/* Streaks */}
        {Object.values(streaks).some(v => v > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Active Streaks</Text>
            <View style={styles.streaksRow}>
              {Object.entries(streaks).filter(([, v]) => v > 0).map(([key, val], i) => (
                <FloatingCard key={key} delay={500 + i * 80} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={['rgba(245,158,11,0.15)', 'rgba(245,158,11,0.05)']}
                    style={[styles.streakCard, { borderColor: 'rgba(245,158,11,0.25)' }]}
                  >
                    <Text style={styles.streakValue}>{val}</Text>
                    <Text style={styles.streakLabel}>{key}</Text>
                  </LinearGradient>
                </FloatingCard>
              ))}
            </View>
          </View>
        )}

        {/* Module shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track More</Text>
          {[
            { label: 'Sleep', desc: 'Log last night', icon: 'moon', color: colors.sleep, screen: 'Sleep' },
            { label: 'Nutrition', desc: 'Log your meals', icon: 'restaurant', color: colors.nutrition, screen: 'Nutrition' },
          ].map((item, i) => (
            <FloatingCard key={item.label} delay={600 + i * 80} style={styles.shortcutWrap} onPress={() => navigation.navigate(item.screen)}>
              <LinearGradient
                colors={[item.color + '18', item.color + '05']}
                style={[styles.shortcut, { borderColor: item.color + '25' }]}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shortcutLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={styles.shortcutDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={item.color + '60'} />
              </LinearGradient>
            </FloatingCard>
          ))}
        </View>

        {/* Aurora CTA */}
        <FloatingCard delay={700} style={styles.ctaWrap} onPress={() => navigation.navigate('Companion')}>
          <LinearGradient
            colors={['rgba(244,114,182,0.2)', 'rgba(124,58,237,0.2)']}
            style={styles.cta}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <LinearGradient colors={[colors.companion, colors.primary]} style={styles.ctaOrb}>
              <Text style={styles.ctaOrbText}>A</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Talk to Aurora</Text>
              <Text style={styles.ctaSub}>Ask · Log · Get insights</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.companion} />
          </LinearGradient>
        </FloatingCard>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: colors.primary, top: -100, right: -80, opacity: 0.06 },
  orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.secondary, bottom: 300, left: -60, opacity: 0.05 },
  orb3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: colors.companion, top: 300, right: -40, opacity: 0.04 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 13, color: 'rgba(248,248,255,0.45)', letterSpacing: 0.3 },
  name: { fontSize: 26, fontWeight: '700', color: '#F8F8FF', marginTop: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  insightWrap: { marginBottom: 24 },
  insightCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, gap: 14 },
  insightIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  insightIcon: { fontSize: 18 },
  insightEyebrow: { fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, marginBottom: 4, fontWeight: '600' },
  insightText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  shimmer: { position: 'absolute', top: 0, right: 0, width: 80, height: '100%', backgroundColor: 'rgba(255,255,255,0.04)', transform: [{ skewX: '-20deg' }] },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCardWrap: { flex: 1 },
  statCard: {
    borderRadius: 18, padding: 16, alignItems: 'center',
    borderWidth: 1, position: 'relative', overflow: 'hidden',
  },
  statShadow: { position: 'absolute', bottom: -8, left: 8, right: 8, height: 16, borderRadius: 8, opacity: 0.2 },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, color: 'rgba(248,248,255,0.45)' },
  statShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F8F8FF', marginBottom: 12 },
  waterRow: { flexDirection: 'row', gap: 10 },
  waterBtn: { borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)', borderRadius: 14 },
  waterBtnText: { fontSize: 16, fontWeight: '700', color: colors.hydration },
  waterBtnUnit: { fontSize: 10, color: 'rgba(248,248,255,0.35)', marginTop: 1 },
  streaksRow: { flexDirection: 'row', gap: 10 },
  streakCard: { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  streakValue: { fontSize: 24, fontWeight: '800', color: colors.accent },
  streakLabel: { fontSize: 11, color: 'rgba(248,248,255,0.4)', marginTop: 2, textTransform: 'capitalize' },
  shortcutWrap: { marginBottom: 10 },
  shortcut: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  shortcutIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: 15, fontWeight: '600' },
  shortcutDesc: { fontSize: 12, color: 'rgba(248,248,255,0.35)', marginTop: 1 },
  ctaWrap: { marginBottom: 20 },
  cta: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(244,114,182,0.2)' },
  ctaOrb: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  ctaOrbText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: '#F8F8FF' },
  ctaSub: { fontSize: 12, color: 'rgba(248,248,255,0.4)', marginTop: 2 },
});