import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';

import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import HydrationScreen from '../screens/modules/HydrationScreen';
import SleepScreen from '../screens/modules/SleepScreen';
import HabitsScreen from '../screens/modules/HabitsScreen';
import NutritionScreen from '../screens/modules/NutritionScreen';
import CompanionScreen from '../screens/modules/CompanionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabs = [
  { name: 'Home', icon: 'home-outline', iconFocused: 'home', label: 'Home', color: colors.primary },
  { name: 'Hydration', icon: 'water-outline', iconFocused: 'water', label: 'Water', color: colors.hydration },
  { name: 'Companion', icon: 'mic', iconFocused: 'mic', label: '', color: colors.companion, isCenter: true },
  { name: 'Reports', icon: 'bar-chart-outline', iconFocused: 'bar-chart', label: 'Reports', color: colors.sleep },
  { name: 'Profile', icon: 'person-outline', iconFocused: 'person', label: 'Profile', color: colors.primaryLight },
];

function TabButton({ onPress, isFocused, icon, label, color, isCenter }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.85, useNativeDriver: true, friction: 8 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start();
    onPress();
  };

  if (isCenter) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.centerBtnWrapper}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={isFocused ? [colors.companion, colors.primary] : [colors.primary, colors.primaryDark]}
            style={styles.centerBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mic" size={26} color={colors.white} />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.tabBtn}>
      <Animated.View style={[styles.tabBtnInner, { transform: [{ scale: scaleAnim }] }]}>
        {isFocused && <View style={[styles.tabActiveBg, { backgroundColor: color + '20' }]} />}
        <Ionicons
          name={isFocused ? icon.replace('-outline', '') : icon}
          size={22}
          color={isFocused ? color : colors.textMuted}
        />
        <Text style={[styles.tabLabel, { color: isFocused ? color : colors.textMuted }]}>
          {label}
        </Text>
        {isFocused && <View style={[styles.tabDot, { backgroundColor: color }]} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.tabBarWrapper}>
      <LinearGradient colors={['rgba(10,10,26,0.98)', 'rgba(26,5,51,0.98)']} style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const tab = tabs[index];
          const isFocused = state.index === index;
          return (
            <TabButton
              key={route.key}
              isFocused={isFocused}
              icon={tab.icon}
              label={tab.label}
              color={tab.color}
              isCenter={tab.isCenter}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </LinearGradient>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Hydration" component={HydrationScreen} />
      <Tab.Screen name="Companion" component={CompanionScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Sleep"
        component={SleepScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Habits"
        component={HabitsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    position: 'relative',
  },
  tabActiveBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  centerBtnWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
});