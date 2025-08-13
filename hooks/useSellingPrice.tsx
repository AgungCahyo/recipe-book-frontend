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
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

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

   useEffect(() => {
    if (!originalRecipe) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    if (!manualPrice) return;

    const priceNum = parseInt(manualPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        await editRecipe(originalRecipe.id, {
          ...originalRecipe,
          sellingPrice: priceNum,
          margin,
        });
      } catch (error) {
        Alert.alert('Error', 'Gagal menyimpan harga jual');
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [manualPrice, margin, originalRecipe, editRecipe]);

  // kalau mau, handleSaveManualPrice tetap dipakai sebagai backup manual save
  const handleSaveManualPrice = async () => {
    if (!originalRecipe) return;

    const priceNum = parseInt(manualPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Harga tidak valid', 'Masukkan angka yang valid');
      return;
    }

    setSaving(true);
    try {
      await editRecipe(originalRecipe.id, {
        ...originalRecipe,
        sellingPrice: priceNum,
        margin,
      });
      Alert.alert('Berhasil', 'Harga jual berhasil diperbarui');
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan harga jual');
    } finally {
      setSaving(false);
    }
  };

  return {
    margin,
    setMargin,
    displayedPrice,
    manualPrice,
    setManualPrice,
    saving,
    handleSaveManualPrice,
    finalPrice: originalRecipe?.sellingPrice != null && originalRecipe.sellingPrice > 0
      ? originalRecipe.sellingPrice
      : 0,
    isManual: originalRecipe?.sellingPrice != null && originalRecipe.sellingPrice > 0,
    hpp,
  };
}