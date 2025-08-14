//app/_layout.tsx 

import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IngredientsProvider } from 'context/ingredients/IngredientsProvider';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';
import { RecipesProvider } from 'context/RecipesContext';
import { AuthProvider } from 'context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationProvider } from '../context/NavigationContext';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import ImmersiveMode from 'react-native-immersive-mode';



export default function RootLayout() {
  const theme = useColorScheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const hasCheckedProfile = useRef(false);
  const hasNavigated = useRef(false);
  const [fontsLoaded] = useFonts({
    ArchCondensed: require('../assets/fonts/Arch-Condensed.otf'),
  });

  useEffect(() => {
    if (hasCheckedProfile.current) return;
    hasCheckedProfile.current = true;

    const checkProfile = async () => {
      try {
        const userProfile = await AsyncStorage.getItem('userProfile');
        const profileExists = !!userProfile;
        setHasProfile(profileExists);
        console.log('Profile check:', profileExists ? 'Profile exists' : 'No profile found');
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  useEffect(() => {
    // Prevent multiple navigations
    if (loading || hasNavigated.current) return;

    hasNavigated.current = true;

    if (!hasProfile) {
      router.replace('/Welcome');
    } else {
      router.replace('/main');
    }
  }, [loading, hasProfile, router]);

  // Show loading screen while checking profile
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator
          size="large"
          color={theme === 'dark' ? '#ffffff' : '#000000'}
        />
      </View>
    );
  }


  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'green' }}
        text1Style={{ fontSize: 15 }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        text1Style={{ fontSize: 15 }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'blue' }}
        text1Style={{ fontSize: 15 }}
      />
    ),
    warning: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'orange' }}
        text1Style={{ fontSize: 15 }}
      />
    ),
  };
  ImmersiveMode.fullLayout(true)
  ImmersiveMode.setBarMode('BottomSticky');

  if (!fontsLoaded) {
    return null; // atau bisa pakai <AppLoading /> kalau ingin splash screen
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationProvider>
          <IngredientsProvider>
            <DraftRecipeProvider>
              <RecipesProvider>
                <SafeAreaView
                  style={{ flex: 1 }}
                >
                  <StatusBar
                    style={theme === 'dark' ? 'light' : 'dark'}
                    backgroundColor="transparent"
                    translucent
                  />

                  <Stack
                    screenOptions={{
                      animation: 'none',
                      headerShown: false,
                      gestureEnabled: true,
                    }}
                  />

                </SafeAreaView>
              </RecipesProvider>
            </DraftRecipeProvider>
          </IngredientsProvider>
        </NavigationProvider>
        <Toast config={toastConfig} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}