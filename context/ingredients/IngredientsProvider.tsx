//context/ingredients/IngredientsProvider.tsx

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import uuid from 'react-native-uuid';
import { useAlert } from '../AlertContext';
import { satuanList } from './constant';
import { loadIngredients, saveIngredients } from './utils/storage';
import { parseIngredientFromCSV } from './utils/parsers';

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  totalPrice: number;
  pricePerUnit: number;
};

type IngredientInput = {
  name: string;
  unit: string;
  quantity: number;
  totalPrice: number;
};

type IngredientContextType = {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  idBeingEdited: string | null;
  setIdBeingEdited: (val: string | null) => void;
  ingredients: Ingredient[];
  handleSubmit: (input: IngredientInput) => void;
  removeIngredient: (id: string) => void;
  editIngredient: (id: string) => void;
  satuanList: string[];
  isFormModalVisible: boolean;
  setIsFormModalVisible: (val: boolean) => void;
  resetForm: () => void;
  clearAllIngredients: () => void;
  addIngredient: (item: Ingredient) => void;
  reloadIngredients: () => void;
  addIngredientFromCSV: (item: {
    name: string;
    quantity: string;
    totalPrice: string;
    unit: string;
  }) => void;
  removeManyIngredients: (ids: string[]) => void;
  addManyIngredients: (items: Ingredient[]) => void;
  parseIngredientFromCSV: typeof parseIngredientFromCSV;
  getIngredientById: (id: string) => Ingredient | undefined;
  getIngredientByName: (name: string) => Ingredient | undefined;
};

export const IngredientsContext = createContext<IngredientContextType | null>(null);

