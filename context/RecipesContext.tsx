// context/recipesContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as FileSystem from 'expo-file-system';
import { Ingredient } from './ingredients/IngredientsProvider';

export type RecipeIngredient = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  imageUris?: string[];
  category?: string;
  hpp?: number;
  sellingPrice?: number;
  margin?: number;
};

type RecipesContextType = {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<string>;
  editRecipe: (id: string, updated: Omit<Recipe, 'id'>) => Promise<void>;
  updateRecipeImage: (id: string, uri: string) => void;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  reloadRecipes: () => Promise<void>;
  getRecipeWithUpdatedCost: (id: string, allIngredients: Ingredient[]) => Recipe | undefined;
};

const RecipesContext = createContext<RecipesContextType | null>(null);
const STORAGE_KEY = 'recipes_data';

export const RecipesProvider = ({ children }: { children: React.ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [initialized, setInitialized] = useState(false);

  // FIXED: Stable functions with useCallback
  const loadRecipes = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        setRecipes(parsed);
      }
    } catch (err) {
      console.error('❌ Gagal load recipes:', err);
      setRecipes([]); // Fallback to empty array
    } finally {
      setInitialized(true);
    }
  }, []);

  const addRecipe = useCallback(async (data: Omit<Recipe, 'id'>): Promise<string> => {
    const newId = uuid.v4() as string;
    const newRecipe: Recipe = {
      ...data,
      id: newId,
      ingredients: data.ingredients.map((ing) => ({
        ...ing,
        id: ing.id || (uuid.v4() as string), // Handle existing IDs
      })),
    };

    setRecipes((prev) => [...prev, newRecipe]);
    console.log('RESEP BARU', JSON.stringify(newRecipe, null, 2));
    return newId;
  }, []);

  const editRecipe = useCallback(async (id: string, updated: Omit<Recipe, 'id'>): Promise<void> => {
    const updatedWithIds: Recipe = {
      ...updated,
      id,
      ingredients: updated.ingredients.map((ing) => ({
        ...ing,
        id: ing.id || (uuid.v4() as string),
      })),
    };

    setRecipes((prev) => prev.map(r => (r.id === id ? updatedWithIds : r)));
  }, []);

  const deleteRecipe = useCallback(async (id: string): Promise<void> => {
    setRecipes(prev => {
      const recipeToDelete = prev.find((r) => r.id === id);
      
      // Background cleanup of images - don't block UI
      if (recipeToDelete?.imageUris?.length) {
        Promise.all(
          recipeToDelete.imageUris.map(uri =>
            FileSystem.deleteAsync(uri, { idempotent: true }).catch(err => {
              console.warn(`❌ Gagal hapus gambar: ${uri}`, err);
            })
          )
        ).catch(console.warn);
      }

      return prev.filter(r => r.id !== id);
    });
  }, []);

  const updateRecipeImage = useCallback((id: string, uri: string) => {
    setRecipes(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, imageUris: [...(r.imageUris || []), uri] }
          : r
      )
    );
  }, []);

  const reloadRecipes = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = json ? JSON.parse(json) : [];
      setRecipes(parsed);
    } catch (err) {
      console.error('Reload recipes error:', err);
      setRecipes([]);
    }
  }, []);

  // FIXED: Optimize with memoization for better performance
  const getRecipeWithUpdatedCost = useCallback((id: string, allIngredients: Ingredient[]) => {
    const original = recipes.find((r) => r.id === id);
    if (!original) return undefined;

    // Create map only once
    const ingredientPriceMap = allIngredients.reduce((map, ingredient) => {
      map[ingredient.name] = ingredient.pricePerUnit;
      return map;
    }, {} as Record<string, number>);

    // Update ingredients with O(1) lookup
    const updatedIngredients = original.ingredients.map((item) => {
      const pricePerUnit = ingredientPriceMap[item.name] ?? 0;
      const cost = parseFloat((pricePerUnit * item.quantity).toFixed(2));
      return { ...item, cost };
    });

    const updatedHPP = updatedIngredients.reduce((acc, cur) => acc + (cur.cost || 0), 0);

    return {
      ...original,
      ingredients: updatedIngredients,
      hpp: parseFloat(updatedHPP.toFixed(2)),
    };
  }, [recipes]);

  const getRecipeById = useCallback((id: string) => {
    return recipes.find(r => r.id === id);
  }, [recipes]);

  // Load on mount
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // FIXED: Only save when actually initialized and recipes changed
  useEffect(() => {
    if (initialized && recipes.length >= 0) { // Allow empty array to be saved
      // Debounce saves to prevent too many writes
      const timeoutId = setTimeout(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
          .catch(err => console.error('Save recipes error:', err));
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [recipes, initialized]);

  // FIXED: Stable context value - only recreate when recipes change
  const contextValue = useMemo(() => ({
    recipes,
    addRecipe,
    editRecipe,
    updateRecipeImage,
    deleteRecipe,
    getRecipeById,
    reloadRecipes,
    getRecipeWithUpdatedCost,
  }), [
    recipes,
    addRecipe,
    editRecipe,
    updateRecipeImage,
    deleteRecipe,
    getRecipeById,
    reloadRecipes,
    getRecipeWithUpdatedCost
  ]);

  return (
    <RecipesContext.Provider value={contextValue}>
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) throw new Error('useRecipes must be used within RecipesProvider');
  return context;
};