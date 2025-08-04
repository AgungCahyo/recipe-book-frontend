// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IngredientsProvider } from 'context/IngredientsContext';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';
import { RecipesProvider } from 'context/RecipesContext';
import { AlertProvider } from 'context/AlertContext';
import AlertMessage from './components/AlertMessage';

export default function RootLayout() {
  const theme = useColorScheme();

  return (
    <AlertProvider>
    <IngredientsProvider>
      <DraftRecipeProvider>
        <RecipesProvider>
          <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
            <Slot />
            <AlertMessage />
          </SafeAreaView>
        </RecipesProvider>
      </DraftRecipeProvider>
    </IngredientsProvider>
    </AlertProvider>
  );
}
