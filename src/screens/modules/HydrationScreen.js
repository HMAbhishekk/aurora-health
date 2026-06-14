import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealth } from '../../context/HealthContext';
import { colors } from '../../constants/colors';
import { calculatePercentage } from '../../utils/helpers';

const { width } = Dimensions.get('window');

function WaterBottle3D({ consumed, goal }) {
  const pct = Math.min((consumed / goal) * 100, 100);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const bubbleAnims = useRef([...Array(5)].map(() => ({
    y: new Animated.Value(0),
    x: new Animated.Value(Math.random() * 60 - 30),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.5),
  }))).current;

  useEffect(() => {
    // Fill animation
    Animated.spring(fillAnim, {
      toValue: pct,
      friction: 8, tension: 20,
      useNativeDriver: false,
    }).start();

    // Wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave2Anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(wave2Anim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Bubble animations
    bubbleAnims.forEach((bubble, i) => {
      const animateBubble = () => {
        bubble.y.setValue(0);
        bubble.opacity.setValue(0);
        bubble.scale.setValue(0.3 + Math.random() * 0.5);
        Animated.sequence([
          Animated.delay(i * 600),
          Animated.parallel([
            Animated.timing(bubble.opacity, { toValue: 0.7, duration: 300, useNativeDriver: true }),
            Animated.timing(bubble.y, { toValue: -120, duration: 2500, useNativeDriver: true }),
            Animated.timing(bubble.scale, { toValue: 1, duration: 2500, useNativeDriver: true }),
          ]),
          Animated.timing(bubble.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => animateBubble());
      };
      setTimeout(() => animateBubble(), i * 800);
    });
  }, [pct]);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1], outputRange: [-15, 15],
  });

  const wave2Translate = wave2Anim.interpolate({
    inputRange: [0, 1], outputRange: [15, -15],
  });

  return (
    <View style={bottle.wrap}>
      {/* Outer glow */}
      <Animated.View style={[bottle.glow, { opacity: glowAnim }]} />

      {/* 3D Bottle */}
      <View style={bottle.outer}>
        {/* Bottle neck */}
        <View style={bottle.neck}>
          <LinearGradient colors={['#1a2a3a', '#0d1a2a']} style={bottle.neckInner} />
        </View>

        {/* Bottle body */}
        <View style={bottle.body}>
          {/* Glass effect — left highlight */}
          <View style={bottle.glassLeft} />
          {/* Glass effect — right shadow */}
          <View style={bottle.glassRight} />

          {/* Water fill */}
          <Animated.View style={[bottle.fillWrap, { height: fillHeight }]}>
            {/* Wave 1 */}
            <Animated.View style={[bottle.wave, { transform: [{ translateX: waveTranslate }] }]}>
              <LinearGradient
                colors={['rgba(56,189,248,0)', 'rgba(56,189,248,0.4)']}
                style={bottle.waveGradient}
              />
            </Animated.View>
            {/* Wave 2 */}
            <Animated.View style={[bottle.wave, bottle.wave2, { transform: [{ translateX: wave2Translate }] }]}>
              <LinearGradient
                colors={['rgba(56,189,248,0)', 'rgba(14,165,233,0.3)']}
                style={bottle.waveGradient}
              />
            </Animated.View>

            {/* Water body */}
            <LinearGradient
              colors={['rgba(56,189,248,0.6)', 'rgba(14,165,233,0.8)', 'rgba(2,132,199,0.9)']}
              style={bottle.water}
            />

            {/* Bubbles */}
            {pct > 10 && bubbleAnims.map((bubble, i) => (
              <Animated.View
                key={i}
                style={[bottle.bubble, {
                  left: 20 + (i * 18),
                  opacity: bubble.opacity,
                  transform: [{ translateY: bubble.y }, { scale: bubble.scale }],
                }]}
              />
            ))}
          </Animated.View>

          {/* Percentage text */}
          <View style={bottle.labelWrap}>
            <Text style={bottle.pctText}>{Math.round(pct)}%</Text>
            <Text style={bottle.mlText}>{consumed}ml</Text>
          </View>

          {/* Shine overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'transparent', 'rgba(255,255,255,0.04)']}
            style={bottle.shine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Bottom cap */}
        <View style={bottle.cap} />
      </View>

      <Text style={bottle.goalText}>Goal: {goal}ml</Text>
    </View>
  );
}

