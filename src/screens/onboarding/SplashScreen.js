import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

function AuroraOrb() {
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const rotate3 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Layer 1 — slow clockwise
    Animated.loop(
      Animated.timing(rotate1, {
        toValue: 1, duration: 8000, useNativeDriver: true,
      })
    ).start();

    // Layer 2 — medium counter-clockwise
    Animated.loop(
      Animated.timing(rotate2, {
        toValue: -1, duration: 5000, useNativeDriver: true,
      })
    ).start();

    // Layer 3 — fast clockwise
    Animated.loop(
      Animated.timing(rotate3, {
        toValue: 1, duration: 3000, useNativeDriver: true,
      })
    ).start();

    // Pulse breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.95, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.8, duration: 2500, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.3, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin1 = rotate1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = rotate2.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });
  const spin3 = rotate3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={orb.container}>
      {/* Outer glow */}
      <Animated.View style={[orb.outerGlow, { opacity: glow, transform: [{ scale: pulse }] }]} />

      {/* Ring 3 — outermost */}
      <Animated.View style={[orb.ring3, { transform: [{ rotate: spin1 }, { rotateX: '60deg' }] }]}>
        <LinearGradient colors={['transparent', '#7C3AED', 'transparent', '#06D6A0', 'transparent']} style={orb.ringGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>

      {/* Ring 2 — middle */}
      <Animated.View style={[orb.ring2, { transform: [{ rotate: spin2 }, { rotateY: '60deg' }] }]}>
        <LinearGradient colors={['transparent', '#F472B6', 'transparent', '#38BDF8', 'transparent']} style={orb.ringGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>

      {/* Ring 1 — innermost */}
      <Animated.View style={[orb.ring1, { transform: [{ rotate: spin3 }, { rotateX: '30deg' }] }]}>
        <LinearGradient colors={['transparent', '#06D6A0', 'transparent', '#7C3AED', 'transparent']} style={orb.ringGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>

      {/* Core sphere */}
      <Animated.View style={[orb.core, { transform: [{ scale: pulse }] }]}>
        <LinearGradient
          colors={['#9F6FFF', '#7C3AED', '#4C1D95']}
          style={orb.coreGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Shine highlight */}
          <View style={orb.shine} />
          <Text style={orb.letter}>A</Text>
        </LinearGradient>
      </Animated.View>

      {/* Particle dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <Animated.View
          key={i}
          style={[
            orb.particle,
            {
              transform: [
                { rotate: `${deg}deg` },
                { translateX: 85 },
                { rotate: spin1 },
              ],
              opacity: glow,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function SplashScreen({ navigation }) {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(40)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(containerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(orbScale, { toValue: 1, friction: 5, tension: 30, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(loaderOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        navigation.replace('Onboarding');
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#07071a', '#0f0428', '#071228']} style={StyleSheet.absoluteFill} />

      {/* Background ambient */}
      <View style={styles.ambientTop} />
      <View style={styles.ambientBottom} />

      {/* 3D Orb */}
      <Animated.View style={{ transform: [{ scale: orbScale }] }}>
        <AuroraOrb />
      </Animated.View>

      {/* App name */}
      <Animated.View style={[styles.textWrap, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
        <Text style={styles.appName}>AURORA</Text>
        <View style={styles.nameLine} />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Understand yourself{'\n'}better every day.
      </Animated.Text>

      {/* Loader */}
      <Animated.View style={[styles.loaderWrap, { opacity: loaderOpacity }]}>
        <View style={styles.loaderTrack}>
          <View style={styles.loaderFill} />
        </View>
        <Text style={styles.loaderText}>Your health companion is ready</Text>
      </Animated.View>
    </Animated.View>
  );
}

const orb = StyleSheet.create({
  container: {
    width: 220, height: 220,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
  },
  outerGlow: {
    position: 'absolute',
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#7C3AED',
  },
  ring3: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1.5, borderColor: 'rgba(124,58,237,0.6)',
    overflow: 'hidden',
  },
  ring2: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1.5, borderColor: 'rgba(244,114,182,0.6)',
    overflow: 'hidden',
  },
  ring1: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1.5, borderColor: 'rgba(6,214,160,0.6)',
    overflow: 'hidden',
  },
  ringGradient: { flex: 1 },
  core: {
    width: 90, height: 90, borderRadius: 45,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  coreGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  shine: {
    position: 'absolute',
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: 12, left: 16,
  },
  letter: {
    fontSize: 36, fontWeight: '800',
    color: '#fff', letterSpacing: -1,
  },
  particle: {
    position: 'absolute',
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#06D6A0',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#07071a',
  },
  ambientTop: {
    position: 'absolute', width: 350, height: 350, borderRadius: 175,
    backgroundColor: '#7C3AED', top: -120, right: -100, opacity: 0.07,
  },
  ambientBottom: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: '#06D6A0', bottom: -80, left: -80, opacity: 0.05,
  },
  textWrap: { alignItems: 'center', marginBottom: 16 },
  appName: {
    fontSize: 38, fontWeight: '200',
    color: '#F8F8FF', letterSpacing: 16,
  },
  nameLine: {
    width: 40, height: 1.5,
    backgroundColor: '#7C3AED',
    marginTop: 10, opacity: 0.8,
  },
  tagline: {
    fontSize: 15, fontWeight: '300',
    color: 'rgba(248,248,255,0.4)',
    textAlign: 'center', lineHeight: 26,
    letterSpacing: 0.5, marginBottom: 80,
  },
  loaderWrap: {
    position: 'absolute', bottom: 60,
    alignItems: 'center', gap: 10,
  },
  loaderTrack: {
    width: 48, height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1, overflow: 'hidden',
  },
  loaderFill: {
    width: '70%', height: '100%',
    backgroundColor: '#7C3AED', borderRadius: 1,
  },
  loaderText: {
    fontSize: 11,
    color: 'rgba(248,248,255,0.3)',
    letterSpacing: 0.5,
  },
});