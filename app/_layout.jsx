import React from "react";
import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { ClerkProvider } from '@clerk/clerk-expo';
import { StyleSettingsProvider } from './settings/StyleSettingsContext';
import { View } from 'react-native'; 
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Manrope-Regular': require('./../assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium': require('./../assets/fonts/Manrope-Medium.ttf'),
    'Manrope-Bold': require('./../assets/fonts/Manrope-Bold.ttf'),
  });

  const tokenCache = {
    async getToken(key) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (err) {
        console.error('Error getting token from SecureStore', err);
        return null;
      }
    },
    async saveToken(key, value) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.error('Error saving token to SecureStore', err);
      }
    },
  };

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

 
  if (!fontsLoaded) {
    return <View />; // Wait until fonts are loaded
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StyleSettingsProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
        </Stack>
      </StyleSettingsProvider>
    </ClerkProvider>
  );
}
