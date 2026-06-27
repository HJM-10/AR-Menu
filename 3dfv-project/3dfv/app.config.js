// app.config.js — Expo configuration
// API_BASE_URL can be overridden via environment variable:
//   API_BASE_URL=http://192.168.1.2:8000 npx expo start
//
// For Android emulator use: http://10.0.2.2:8000
// For iOS simulator use:    http://localhost:8000
// For physical device use:  http://<YOUR_LAN_IP>:8000

export default {
  expo: {
    name: '3dfv',
    slug: '3dfv',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      // Change this to your backend URL for physical device testing
      apiBaseUrl: process.env.API_BASE_URL || 'http://192.168.1.2:8000',
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
      googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || '',
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || '',
    },
    plugins: ['expo-secure-store', 'expo-web-browser'],
  },
};
