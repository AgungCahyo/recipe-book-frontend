import React, {
  createContext, useContext, useEffect, useState, useMemo, useCallback,
} from 'react';
import uuid from 'react-native-uuid';
import { db, serverTimestamp } from '../../firebase/config';
import {
  collection, doc, getDocs, query, where, orderBy, setDoc,
  updateDoc, deleteDoc, writeBatch, onSnapshot,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { satuanList } from './constant';
import showToast from 'utils/showToast';
import { useAuth } from 'context/AuthContext';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  totalPrice: number;
  pricePerUnit: number;
  userId: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
  updatedAt?: FirebaseFirestoreTypes.Timestamp | null;
};

type IngredientInput = {
  name: string;
  unit: string;
  quantity: number;
  totalPrice: number;
};

type IngredientContextType = {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  idBeingEdited: string | null;
  setIdBeingEdited: (v: string | null) => void;
  ingredients: Ingredient[];
  handleSubmit: (input: IngredientInput) => void;
  removeIngredient: (id: string) => void;
  editIngredient: (id: string) => void;
  satuanList: string[];
  isFormModalVisible: boolean;
  setIsFormModalVisible: (v: boolean) => void;
  resetForm: () => void;
  clearAllIngredients: () => void;
  addIngredient: (item: Ingredient) => void;
  reloadIngredients: () => void;
  addIngredientFromCSV: (raw: { name: string; quantity: string; totalPrice: string; unit: string }) => void;
  removeManyIngredients: (ids: string[]) => void;
  addManyIngredients: (items: Ingredient[]) => void;
  parseIngredientFromCSV: (raw: { name: string; quantity: string; totalPrice: string; unit: string }) => Ingredient | null;
  getIngredientById: (id: string) => Ingredient | undefined;
  getIngredientByName: (name: string) => Ingredient | undefined;
};

export const IngredientsContext = createContext<IngredientContextType | null>(null);

const STORAGE_KEY = '@ingredients_cache';

const saveToStorage = async (items: Ingredient[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving to AsyncStorage:', e);
  }
};

const loadFromStorage = async (): Promise<Ingredient[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch (e) {
    console.error('Error loading from AsyncStorage:', e);
    return [];
  }
};