export default function HydrationScreen() {
  const { todayData, addWater } = useHealth();
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const handleAddWater = (ml) => {
    setLastAdded(ml);
    rippleAnim.setValue(0);
    rippleOpacity.setValue(0.6);
    Animated.parallel([
      Animated.timing(rippleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    addWater(ml);
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1], outputRange: [0.5, 3],
  });

  return (
    <LinearGradient colors={['#07071a', '#061828']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.title}>Hydration</Text>
        <Text style={styles.subtitle}>Stay hydrated, stay energized</Text>

        {/* 3D Water Bottle */}
        <WaterBottle3D
          consumed={todayData.hydration.consumed}
          goal={todayData.hydration.goal}
        />

        {/* Ripple effect */}
        <View style={styles.rippleWrap}>
          <Animated.View style={[styles.ripple, {
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
          }]} />
        </View>

        {/* Last added toast */}
        {lastAdded && (
          <View style={styles.toastRow}>
            <Text style={styles.toastText}>+{lastAdded}ml added 💧</Text>
          </View>
        )}

        {/* Quick add */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickGrid}>
          {[
            { ml: 150, label: 'Sip', icon: '🥤' },
            { ml: 250, label: 'Glass', icon: '🥛' },
            { ml: 350, label: 'Cup', icon: '☕' },
            { ml: 500, label: 'Bottle', icon: '🍶' },
            { ml: 750, label: 'Large', icon: '🫗' },
            { ml: 1000, label: '1 Litre', icon: '🧴' },
          ].map(item => (
            <TouchableOpacity
              key={item.ml}
              style={styles.quickCard}
              onPress={() => handleAddWater(item.ml)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(56,189,248,0.15)', 'rgba(56,189,248,0.05)']}
                style={styles.quickCardInner}
              >
                <Text style={styles.quickIcon}>{item.icon}</Text>
                <Text style={styles.quickMl}>+{item.ml}ml</Text>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.customBtn} onPress={() => setShowCustom(true)}>
          <Text style={styles.customBtnText}>+ Custom Amount</Text>
        </TouchableOpacity>

        {/* Log history */}
        {todayData.hydration.logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Log</Text>
            {[...todayData.hydration.logs].reverse().slice(0, 8).map((log, i) => (
              <View key={i} style={styles.logRow}>
                <View style={styles.logLeft}>
                  <View style={styles.logDot} />
                  <Text style={styles.logText}>💧 {log.ml}ml</Text>
                </View>
                <Text style={styles.logTime}>
                  {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Custom modal */}
      <Modal visible={showCustom} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Custom Amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter ml (e.g. 450)"
              placeholderTextColor={colors.textMuted}
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                handleAddWater(parseInt(customAmount) || 0);
                setCustomAmount('');
                setShowCustom(false);
              }}
            >
              <LinearGradient colors={['#38BDF8', '#0EA5E9']} style={styles.modalBtnGradient}>
                <Text style={styles.modalBtnText}>Add Water 💧</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCustom(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const bottle = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  glow: {
    position: 'absolute',
    width: 140, height: 280, borderRadius: 70,
    backgroundColor: '#38BDF8',
    top: 20,
  },
  outer: { alignItems: 'center' },
  neck: {
    width: 50, height: 30,
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(56,189,248,0.3)',
    borderBottomWidth: 0,
  },
  neckInner: { flex: 1 },
  body: {
    width: 130, height: 240,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(56,189,248,0.25)',
    overflow: 'hidden',
    backgroundColor: 'rgba(14,30,50,0.9)',
    justifyContent: 'flex-end',
  },
  glassLeft: {
    position: 'absolute', left: 8, top: 0, bottom: 0, width: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', zIndex: 10,
    borderRadius: 3,
  },
  glassRight: {
    position: 'absolute', right: 8, top: 0, bottom: 0, width: 3,
    backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 10,
    borderRadius: 3,
  },
  fillWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  wave: {
    position: 'absolute', top: -15, left: -20, right: -20, height: 30,
    zIndex: 3,
  },
  wave2: { top: -25, zIndex: 2 },
  waveGradient: { flex: 1, borderRadius: 50 },
  water: { flex: 1 },
  bubble: {
    position: 'absolute', bottom: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 4,
  },
  labelWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  pctText: {
    fontSize: 32, fontWeight: '800', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  mlText: {
    fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2,
  },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 6,
  },
  cap: {
    width: 130, height: 10,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderWidth: 1.5, borderTopWidth: 0,
    borderColor: 'rgba(56,189,248,0.25)',
  },
  goalText: {
    color: 'rgba(248,248,255,0.4)', fontSize: 13,
    marginTop: 12, letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8F8FF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(248,248,255,0.4)', marginBottom: 24 },
  rippleWrap: { alignItems: 'center', marginBottom: -20 },
  ripple: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(56,189,248,0.3)',
  },
  toastRow: {
    alignSelf: 'center',
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)',
  },
  toastText: { color: '#38BDF8', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F8F8FF', marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  quickCard: { width: (width - 68) / 3, borderRadius: 14, overflow: 'hidden' },
  quickCardInner: {
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)', borderRadius: 14,
  },
  quickIcon: { fontSize: 22 },
  quickMl: { fontSize: 13, fontWeight: '700', color: '#38BDF8' },
  quickLabel: { fontSize: 10, color: 'rgba(248,248,255,0.4)' },
  customBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 14, alignItems: 'center',
    marginBottom: 28, borderStyle: 'dashed',
  },
  customBtnText: { color: 'rgba(248,248,255,0.4)', fontSize: 14 },
  section: { marginBottom: 24 },
  logRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  logLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#38BDF8' },
  logText: { color: '#F8F8FF', fontSize: 14 },
  logTime: { color: 'rgba(248,248,255,0.35)', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#12122A', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#F8F8FF', marginBottom: 20 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', color: '#F8F8FF',
    borderRadius: 14, padding: 16, fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16,
  },
  modalBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  modalBtnGradient: { padding: 16, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelText: { color: 'rgba(248,248,255,0.35)', textAlign: 'center', fontSize: 15, paddingVertical: 8 },
});