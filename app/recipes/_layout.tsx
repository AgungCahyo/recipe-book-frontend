// app/_Layout.tsx

import { Stack, Tabs } from 'expo-router';
import { RecipesProvider } from 'context/RecipesContext';
import { IngredientsProvider } from 'context/IngredientsContext';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';

export default function RecipesLayout() {
  return (
    <DraftRecipeProvider>
      <IngredientsProvider>
        <RecipesProvider>
          <Stack screenOptions={{ headerShown: false,  animation: 'flip' }} />
        </RecipesProvider>
      </IngredientsProvider>
    </DraftRecipeProvider>
  );
}
