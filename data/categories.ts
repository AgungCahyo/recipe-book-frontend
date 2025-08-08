// data/categories.ts
export const recipeCategories = [
  'Sarapan',
  'Makan Siang',
  'Makan Malam',
  'Cemilan',
  'Minuman',
  'Dessert',
  'Lauk-Pauk',
  'Sayuran',
] as const;

export type RecipeCategory = (typeof recipeCategories)[number];
