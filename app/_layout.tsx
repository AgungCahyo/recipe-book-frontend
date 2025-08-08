// app/_layout.tsx
import { Slot, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IngredientsProvider } from 'context/IngredientsContext';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';
import { RecipesProvider } from 'context/RecipesContext';
import { AlertProvider } from 'context/AlertContext';
import AlertMessage from '../app/components/AlertMessage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomTabs from './components/CustomTab';

export default function RootLayout() {
  const theme = useColorScheme();
  console.log(theme)
 

  return (
    
    <GestureHandlerRootView>
      <AlertProvider>
        <DraftRecipeProvider>
          <IngredientsProvider>
            <RecipesProvider>
              <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
                <Stack  screenOptions={{ animation: 'slide_from_bottom', headerShown: false }}/>
                <AlertMessage />
              </SafeAreaView>
            </RecipesProvider>
          </IngredientsProvider>
        </DraftRecipeProvider>
      </AlertProvider>
    </GestureHandlerRootView>
  );
}