//context/ingredients/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '../constant';
import { Ingredient } from '../IngredientsProvider';

export async function loadIngredients(): Promise<Ingredient[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.error('Gagal load ingredients:', err);
    return [];
  }
}

export async function saveIngredients(data: Ingredient[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Gagal simpan ingredients:', err);
  }
}
