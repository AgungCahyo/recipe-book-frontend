//context/ingredients/IngredientsProvider.tsx

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
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
};

export const IngredientsContext = createContext<IngredientContextType | null>(null);

export function IngredientsProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [idBeingEdited, setIdBeingEdited] = useState<string | null>(null);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showAlert } = useAlert();

  // FIXED: Stable callback functions
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
      setIngredients((prev) =>
        prev.map((item) =>
          item.id === idBeingEdited
            ? { ...item, name: trimmedName, unit, quantity, totalPrice, pricePerUnit }
            : item
        )
      );
      showAlert('Perubahan disimpan', 'success');
    } else {
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
  }, [isEditing, idBeingEdited, resetForm, showAlert]);

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
    showAlert('Bahan dihapus', 'success');
  }, [showAlert]);

  const editIngredient = useCallback((id: string) => {
    setIsEditing(true);
    setIdBeingEdited(id);
    setIsFormModalVisible(true);
  }, []);

  const clearAllIngredients = useCallback(async () => {
    try {
      setIngredients([]);
      showAlert('Semua data bahan dihapus', 'success');
    } catch (error) {
      showAlert('Gagal menghapus semua bahan', 'error');
    }
  }, [showAlert]);

  const addIngredient = useCallback((item: Ingredient) => {
    setIngredients((prev) => [...prev, item]);
  }, []);

  const addIngredientFromCSV = useCallback((item: { 
    name: string; 
    quantity: string; 
    totalPrice: string; 
    unit: string 
  }) => {
    const parsed = parseIngredientFromCSV(item);
    if (parsed) {
      setIngredients((prev) => [...prev, parsed]);
    }
  }, []);

  // FIXED: Optimize bulk operations
  const removeManyIngredients = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    
    const idsSet = new Set(ids); // O(1) lookup
    setIngredients((prev) => prev.filter((item) => !idsSet.has(item.id)));
    showAlert(`${ids.length} bahan dihapus`, 'success');
  }, [showAlert]);

  const addManyIngredients = useCallback((items: Ingredient[]) => {
    if (items.length === 0) return;
    
    setIngredients((prev) => [...prev, ...items]);
    showAlert(`${items.length} bahan ditambahkan`, 'success');
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

  // Load on mount
  useEffect(() => {
    reloadIngredients();
  }, [reloadIngredients]);

  // FIXED: Debounce auto-save to prevent too many writes
  useEffect(() => {
    if (isInitialized && ingredients.length >= 0) {
      const timeoutId = setTimeout(() => {
        saveIngredients(ingredients).catch((err) => 
          console.error('Gagal simpan bahan:', err)
        );
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [ingredients, isInitialized]);

  // FIXED: Stable context value - only recreate when necessary
  const contextValue = useMemo(() => ({
    isEditing,
    setIsEditing,
    idBeingEdited,
    setIdBeingEdited,
    ingredients,
    handleSubmit,
    removeIngredient,
    editIngredient,
    satuanList,
    isFormModalVisible,
    setIsFormModalVisible,
    resetForm,
    clearAllIngredients,
    addIngredient,
    addIngredientFromCSV,
    removeManyIngredients,
    addManyIngredients,
    parseIngredientFromCSV,
    reloadIngredients,
  }), [
    isEditing,
    idBeingEdited,
    ingredients,
    isFormModalVisible,
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
  ]);

  return (
    <IngredientsContext.Provider value={contextValue}>
      {children}
    </IngredientsContext.Provider>
  );
}

export const useIngredients = () => {
  const context = useContext(IngredientsContext);
  if (!context) throw new Error('useIngredients must be used within IngredientsProvider');
  return context;
};