import { Stack, useRouter, useSegments } from "expo-router";
import { View, Text, StyleSheet, Platform, StatusBar } from "react-native";
import * as SplashScreen from 'expo-splash-screen'; 
import "../global.css"; 
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "@/components/firebase"; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber; 
  }, []);

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, initializing, segments]);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    prepareApp();
  }, []);

  if (initializing) return null;

  return (
    <View style={styles.container}>
      {/* 🔴 RED STATUS BAR: Adjusted for white background transition */}
      <StatusBar barStyle="light-content" backgroundColor="#fe2238" translucent={false} />

      <View style={styles.stackContainer}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#fe2238' }, 
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTitleAlign: 'center',
            headerBackTitle: "", // Fixed the property name for you here
            animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Quick First Aid' }} />
          <Stack.Screen name="chat" options={{ title: 'AI Doctor' }} />
          <Stack.Screen name="voice" options={{ title: 'Voice Assistant' }} />
          <Stack.Screen name="scanner" options={{ title: 'Medicine Scanner' }} />
          <Stack.Screen name="map" options={{ title: 'Medical Facilities' }} />
          <Stack.Screen name="emergency" options={{ title: 'Emergency Center' }} />
          <Stack.Screen name="quick-triage-ai" options={{ title: 'QuickTriage AI' }} />
          <Stack.Screen name="firstaid" options={{ title: 'First Aid Manual' }} />
          <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        </Stack>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 QuickFirstAid. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' }, // Set to white for clean loading
  stackContainer: { flex: 1, backgroundColor: '#ffffff' },
  footer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 11,
    color: "#999",
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
});