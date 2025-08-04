// context/DraftRecipeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
};

type DraftRecipe = {
  title: string;
  steps: string[];
  ingredients: Ingredient[];
  imageUris: string[];
  category: string;
};

type DraftContextType = {
  draft: DraftRecipe;
  setDraft: (draft: DraftRecipe) => void;
  updateDraft: (updates: Partial<DraftRecipe>) => void;
  clearDraft: () => void;
};

const DraftRecipeContext = createContext<DraftContextType | undefined>(undefined);
const STORAGE_KEY = 'draft_recipe_data';

export const DraftRecipeProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraftState] = useState<DraftRecipe>({
    title: '',
    steps: [''],
    ingredients: [],
    imageUris: [],
    category: '',
  });

  // Load draft dari AsyncStorage
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const saved = JSON.parse(json);
          setDraftState(saved);
        }
      } catch (err) {
      }
    };
    loadDraft();
  }, []);

  // Simpan ke AsyncStorage setiap ada perubahan
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
      }
    };
    saveDraft();
  }, [draft]);

  const setDraft = (newDraft: DraftRecipe) => {
    setDraftState(newDraft);
  };

  const updateDraft = (updates: Partial<DraftRecipe>) => {
    setDraftState((prev) => ({ ...prev, ...updates }));
  };

  const clearDraft = () => {
    const emptyDraft = {
      title: '',
      steps: [''],
      ingredients: [],
      imageUris: [],
      category: '',
    };
    setDraftState(emptyDraft);
    AsyncStorage.removeItem(STORAGE_KEY).catch((err) =>
      console.warn('Gagal hapus draft:', err)
    );
  };

  return (
    <DraftRecipeContext.Provider value={{ draft, setDraft, updateDraft, clearDraft }}>
      {children}
    </DraftRecipeContext.Provider>
  );
};

export const useDraftRecipe = () => {
  const context = useContext(DraftRecipeContext);
  if (!context) {
    throw new Error('useDraftRecipe must be used within a DraftRecipeProvider');
  }
  return context;
};
