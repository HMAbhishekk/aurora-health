import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';

export default function GlowCard({ children, style, glowColor = colors.primary, gradient }) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Glow layer */}
      <View style={[styles.glow, { backgroundColor: glowColor }]} />
      {/* Card */}
      {gradient ? (
        <LinearGradient colors={gradient} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {children}
        </LinearGradient>
      ) : (
        <View style={styles.card}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  glow: {
    position: 'absolute',
    top: 8, left: 8, right: 8, bottom: -4,
    borderRadius: 20,
    opacity: 0.15,
    filter: 'blur(12px)',
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
});