// context/recipesContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
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

  // OPTIMASI 1: Use refs for debouncing and preventing unnecessary saves
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // OPTIMASI 2: Stable load function with better error handling
  const loadRecipes = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        // Validate data structure
        if (Array.isArray(parsed)) {
          setRecipes(parsed);
        } else {
          console.warn('Invalid recipes data structure, resetting to empty array');
          setRecipes([]);
        }
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.error('❌ Gagal load recipes:', err);
      setRecipes([]);
    } finally {
      setInitialized(true);
    }
  }, []);

const replaceRecipeImage = (recipeId: string, index: number, newUri: string) => {
  setRecipes(prev => 
    prev.map(r => {
      if (r.id !== recipeId) return r;
      const updatedImages = [...(r.imageUris || [])];
      updatedImages[index] = newUri; // replace di index tertentu
      return { ...r, imageUris: updatedImages };
    })
  );
};


  // OPTIMASI 3: More efficient addRecipe with duplicate checking
  const addRecipe = useCallback(async (data: Omit<Recipe, 'id'>): Promise<string> => {
    const trimmedTitle = data.title.trim();
    if (!trimmedTitle) {
      throw new Error('Judul resep tidak boleh kosong');
    }

    // Check for duplicate titles
    const isDuplicate = recipes.some(recipe =>
      recipe.title.toLowerCase().trim() === trimmedTitle.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error('Resep dengan judul tersebut sudah ada');
    }

    const newId = uuid.v4() as string;
    const newRecipe: Recipe = {
      ...data,
      id: newId,
      title: trimmedTitle,
      ingredients: data.ingredients.map((ing) => ({
        ...ing,
        id: ing.id || (uuid.v4() as string),
      })),
    };

    setRecipes((prev) => [...prev, newRecipe]);
    return newId;
  }, [recipes]);

  // OPTIMASI 4: Better editRecipe with change detection
  const editRecipe = useCallback(async (id: string, updated: Omit<Recipe, 'id'>): Promise<void> => {
    const trimmedTitle = updated.title.trim();
    if (!trimmedTitle) {
      throw new Error('Judul resep tidak boleh kosong');
    }

    setRecipes((prev) => {
      const existingRecipe = prev.find(r => r.id === id);
      if (!existingRecipe) {
        throw new Error('Resep tidak ditemukan');
      }

      // Check if there are actual changes
     const hasChanges =
  existingRecipe.title !== trimmedTitle ||
  existingRecipe.description !== updated.description ||
  existingRecipe.category !== updated.category ||
  JSON.stringify(existingRecipe.ingredients) !== JSON.stringify(updated.ingredients) ||
  existingRecipe.sellingPrice !== updated.sellingPrice ||
  existingRecipe.margin !== updated.margin ||
  JSON.stringify(existingRecipe.imageUris || []) !== JSON.stringify(updated.imageUris || []);

      if (!hasChanges) {
        return prev; // No changes, return same array
      }

      const updatedWithIds: Recipe = {
        ...updated,
        id,
        title: trimmedTitle,
        ingredients: updated.ingredients.map((ing) => ({
          ...ing,
          id: ing.id || (uuid.v4() as string),
        })),
      };

      return prev.map(r => (r.id === id ? updatedWithIds : r));
    });
  }, []);

  // OPTIMASI 5: Efficient deleteRecipe with validation
  const deleteRecipe = useCallback(async (id: string): Promise<void> => {
    setRecipes(prev => {
      const recipeIndex = prev.findIndex(r => r.id === id);
      if (recipeIndex === -1) {
        console.warn(`Recipe with id ${id} not found`);
        return prev; // No change if recipe doesn't exist
      }

      const recipeToDelete = prev[recipeIndex];

      // Background cleanup of images - don't block UI
      if (recipeToDelete.imageUris?.length) {
        Promise.all(
          recipeToDelete.imageUris.map(uri =>
            FileSystem.deleteAsync(uri, { idempotent: true }).catch(err => {
              if (__DEV__) {
                console.warn(`❌ Gagal hapus gambar: ${uri}`, err);
              }
            })
          )
        ).catch(err => {
          if (__DEV__) {
            console.warn('Error cleaning up images:', err);
          }
        });
      }

      return prev.filter(r => r.id !== id);
    });
  }, []);

  // OPTIMASI 6: Better updateRecipeImage with validation
  const updateRecipeImage = useCallback((id: string, uri: string) => {
    if (!uri || !id) return;

    setRecipes(prev => {
      const recipeExists = prev.some(r => r.id === id);
      if (!recipeExists) {
        console.warn(`Recipe with id ${id} not found for image update`);
        return prev;
      }

      return prev.map(r =>
        r.id === id
          ? {
            ...r,
            imageUris: [...(r.imageUris || []).filter(existingUri => existingUri !== uri), uri] // Prevent duplicates
          }
          : r
      );
    });
  }, []);

  // OPTIMASI 7: Optimized reloadRecipes
  const reloadRecipes = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = json ? JSON.parse(json) : [];

      if (Array.isArray(parsed)) {
        setRecipes(parsed);
      } else {
        console.warn('Invalid data format during reload, keeping current data');
      }
    } catch (err) {
      console.error('Reload recipes error:', err);
      // Don't clear existing recipes on reload failure
    }
  }, []);

  // OPTIMASI 8: Highly optimized getRecipeWithUpdatedCost with Map-based lookup
  const getRecipeWithUpdatedCost = useCallback((id: string, allIngredients: Ingredient[]) => {
    const original = recipes.find((r) => r.id === id);
    if (!original) return undefined;

    // Use Map for O(1) lookup performance
    const ingredientPriceMap = new Map<string, number>();
    allIngredients.forEach(ingredient => {
      ingredientPriceMap.set(ingredient.name.toLowerCase().trim(), ingredient.pricePerUnit);
    });

    // Update ingredients with optimized lookup
    const updatedIngredients = original.ingredients.map((item) => {
      const normalizedName = item.name.toLowerCase().trim();
      const pricePerUnit = ingredientPriceMap.get(normalizedName) ?? 0;
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

  // OPTIMASI 9: Memoized getRecipeById with Map for better performance when recipes are many
  const recipesMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach(recipe => {
      map.set(recipe.id, recipe);
    });
    return map;
  }, [recipes]);

  const getRecipeById = useCallback((id: string) => {
    return recipesMap.get(id);
  }, [recipesMap]);

  // Load on mount
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // OPTIMASI 10: Improved auto-save with better debouncing (same as IngredientsProvider)
  useEffect(() => {
    if (!initialized || recipes.length < 0) return;

    // Create a stable string representation for comparison
    const recipesString = JSON.stringify(recipes);

    // Skip save if data hasn't actually changed
    if (recipesString === lastSavedRef.current) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 1 second debounce for better performance
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, recipesString);
        lastSavedRef.current = recipesString;

        if (__DEV__) {
          
        }
      } catch (error) {
        console.error('Gagal simpan recipes:', error);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [recipes, initialized]);

  // OPTIMASI 11: Split context value into stable parts (same pattern as IngredientsProvider)
  const stableActions = useMemo(() => ({
    addRecipe,
    editRecipe,
    updateRecipeImage,
    deleteRecipe,
    reloadRecipes,
    getRecipeWithUpdatedCost,
    getRecipeById,
  }), [
    addRecipe,
    editRecipe,
    updateRecipeImage,
    deleteRecipe,
    reloadRecipes,
    getRecipeWithUpdatedCost,
    getRecipeById,
  ]);

  const stableData = useMemo(() => ({
    recipes,
  }), [recipes]);

  // OPTIMASI 12: Final context value - only recreate when major parts change
  const contextValue = useMemo(() => ({
    ...stableData,
    ...stableActions,
  }), [stableData, stableActions]);

  return (
    <RecipesContext.Provider value={contextValue}>
      {children}
    </RecipesContext.Provider>
  );
};

// OPTIMASI 13: Main hook
export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) throw new Error('useRecipes must be used within RecipesProvider');
  return context;
};

// OPTIMASI 14: Selector hooks for better performance (same pattern as IngredientsProvider)
export const useRecipesData = () => {
  const { recipes } = useRecipes();
  return recipes;
};

export const useRecipesActions = () => {
  const {
    addRecipe,
    editRecipe,
    updateRecipeImage,
    deleteRecipe,
    reloadRecipes,
  } = useRecipes();

  return useMemo(() => ({
    addRecipe,
    editRecipe,
    updateRecipeImage,
    deleteRecipe,
    reloadRecipes,
  }), [addRecipe, editRecipe, updateRecipeImage, deleteRecipe, reloadRecipes]);
};

export const useRecipeById = (id: string) => {
  const { getRecipeById } = useRecipes();
  return useMemo(() => getRecipeById(id), [getRecipeById, id]);
};

export const useRecipeWithUpdatedCost = (id: string, ingredients: Ingredient[]) => {
  const { getRecipeWithUpdatedCost } = useRecipes();
  return useMemo(() =>
    getRecipeWithUpdatedCost(id, ingredients),
    [getRecipeWithUpdatedCost, id, ingredients]
  );
}