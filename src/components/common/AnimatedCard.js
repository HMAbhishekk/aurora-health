import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function AnimatedCard({ children, style, onPress, delay = 0 }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: 2, useNativeDriver: true, friction: 8 }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 100 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 6, tension: 100 }),
    ]).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }, { translateY }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}