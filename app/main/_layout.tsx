//app/main/_layout.tsx

import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomTab from '../components/CustomTab'
import { IngredientsProvider } from '../../context/ingredients/IngredientsProvider';
import { DraftRecipeProvider } from '../../context/DraftRecipeContext';
import { RecipesProvider } from '../../context/RecipesContext';
import { useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFonts } from 'expo-font'

export default function MainLayout() {
  const theme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {
    const tabRoutes = ['/main', '/main/recipes', '/main/ingredients'];
    if (!tabRoutes.includes(pathname)) return;

    const backAction = () => {
      if (pathname !== '/main') {
        router.replace('/main');
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [pathname, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={[]} className='bg-transparent'>
        <StatusBar
          style={theme === 'dark' ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent
        />
        <RecipesProvider>
          <IngredientsProvider>
            <DraftRecipeProvider>
              <CustomTab>
                <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
              </CustomTab>
            </DraftRecipeProvider>
          </IngredientsProvider>
        </RecipesProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
