import { Slot, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IngredientsProvider } from 'context/ingredients/IngredientsProvider';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';
import { RecipesProvider } from 'context/RecipesContext';
import { AlertProvider } from 'context/AlertContext';
import AlertMessage from '../app/components/AlertMessage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationProvider } from '../context/NavigationContext'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import '../global.css'
import CustomTabs from './components/CustomTab';
import { useRouter } from 'expo-router';
import { useRef } from 'react';

export default function RootLayout() {
  const theme = useColorScheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const hasCheckedProfile = useRef(false);
 useEffect(() => {
    if (hasCheckedProfile.current) return;
    hasCheckedProfile.current = true;

    const checkProfile = async () => {
      try {
        const userProfile = await AsyncStorage.getItem('userProfile');
        setHasProfile(!!userProfile);
      } catch {
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
  }, []);
  
  useEffect(() => {
    if (!loading && !hasProfile) {
      // Redirect ke halaman Welcome kalau belum ada profile
      router.replace('/Welcome');
    }
  }, [loading, hasProfile, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="small"/>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationProvider>
        <AlertProvider>
          <DraftRecipeProvider>
            <RecipesProvider>
              <IngredientsProvider>
                <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" style={{ flex: 1 }}>
                  <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
                  {/* <Sidebar> */}
                  <CustomTabs>
                    <Stack screenOptions={{ animation: 'none', headerShown: false, }} />

                  </CustomTabs>
                  {/* </Sidebar> */}
                  <AlertMessage />
                </SafeAreaView>
              </IngredientsProvider>
            </RecipesProvider>
          </DraftRecipeProvider>
        </AlertProvider>
      </NavigationProvider>
    </GestureHandlerRootView>
  );
}