export function IngredientsProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [idBeingEdited, setIdBeingEdited] = useState<string | null>(null);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showAlert } = useAlert();

  // OPTIMASI 1: Use refs for debouncing and preventing unnecessary saves
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // OPTIMASI 2: Stable callback functions with proper dependencies
  const resetForm = useCallback(() => {
    setIsEditing(false);
    setIdBeingEdited(null);
    setIsFormModalVisible(false);
  }, []);

  const handleSubmit = useCallback(({ name, quantity, totalPrice, unit }: IngredientInput) => {
    const trimmedName = name.trim();
    if (!trimmedName || quantity <= 0 || totalPrice <= 0 || !unit.trim()) {
      showAlert('Semua field harus diisi dengan benar', 'error');
      return;
    }

    const pricePerUnit = parseFloat((totalPrice / quantity).toFixed(2));

    if (isEditing && idBeingEdited) {
      // OPTIMASI 3: More efficient update - only update if actually changed
      setIngredients((prev) => {
        const existingItem = prev.find(item => item.id === idBeingEdited);
        if (existingItem && 
            existingItem.name === trimmedName &&
            existingItem.unit === unit &&
            existingItem.quantity === quantity &&
            existingItem.totalPrice === totalPrice) {
          return prev; // No change, return same array
        }
        
        return prev.map((item) =>
          item.id === idBeingEdited
            ? { ...item, name: trimmedName, unit, quantity, totalPrice, pricePerUnit }
            : item
        );
      });
      showAlert('Perubahan disimpan', 'success');
    } else {
      // OPTIMASI 4: Check for duplicates before adding
      const normalizedName = trimmedName.toLowerCase();
      const isDuplicate = ingredients.some(item => 
        item.name.toLowerCase() === normalizedName
      );
      
      if (isDuplicate) {
        showAlert('Bahan dengan nama tersebut sudah ada', 'warning');
        return;
      }

      const newId = uuid.v4() as string;
      const newIngredient: Ingredient = {
        id: newId,
        name: trimmedName,
        unit,
        quantity,
        totalPrice,
        pricePerUnit
      };
      
      setIngredients((prev) => [...prev, newIngredient]);
      showAlert('Bahan berhasil ditambahkan', 'success');
    }

    resetForm();
  }, [isEditing, idBeingEdited, ingredients, resetForm, showAlert]);

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (filtered.length === prev.length) {
        // Item not found, no change needed
        return prev;
      }
      return filtered;
    });
    showAlert('Bahan dihapus', 'success');
  }, [showAlert]);

  const editIngredient = useCallback((id: string) => {
    // OPTIMASI 5: Validate item exists before editing
    const itemExists = ingredients.some(item => item.id === id);
    if (!itemExists) {
      showAlert('Bahan tidak ditemukan', 'error');
      return;
    }
    
    setIsEditing(true);
    setIdBeingEdited(id);
    setIsFormModalVisible(true);
  }, [ingredients, showAlert]);

  const clearAllIngredients = useCallback(async () => {
    try {
      if (ingredients.length === 0) {
        showAlert('Tidak ada data untuk dihapus', 'warning');
        return;
      }
      
      setIngredients([]);
      showAlert('Semua data bahan dihapus', 'success');
    } catch (error) {
      showAlert('Gagal menghapus semua bahan', 'error');
    }
  }, [ingredients.length, showAlert]);

  const addIngredient = useCallback((item: Ingredient) => {
    // OPTIMASI 6: Validate item before adding
    if (!item.id || !item.name?.trim()) {
      console.warn('Invalid ingredient:', item);
      return;
    }
    
    setIngredients((prev) => {
      // Check if already exists
      if (prev.some(existing => existing.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const addIngredientFromCSV = useCallback((item: { 
    name: string; 
    quantity: string; 
    totalPrice: string; 
    unit: string 
  }) => {
    const parsed = parseIngredientFromCSV(item);
    if (parsed) {
      addIngredient(parsed);
    }
  }, [addIngredient]);

  // OPTIMASI 7: More efficient bulk operations with validation
  const removeManyIngredients = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    
    const idsSet = new Set(ids);
    let removedCount = 0;
    
    setIngredients((prev) => {
      const filtered = prev.filter((item) => {
        const shouldRemove = idsSet.has(item.id);
        if (shouldRemove) removedCount++;
        return !shouldRemove;
      });
      
      return filtered;
    });
    
    if (removedCount > 0) {
      showAlert(`${removedCount} bahan dihapus`, 'success');
    } else {
      showAlert('Tidak ada bahan yang dihapus', 'warning');
    }
  }, [showAlert]);

  const addManyIngredients = useCallback((items: Ingredient[]) => {
    if (items.length === 0) return;
    
    // OPTIMASI 8: Validate and deduplicate items
    const validItems = items.filter(item => 
      item.id && item.name?.trim() && item.quantity > 0 && item.totalPrice > 0
    );
    
    if (validItems.length === 0) {
      showAlert('Tidak ada bahan valid untuk ditambahkan', 'warning');
      return;
    }
    
    setIngredients((prev) => {
      // Create set of existing IDs for faster lookup
      const existingIds = new Set(prev.map(item => item.id));
      const existingNames = new Set(prev.map(item => item.name.toLowerCase().trim()));
      
      // Filter out duplicates
      const newItems = validItems.filter(item => 
        !existingIds.has(item.id) && 
        !existingNames.has(item.name.toLowerCase().trim())
      );
      
      if (newItems.length === 0) {
        return prev; // No new items to add
      }
      
      return [...prev, ...newItems];
    });
    
    showAlert(`${validItems.length} bahan ditambahkan`, 'success');
  }, [showAlert]);

  const reloadIngredients = useCallback(async () => {
    try {
      const loaded = await loadIngredients();
      setIngredients(loaded);
      setIsInitialized(true);
    } catch (error) {
      console.error('Gagal load bahan:', error);
      setIngredients([]);
      setIsInitialized(true);
    }
  }, []);

  // OPTIMASI 9: Add getter functions with Map-based lookup for better performance
  const ingredientsMap = useMemo(() => {
    const idMap = new Map<string, Ingredient>();
    const nameMap = new Map<string, Ingredient>();
    
    ingredients.forEach(ingredient => {
      idMap.set(ingredient.id, ingredient);
      nameMap.set(ingredient.name.toLowerCase().trim(), ingredient);
    });
    
    return { idMap, nameMap };
  }, [ingredients]);

  const getIngredientById = useCallback((id: string) => {
    return ingredientsMap.idMap.get(id);
  }, [ingredientsMap.idMap]);

  const getIngredientByName = useCallback((name: string) => {
    return ingredientsMap.nameMap.get(name.toLowerCase().trim());
  }, [ingredientsMap.nameMap]);

  // Load on mount
  useEffect(() => {
    reloadIngredients();
  }, [reloadIngredients]);

  // OPTIMASI 10: Improved auto-save with better debouncing
  useEffect(() => {
    if (!isInitialized || ingredients.length < 0) return;

    // Create a stable string representation for comparison
    const ingredientsString = JSON.stringify(ingredients);
    
    // Skip save if data hasn't actually changed
    if (ingredientsString === lastSavedRef.current) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // OPTIMASI 11: Longer debounce for better performance (1 second)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveIngredients(ingredients);
        lastSavedRef.current = ingredientsString;
        
        if (__DEV__) {
          console.log(`Saved ${ingredients.length} ingredients`);
        }
      } catch (error) {
        console.error('Gagal simpan bahan:', error);
        // Optionally show alert for save failures
        // showAlert('Gagal menyimpan data', 'error');
      }
    }, 1000); // 1 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [ingredients, isInitialized]);

  // OPTIMASI 12: Split context value into stable parts
  const stableActions = useMemo(() => ({
    handleSubmit,
    removeIngredient,
    editIngredient,
    resetForm,
    clearAllIngredients,
    addIngredient,
    addIngredientFromCSV,
    removeManyIngredients,
    addManyIngredients,
    reloadIngredients,
    getIngredientById,
    getIngredientByName,
  }), [
    handleSubmit,
    removeIngredient,
    editIngredient,
    resetForm,
    clearAllIngredients,
    addIngredient,
    addIngredientFromCSV,
    removeManyIngredients,
    addManyIngredients,
    reloadIngredients,
    getIngredientById,
    getIngredientByName,
  ]);

  const stableData = useMemo(() => ({
    ingredients,
    satuanList,
    parseIngredientFromCSV,
  }), [ingredients]);

  const stableState = useMemo(() => ({
    isEditing,
    idBeingEdited,
    isFormModalVisible,
  }), [isEditing, idBeingEdited, isFormModalVisible]);

  const stableSetters = useMemo(() => ({
    setIsEditing,
    setIdBeingEdited,
    setIsFormModalVisible,
  }), []);

  // OPTIMASI 13: Final context value - only recreate when major parts change
  const contextValue = useMemo(() => ({
    ...stableData,
    ...stableState,
    ...stableActions,
    ...stableSetters,
  }), [stableData, stableState, stableActions, stableSetters]);

  return (
    <IngredientsContext.Provider value={contextValue}>
      {children}
    </IngredientsContext.Provider>
  );
}

// OPTIMASI 14: Main hook
export const useIngredients = () => {
  const context = useContext(IngredientsContext);
  if (!context) throw new Error('useIngredients must be used within IngredientsProvider');
  return context;
};

// OPTIMASI 15: Selector hooks for better performance (same pattern as RecipesProvider)
export const useIngredientsData = () => {
  const { ingredients } = useIngredients();
  return ingredients;
};

export const useIngredientsActions = () => {
  const {
    handleSubmit,
    removeIngredient,
    editIngredient,
    addIngredient,
    removeManyIngredients,
    addManyIngredients,
    clearAllIngredients,
    reloadIngredients,
  } = useIngredients();
  
  return useMemo(() => ({
    handleSubmit,
    removeIngredient,
    editIngredient,
    addIngredient,
    removeManyIngredients,
    addManyIngredients,
    clearAllIngredients,
    reloadIngredients,
  }), [
    handleSubmit,
    removeIngredient,
    editIngredient,
    addIngredient,
    removeManyIngredients,
    addManyIngredients,
    clearAllIngredients,
    reloadIngredients,
  ]);
};

export const useIngredientsForm = () => {
  const {
    isEditing,
    idBeingEdited,
    isFormModalVisible,
    setIsEditing,
    setIdBeingEdited,
    setIsFormModalVisible,
    resetForm,
  } = useIngredients();
  
  return useMemo(() => ({
    isEditing,
    idBeingEdited,
    isFormModalVisible,
    setIsEditing,
    setIdBeingEdited,
    setIsFormModalVisible,
    resetForm,
  }), [
    isEditing,
    idBeingEdited,
    isFormModalVisible,
    setIsEditing,
    setIdBeingEdited,
    setIsFormModalVisible,
    resetForm,
  ]);
};

// OPTIMASI 16: Add selector hooks yang missing untuk consistency dengan RecipesProvider
export const useIngredientsSelectors = () => {
  const { satuanList, parseIngredientFromCSV } = useIngredients();
  
  return useMemo(() => ({
    satuanList,
    parseIngredientFromCSV,
  }), [satuanList, parseIngredientFromCSV]);
};

export const useIngredientById = (id: string) => {
  const { getIngredientById } = useIngredients();
  return useMemo(() => getIngredientById(id), [getIngredientById, id]);
};

export const useIngredientByName = (name: string) => {
  const { getIngredientByName } = useIngredients();
  return useMemo(() => getIngredientByName(name), [getIngredientByName, name]);
};