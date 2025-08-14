// data/categories.ts
export const recipeCategories = [
  'Cemilan',
  'Minuman',
  'Dessert',
] as const;

export type RecipeCategory = (typeof recipeCategories)[number];