export function IngredientsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? '';

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [idBeingEdited, setIdBeingEdited] = useState<string | null>(null);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- CSV parsing ---
  const parseIngredientFromCSV = useCallback((raw: any) => {
    try {
      const quantity = Number(raw.quantity);
      const totalPrice = Number(raw.totalPrice);
      const name = raw.name?.trim() ?? '';
      const unit = raw.unit?.trim() ?? '';

      if (!name || !unit || isNaN(quantity) || isNaN(totalPrice) || quantity <= 0 || totalPrice <= 0) {
        console.warn('CSV invalid:', raw);
        return null;
      }
      if (!satuanList.includes(unit)) {
        console.warn('Unit tidak valid:', raw);
        return null;
      }
      if (!uid) {
        console.warn('UID tidak ada, skip:', raw);
        return null;
      }

      return {
        id: uuid.v4() as string,
        name,
        unit,
        quantity,
        totalPrice,
        pricePerUnit: totalPrice / quantity,
        userId: uid,
      } as Ingredient;
    } catch (e) {
      console.error('Error parsing CSV item:', raw, e);
      return null;
    }
  }, [uid]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setIdBeingEdited(null);
    setIsFormModalVisible(false);
  }, []);

  // --- Helper Firestore batch delete ---
  const chunkCommit = useCallback(async (ids: string[]) => {
    for (let i = 0; i < ids.length; i += 500) {
      const batch = db.batch();
      ids.slice(i, i + 500).forEach(id => batch.delete(db
        .collection('users')
        .doc(uid)
        .collection('ingredients')
        .doc(id)));
      await batch.commit();
    }
  }, [uid]);

  // --- Add ingredient ---
  const addIngredient = useCallback(async (item: Ingredient) => {
    if (!uid || !item?.id || !item.name?.trim()) return;
    try {
      await db
        .collection('users')
        .doc(uid)
        .collection('ingredients')
        .doc(item.id)
        .set({
          ...item,
          userId: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      showToast('Bahan berhasil ditambahkan', 'success');
    } catch (e) {
      console.error('Error adding ingredient:', e);
      showToast('Gagal menambahkan bahan', 'error');
    }
  }, [uid]);

  const handleSubmit = useCallback(async ({ name, quantity, totalPrice, unit }: IngredientInput) => {
    if (!uid) return;

    const trimmedName = name.trim();
    const unitTrim = unit.trim();

    if (!trimmedName || quantity <= 0 || totalPrice <= 0 || !unitTrim) {
      showToast('Semua field harus diisi dengan benar', 'error');
      return;
    }
    if (!satuanList.includes(unitTrim)) {
      showToast('Satuan tidak valid', 'error');
      return;
    }
    const pricePerUnit = totalPrice / quantity;

    try {
      if (isEditing && idBeingEdited) {
        await db
          .collection('users')
          .doc(uid)
          .collection('ingredients')
          .doc(idBeingEdited)
          .update({
            name: trimmedName,
            unit: unitTrim,
            quantity,
            totalPrice,
            pricePerUnit,
            updatedAt: serverTimestamp(),
          });
        showToast('Perubahan disimpan', 'success');
      } else {
        const dup = await db
          .collection('users')
          .doc(uid)
          .collection('ingredients')
          .where('name', '==', trimmedName)
          .limit(1)
          .get();
        if (!dup.empty) {
          showToast('Bahan dengan nama tersebut sudah ada', 'warning');
          return;
        }
        const id = uuid.v4() as string;
        await db
          .collection('users')
          .doc(uid)
          .collection('ingredients')
          .doc(id)
          .set({
            id,
            name: trimmedName,
            unit: unitTrim,
            quantity,
            totalPrice,
            pricePerUnit,
            userId: uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        showToast('Bahan berhasil ditambahkan', 'success');
      }
      resetForm();
    } catch (e) {
      console.error('Error saving ingredient:', e);
      showToast('Gagal menyimpan bahan', 'error');
    }
  }, [uid, isEditing, idBeingEdited, resetForm]);

  const removeIngredient = useCallback(async (id: string) => {
    try {
      await db
        .collection('users')
        .doc(uid)
        .collection('ingredients')
        .doc(id).delete();
      setIngredients(prev => prev.filter(it => it.id !== id));
      showToast('Bahan dihapus', 'success');
    } catch (e) {
      console.error('Error removing ingredient:', e);
      showToast('Gagal menghapus bahan', 'error');
    }
  }, [uid]);

  const clearAllIngredients = useCallback(async () => {
    if (ingredients.length === 0) {
      showToast('Tidak ada data untuk dihapus', 'warning'); return;
    }
    try {
      await chunkCommit(ingredients.map(it => it.id));
      setIngredients([]);
      showToast('Semua data bahan dihapus', 'success');
    } catch (e) {
      console.error('Error clearing all ingredients:', e);
      showToast('Gagal menghapus semua bahan', 'error');
    }
  }, [ingredients, chunkCommit]);

  const addIngredientFromCSV = useCallback((raw: {
    name: string;
    quantity: string;
    totalPrice: string;
    unit: string;
  }) => {
    const parsed = parseIngredientFromCSV(raw);
    if (parsed) addIngredient(parsed);
  }, [addIngredient, parseIngredientFromCSV]);

  const removeManyIngredients = useCallback(async (ids: string[]) => {
    if (!ids?.length) return;
    try {
      await chunkCommit(ids);
      setIngredients(prev => prev.filter(it => !ids.includes(it.id)));
      showToast(`${ids.length} bahan dihapus`, 'success');
    } catch (e) {
      console.error('Error removing multiple ingredients:', e);
      showToast('Gagal menghapus bahan', 'error');
    }
  }, [chunkCommit]);

  const addManyIngredients = useCallback(async (items: Ingredient[]) => {
    if (!items?.length || !uid) return;

    const failedItems: Ingredient[] = [];
    const valid = items.filter(it => {
      const isValid = it.id && it.name?.trim() && it.quantity > 0 && it.totalPrice > 0;
      if (!isValid) failedItems.push(it);
      return isValid;
    });

    if (!valid.length) {
      showToast('Tidak ada bahan valid untuk ditambahkan', 'warning');
      console.log('Failed items:', failedItems);
      return;
    }

    try {
      for (let i = 0; i < valid.length; i += 500) {
        const batch = db.batch();
        valid.slice(i, i + 500).forEach(it => {
          const ref = db
            .collection('users')
            .doc(uid)
            .collection('ingredients')
            .doc(it.id);
          batch.set(ref, {
            ...it,
            userId: uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }

      setIngredients(prev => {
        const ids = new Set(prev.map(p => p.id));
        const names = new Set(prev.map(p => p.name.toLowerCase().trim()));
        const newOnes = valid.filter(it => !ids.has(it.id) && !names.has(it.name.toLowerCase().trim()));
        return newOnes.length ? [...prev, ...newOnes] : prev;
      });

      showToast(`${valid.length} bahan ditambahkan`, 'success');
      if (failedItems.length) console.warn('Bahan gagal diimport:', failedItems);
    } catch (e) {
      console.error('Error adding multiple ingredients:', e);
      showToast('Gagal menambahkan bahan', 'error');
    }
  }, [uid]);

  const reloadIngredients = useCallback(async () => {
    if (!uid) return;
    try {
      const snap = await db
        .collection('users')
        .doc(uid)
        .collection('ingredients')
        .orderBy('createdAt', 'desc')
        .get();

      const loaded: Ingredient[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setIngredients(loaded);
      setIsInitialized(true);
    } catch (e) {
      console.error('Gagal load bahan:', e);
      setIngredients([]);
      setIsInitialized(true);
    }
  }, [uid]);

  // --- Load from AsyncStorage on init ---
  useEffect(() => {
    const init = async () => {
      const localData = await loadFromStorage();
      if (localData.length) setIngredients(localData);
      await reloadIngredients();
    };
    init();
  }, [reloadIngredients]);

  // --- Update AsyncStorage when ingredients change ---
  useEffect(() => {
    saveToStorage(ingredients);
  }, [ingredients]);

  // --- Firestore realtime listener ---
  useEffect(() => {
    if (!uid || !isInitialized) return;
    const unsubscribe = db
      .collection('users')
      .doc(uid)
      .collection('ingredients')
      .orderBy('updatedAt', 'desc')
      .onSnapshot(snapshot => {
        setIngredients(prev => {
          let next = [...prev];
          snapshot.docChanges().forEach(change => {
            const id = change.doc.id;
            const data = change.doc.data() as any;
            const item = { id, ...data } as Ingredient;

            if (change.type === 'added') {
              const exists = next.some(x => x.id === id);
              if (!exists) next.push(item);
            } else if (change.type === 'modified') {
              const idx = next.findIndex(x => x.id === id);
              if (idx >= 0) next[idx] = item;
            } else if (change.type === 'removed') {
              next = next.filter(x => x.id !== id);
            }
          });
          return next;
        });
      }, (err) => console.error('Listener error:', err));
    return () => unsubscribe();
  }, [uid, isInitialized]);

  const ingredientsMap = useMemo(() => {
    const idMap = new Map<string, Ingredient>();
    const nameMap = new Map<string, Ingredient>();
    ingredients.forEach(it => {
      idMap.set(it.id, it);
      nameMap.set(it.name.toLowerCase().trim(), it);
    });
    return { idMap, nameMap };
  }, [ingredients]);

  const getIngredientById = useCallback((id: string) => ingredientsMap.idMap.get(id), [ingredientsMap]);
  const getIngredientByName = useCallback((name: string) => ingredientsMap.nameMap.get(name.toLowerCase().trim()), [ingredientsMap]);
const editIngredient = useCallback((id: string) => {
  if (!ingredients.some(it => it.id === id)) {
    showToast('Bahan tidak ditemukan', 'error');
    return;
  }
  setIsEditing(true);
  setIdBeingEdited(id);
  setIsFormModalVisible(true);
}, [ingredients]);

  const value = useMemo<IngredientContextType>(() => ({
    isEditing, setIsEditing,
    idBeingEdited, setIdBeingEdited,
    ingredients,
    handleSubmit,
    removeIngredient,
    editIngredient,
    satuanList,
    isFormModalVisible, setIsFormModalVisible,
    resetForm,
    clearAllIngredients,
    addIngredient,
    reloadIngredients,
    addIngredientFromCSV,
    removeManyIngredients,
    addManyIngredients,
    parseIngredientFromCSV,
    getIngredientById,
    getIngredientByName,
  }), [
    isEditing, idBeingEdited, ingredients,
    handleSubmit, removeIngredient, isFormModalVisible,
    clearAllIngredients, addIngredient, reloadIngredients,
    addIngredientFromCSV, removeManyIngredients, addManyIngredients,
    parseIngredientFromCSV, getIngredientById, getIngredientByName,
  ]);

  return (
    <IngredientsContext.Provider value={value}>
      {children}
    </IngredientsContext.Provider>
  );
}

export const useIngredients = () => {
  const ctx = useContext(IngredientsContext);
  if (!ctx) throw new Error('useIngredients must be used within IngredientsProvider');
  return ctx;
};
