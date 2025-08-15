// context/DraftRecipeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
};

export type ImageStatus = {
  uri: string;
  status: 'loading' | 'done' | 'error';
};

type DraftRecipe = {
  title: string;
  steps: string[];
  ingredients: Ingredient[];
  imageUris: ImageStatus[]; // <- diubah dari string[]
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

// FIXED: Create initial draft as constant to prevent recreating
const INITIAL_DRAFT: DraftRecipe = {
  title: '',
  steps: [''],
  ingredients: [],
  imageUris: [],
  category: '',
};

export const DraftRecipeProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraftState] = useState<DraftRecipe>(INITIAL_DRAFT);
  const [isLoaded, setIsLoaded] = useState(false);

  // FIXED: Stable load function
  const loadDraft = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const saved = JSON.parse(json);
        setDraftState(saved);
      }
    } catch (err) {
      console.warn('Failed to load draft:', err);
      setDraftState(INITIAL_DRAFT);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // FIXED: Debounced save to prevent too many writes
  useEffect(() => {
    if (!isLoaded) return; // Don't save until loaded

    const timeoutId = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
        .catch(err => console.warn('Failed to save draft:', err));
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [draft, isLoaded]);

  // FIXED: Stable functions with useCallback
  const setDraft = useCallback((newDraft: DraftRecipe) => {
    setDraftState(newDraft);
  }, []);

  const updateDraft = useCallback((updates: Partial<DraftRecipe>) => {
    setDraftState((prev) => {
      // FIXED: More efficient comparison using JSON.stringify only when necessary
      const newDraft = { ...prev, ...updates };
      
      // Quick shallow comparison first
      let hasChanges = false;
      for (const key in updates) {
        if (prev[key as keyof DraftRecipe] !== newDraft[key as keyof DraftRecipe]) {
          // For arrays/objects, do deep comparison only when shallow comparison fails
          if (typeof prev[key as keyof DraftRecipe] === 'object' && 
              typeof newDraft[key as keyof DraftRecipe] === 'object') {
            if (JSON.stringify(prev[key as keyof DraftRecipe]) !== 
                JSON.stringify(newDraft[key as keyof DraftRecipe])) {
              hasChanges = true;
              break;
            }
          } else {
            hasChanges = true;
            break;
          }
        }
      }

      return hasChanges ? newDraft : prev;
    });
  }, []);

  const clearDraft = useCallback(() => {
    setDraftState(INITIAL_DRAFT);
    AsyncStorage.removeItem(STORAGE_KEY).catch((err) =>
      console.warn('Gagal hapus draft:', err)
    );
  }, []);

  // FIXED: Stable context value
  const contextValue = useMemo(() => ({
    draft,
    setDraft,
    updateDraft,
    clearDraft,
  }), [draft, setDraft, updateDraft, clearDraft]);

  return (
    <DraftRecipeContext.Provider value={contextValue}>
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