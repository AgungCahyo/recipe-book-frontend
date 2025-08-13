import { Slot, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IngredientsProvider } from 'context/ingredients/IngredientsProvider';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';
import { RecipesProvider } from 'context/RecipesContext';
import { AlertProvider } from 'context/AlertContext';
import { AuthProvider, useAuth } from 'context/AuthContext';
import AlertMessage from '../app/components/AlertMessage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationProvider } from '../context/NavigationContext';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import '../global.css';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

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
      console.log('Navigating to Welcome screen');
      router.replace('/Welcome');
    } else {
      console.log('Navigating to main screen');
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



  if (!fontsLoaded) {
    return null; // atau bisa pakai <AppLoading /> kalau ingin splash screen
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>

        <NavigationProvider>
          <AlertProvider>
            <IngredientsProvider>
              <DraftRecipeProvider>
                <RecipesProvider>
                  <SafeAreaView
                    className="flex-1 bg-background-light dark:bg-background-dark"
                    style={{ flex: 1 }}
                  >
                    <StatusBar
                      style={theme === 'dark' ? 'light' : 'dark'}
                      backgroundColor="transparent"
                      translucent
                    />
                    <Stack
                      screenOptions={{
                        animation: 'none', // Better animation
                        headerShown: false,
                        gestureEnabled: true, // Enable swipe back gesture
                      }}
                    />
                    <AlertMessage />
                  </SafeAreaView>
                </RecipesProvider>
              </DraftRecipeProvider>
            </IngredientsProvider>
          </AlertProvider>
        </NavigationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}