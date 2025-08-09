// utils/parseRecipeFromCSV.ts
import uuid from 'react-native-uuid';
import { Ingredient } from 'context/ingredients/IngredientsProvider';

export type RawRecipeCSV = {
  title: string;
  ingredients: string;
  jumlah_bahan: string;
};

export type ParsedIngredient = {
  id: string; 
  ingredientId: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
};

export type ParsedRecipe = {
  title: string;
  ingredients: ParsedIngredient[];
};

export function groupRecipesByTitle(
  rawData: RawRecipeCSV[],
  allIngredients: Ingredient[]
): ParsedRecipe[] {
  const grouped = new Map<string, ParsedRecipe>();

  for (const item of rawData) {
    const title = item.title?.trim();
    const name = item.ingredients?.trim();
    const quantity = parseFloat(item.jumlah_bahan);

    if (!title || !name || isNaN(quantity)) continue;

    if (!grouped.has(title)) {
      grouped.set(title, {
        title,
        ingredients: [],
      });
    }

    const recipe = grouped.get(title)!;

    const found = allIngredients.find(
      (ing) => ing.name.toLowerCase() === name.toLowerCase()
    );

    if (!found) {
      console.warn(`Ingredient "${name}" not found in DB, skipping...`);
      continue;
    }

    const existing = recipe.ingredients.find(
      (ing) => ing.ingredientId === found.id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      recipe.ingredients.push({
        id: uuid.v4() as string,
        ingredientId: found.id,
        name: found.name,
        unit: found.unit,
        quantity,
        cost: 0,
      });
    }
  }

  return Array.from(grouped.values());
}
