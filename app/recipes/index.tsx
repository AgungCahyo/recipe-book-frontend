// app/recipes/_Layout.tsx

import { Stack } from 'expo-router';
import { RecipesProvider } from 'context/RecipesContext';
import { IngredientsProvider } from '../../context/ingredients/IngredientsProvider';
import { DraftRecipeProvider } from 'context/DraftRecipeContext';

export default function RecipesLayout() {
  return (
    <IngredientsProvider>
      <DraftRecipeProvider>
        <RecipesProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }} />
        </RecipesProvider>
      </DraftRecipeProvider>
    </IngredientsProvider>
  );
}
