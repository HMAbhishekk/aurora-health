import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  screen: { width, height },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },

  radius: {
    sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, full: 9999,
  },

  // Premium font system
  fonts: {
    display: 'SpaceGrotesk_700Bold',
    displayMedium: 'SpaceGrotesk_600SemiBold',
    heading: 'SpaceGrotesk_600SemiBold',
    subheading: 'SpaceGrotesk_500Medium',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemibold: 'Inter_600SemiBold',
    caption: 'Inter_300Light',
    label: 'Inter_500Medium',
  },

  fontSize: {
    xs: 11, sm: 13, md: 15, lg: 17, xl: 20,
    xxl: 24, xxxl: 32, display: 40, hero: 52,
  },

  shadow: {
    sm: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    glow: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 16,
    },
  },
};