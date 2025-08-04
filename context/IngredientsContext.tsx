// context/IngredientsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import showToast from '../app/utils/showToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const satuanList = ['gram', 'ml', 'lembar', 'liter', 'butir', 'pcs', 'sdt', 'sdm', 'buah', 'sachet', 'biji', 'porsi',];

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
  addIngredientFromCSV: (item: {
    name: string;
    quantity: string;
    totalPrice: string;
    unit: string;
  }) => void;
  removeManyIngredients: (ids: string[]) => void;
  addManyIngredients: (items: Ingredient[]) => void;
  parseIngredientFromCSV: (item: {
  name: string;
  quantity: string;
  totalPrice: string;
  unit: string;
}) => Ingredient | null;

};

const IngredientsContext = createContext<IngredientContextType | null>(null);

const STORAGE_KEY = 'ingredients_data';

export function IngredientsProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [idBeingEdited, setIdBeingEdited] = useState<string | null>(null);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const resetForm = () => {
    setTimeout(() => {
      setIsEditing(false);
      setIdBeingEdited(null);
      setIsFormModalVisible(false);
    }, 100);
  };

  const handleSubmit = ({ name, quantity, totalPrice, unit }: IngredientInput) => {
    if (!name.trim() || quantity <= 0 || totalPrice <= 0 || !unit.trim()) return;

    const pricePerUnit = parseFloat((totalPrice / quantity).toFixed(2));

    if (isEditing && idBeingEdited) {
      const updated = ingredients.map((item) =>
        item.id === idBeingEdited
          ? {
            ...item,
            name: name.trim(),
            unit,
            quantity,
            totalPrice,
            pricePerUnit,
          }
          : item
      );
      setIngredients(updated);
      showToast('Perubahan disimpan');
    } else {
      const newId = uuid.v4() as string;
      setIngredients((prev) => [
        ...prev,
        {
          id: newId,
          name: name.trim(),
          unit,
          quantity,
          totalPrice,
          pricePerUnit,
        },
      ]);
      showToast('Bahan berhasil ditambahkan');
    }

    resetForm();
  };

  const removeIngredient = (id: string) => {
    const updated = ingredients.filter((item) => item.id !== id);
    setIngredients(updated);
    saveIngredients(updated); // Tambahkan ini
  };


  const editIngredient = (id: string) => {
    const item = ingredients.find((i) => i.id === id);
    if (!item) return;
    setIsEditing(true);
    setIdBeingEdited(id);
    setIsFormModalVisible(true);
  };

  const loadIngredients = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const saved = JSON.parse(json);
        setIngredients(saved);
      }
    } catch (err) {
      console.error('Gagal load ingredients:', err);
    } finally {
      setIsInitialized(true);
    }
  };

  const saveIngredients = async (data: Ingredient[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Gagal simpan ingredients:', err);
    }
  };

  const clearAllIngredients = async () => {
    setIngredients([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    showToast('Semua data bahan dihapus');
  };

  const addIngredient = (item: Ingredient) => {
    setIngredients((prev) => [...prev, item]);
  };
const addIngredientFromCSV = (item: {
  name: string;
  quantity: string;
  totalPrice: string;
  unit: string;
}): Ingredient | null => {
  const name = item.name?.trim();
  const qty = parseFloat(item.quantity);
  const price = parseFloat(item.totalPrice);
  const unit = item.unit?.trim();

  if (!name || !unit || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
    return null;
  }

  const id = uuid.v4() as string;
  const pricePerUnit = parseFloat((price / qty).toFixed(2));

  return {
    id,
    name,
    quantity: qty,
    totalPrice: price,
    unit,
    pricePerUnit,
  };
};


  const removeManyIngredients = (ids: string[]) => {
    const updated = ingredients.filter((item) => !ids.includes(item.id));
    setIngredients(updated);
    saveIngredients(updated);
  };

const addManyIngredients = (items: Ingredient[]) => {
  const updated = [...ingredients, ...items];
  setIngredients(updated);
  saveIngredients(updated);
};

const parseIngredientFromCSV = (item: {
  name: string;
  quantity: string;
  totalPrice: string;
  unit: string;
}): Ingredient | null => {
  const name = item.name?.trim();
  const qty = parseFloat(item.quantity);
  const price = parseFloat(item.totalPrice);
  const unit = item.unit?.trim();

  if (!name || !unit || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
    return null;
  }

  const id = uuid.v4() as string;
  const pricePerUnit = parseFloat((price / qty).toFixed(2));

  return {
    id,
    name,
    quantity: qty,
    totalPrice: price,
    unit,
    pricePerUnit,
  };
};


  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveIngredients(ingredients);
    }
  }, [ingredients, isInitialized]);

  return (
    <IngredientsContext.Provider
      value={{
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
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
}

export const useIngredients = () => {
  const context = useContext(IngredientsContext);
  if (!context) throw new Error('useIngredients must be used within IngredientsProvider');
  return context;
};
