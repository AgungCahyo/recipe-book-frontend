// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { IngredientsProvider } from 'context/IngredientsContext';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';
import { RecipesProvider } from 'context/RecipesContext';

export default function RootLayout() {
  const theme = useColorScheme();

  return (
    <IngredientsProvider>
      <DraftRecipeProvider>
        <RecipesProvider>
          <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
            <Slot />
          </SafeAreaView>
        </RecipesProvider>
      </DraftRecipeProvider>
    </IngredientsProvider>
  );
}
