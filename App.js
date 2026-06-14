import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { HealthProvider } from './src/context/HealthContext';
import AppNavigator from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      console.log('Notification tapped, navigate to:', screen);
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthProvider>
      <HealthProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <AppNavigator />
      </HealthProvider>
    </AuthProvider>
  );
}