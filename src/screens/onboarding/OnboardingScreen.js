import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    eyebrow: 'WELCOME',
    title: 'Meet your personal\nhealth companion.',
    body: 'Aurora learns your patterns, understands your goals, and guides you every single day.',
    emoji: '🌟',
    accent: '#7C3AED',
    bg: ['#07071a', '#120833'],
  },
  {
    id: '2',
    eyebrow: 'TRACK',
    title: 'Everything in\none place.',
    body: 'Hydration, sleep, habits, and nutrition — all beautifully unified and easy to log.',
    emoji: '💧',
    accent: '#38BDF8',
    bg: ['#07071a', '#061828'],
  },
  {
    id: '3',
    eyebrow: 'INSIGHTS',
    title: 'Personalized daily\ninsights, just for you.',
    body: 'Aurora analyzes your data and surfaces what actually matters to improve your health.',
    emoji: '✨',
    accent: '#06D6A0',
    bg: ['#07071a', '#061a14'],
  },
  {
    id: '4',
    eyebrow: 'HABITS',
    title: 'Build routines\nthat actually stick.',
    body: 'Small consistent actions compound over time. Aurora keeps you accountable, kindly.',
    emoji: '🔥',
    accent: '#FB923C',
    bg: ['#07071a', '#1a0a06'],
  },
  {
    id: '5',
    eyebrow: 'GROW',
    title: 'Learn more about\nyourself every day.',
    body: 'The more you use Aurora, the more it understands you. Your health, deeply known.',
    emoji: '🧠',
    accent: '#F472B6',
    bg: ['#07071a', '#1a061a'],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Signup');
    }
  };

  const current = slides[currentIndex];

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.emojiWrap}>
        <View style={[styles.emojiRing, { borderColor: item.accent + '30' }]}>
          <View style={[styles.emojiInner, { backgroundColor: item.accent + '15' }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.eyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={current.bg}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => navigation.replace('Signup')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {slides.map((s, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: currentIndex === i ? 28 : 6,
                  backgroundColor: currentIndex === i ? current.accent : 'rgba(255,255,255,0.2)',
                },
              ]}
            />
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[current.accent, current.accent + 'CC']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started →' : 'Continue →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={[styles.loginLink, { color: current.accent }]}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071a' },
  skipBtn: {
    position: 'absolute',
    top: 60, right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingTop: 60,
  },
  emojiWrap: { marginBottom: 40 },
  emojiRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 52 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#F8F8FF',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    color: 'rgba(248,248,255,0.55)',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '300',
  },
  bottom: {
    paddingHorizontal: 28,
    paddingBottom: 52,
    gap: 24,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  nextBtn: {
    width: width - 56,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginRow: { paddingVertical: 4 },
  loginText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  loginLink: { fontWeight: '600' },
});