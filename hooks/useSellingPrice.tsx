import { useEffect, useRef, useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { Recipe } from '../context/RecipesContext';
import { useRecipes } from '../context/RecipesContext';
import { useIngredients, Ingredient } from '../context/ingredients/IngredientsProvider';

export function useSellingPrice(originalRecipe?: Recipe) {
  const { editRecipe } = useRecipes();
  const { ingredients: globalIngredients } = useIngredients();

  const [margin, setMargin] = useState(originalRecipe?.margin ?? 60);
  const [manualPrice, setManualPrice] = useState(originalRecipe?.sellingPrice?.toString() || '');
  const [saving, setSaving] = useState(false);

  // 🔥 Inject ulang cost real-time
  const ingredientsMap = useMemo(() => {
    const map: Record<string, Ingredient> = {};
    globalIngredients.forEach(i => {
      map[i.name] = i;
    });
    return map;
  }, [globalIngredients]);

  const updatedIngredients = useMemo(() => {
    if (!originalRecipe) return [];
    return originalRecipe.ingredients.map(item => {
      const matched = ingredientsMap[item.name];
      const pricePerUnit = matched?.pricePerUnit ?? 0;
      return {
        ...item,
        cost: parseFloat((pricePerUnit * item.quantity).toFixed(2)),
      };
    });
  }, [originalRecipe, ingredientsMap]);
  const hpp = useMemo(() => {
    return updatedIngredients.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [updatedIngredients]);

  // 🔥 Hitung final price
  const displayedPrice = useMemo(() => {
    return Math.round(hpp + (hpp * margin) / 100);
  }, [hpp, margin]);

  const handleSaveManualPrice = async () => {
    if (!originalRecipe) return;

    const priceNum = parseInt(manualPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Harga tidak valid', 'Masukkan angka yang valid');
      return;
    }

    setSaving(true);

    await editRecipe(originalRecipe.id, {
      ...originalRecipe,
      sellingPrice: priceNum,
      margin,
    });

    setSaving(false);
    Alert.alert('Berhasil', 'Harga jual berhasil diperbarui');
  };

  return {
    margin,
    setMargin,
    displayedPrice,
    manualPrice,
    setManualPrice,
    saving,
    handleSaveManualPrice,
    finalPrice: originalRecipe?.sellingPrice || displayedPrice,
    isManual: !!originalRecipe?.sellingPrice,
    hpp,
  };
}
