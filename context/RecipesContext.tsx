// context/recipesContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';
import uuid from 'react-native-uuid';
import * as FileSystem from 'expo-file-system';


export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  imageUris?: string[];
  category?: string;
  hpp?: number;
};

type RecipesContextType = {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<string>;
  editRecipe: (id: string, updated: Omit<Recipe, 'id'>) => Promise<void>;
  updateRecipeImage: (id: string, uri: string) => void;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  reloadRecipes: () => Promise<void>; // ✅ ini penting
};


const RecipesContext = createContext<RecipesContextType | null>(null);
const STORAGE_KEY = 'recipes_data';

export const RecipesProvider = ({ children }: { children: React.ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    if (initialized) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    }
  }, [recipes, initialized]);

  const loadRecipes = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        setRecipes(JSON.parse(json));
        console.log('✅ Recipes loaded from AsyncStorage');
      }
    } catch (err) {
      console.error('❌ Gagal load recipes:', err);
    } finally {
      setInitialized(true);
    }
  };

  const addRecipe = async (data: Omit<Recipe, 'id'>): Promise<string> => {
    const newId = uuid.v4() as string;
    const newRecipe: Recipe = {
      ...data,
      id: newId,
      ingredients: data.ingredients.map((ing) => ({
        ...ing,
        id: uuid.v4() as string,
      })),
    };

    const updated = [...recipes, newRecipe];
    setRecipes(updated);
    ToastAndroid.show('Resep ditambahkan', ToastAndroid.SHORT);
    return newId;
  };

  const editRecipe = async (id: string, updated: Omit<Recipe, 'id'>): Promise<void> => {
    const updatedWithIds: Recipe = {
      ...updated,
      id,
      ingredients: updated.ingredients.map((ing) =>
        ing.id ? ing : { ...ing, id: uuid.v4() as string }
      ),
    };

    const updatedRecipes = recipes.map(r => (r.id === id ? updatedWithIds : r));
    setRecipes(updatedRecipes);
    ToastAndroid.show('Resep diperbarui', ToastAndroid.SHORT);
  };

 const deleteRecipe = async (id: string): Promise<void> => {
  const recipeToDelete = recipes.find((r) => r.id === id);

  // 🔥 Hapus gambar-gambar permanen (jika ada)
  if (recipeToDelete?.imageUris?.length) {
    for (const uri of recipeToDelete.imageUris) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        console.log(`🗑️ Gambar dihapus: ${uri}`);
      } catch (err) {
        console.warn(`❌ Gagal hapus gambar: ${uri}`, err);
      }
    }
  }

  // Hapus dari state
  const filtered = recipes.filter((r) => r.id !== id);
  setRecipes(filtered);
  ToastAndroid.show('Resep dihapus', ToastAndroid.SHORT);
};
  const updateRecipeImage = (id: string, uri: string) => {
    setRecipes(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, imageUris: [...(r.imageUris || []), uri] }
          : r
      )
    );
  };

  const reloadRecipes = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        setRecipes(JSON.parse(json));
      }
    } catch (err) {
      console.error('❌ Failed to reload recipes:', err);
    }
  };

  const getRecipeById = (id: string) => {
    return recipes.find(r => r.id === id);
  };

  return (
    <RecipesContext.Provider
      value={{ recipes, addRecipe, editRecipe, updateRecipeImage, deleteRecipe, getRecipeById, reloadRecipes }}
    >
      {children}
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) throw new Error('useRecipes must be used within RecipesProvider');
  return context;
};
