import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { useIngredients } from '../context/ingredients/IngredientsProvider';
import showToast from 'utils/showToast';

export function useRecipeIngredients(initialIngredients: any[] = []) {
  const { ingredients } = useIngredients();
  
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [ingredientsList, setIngredientsList] = useState(initialIngredients);
  const [editIngredientId, setEditIngredientId] = useState<string | null>(null);

  const addIngredient = () => {
    if (!ingredientName || !quantity || !unit) {
      showToast('Isi nama, jumlah, dan satuan terlebih dahulu.', 'warning');
      return;
    }

    const existing = ingredients.find((i) => i.name === ingredientName);
    if (!existing) {
      showToast('Bahan tidak ditemukan. Tambahkan bahan terlebih dahulu.', 'error');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Jumlah harus berupa angka positif.', 'warning');
      return;
    }

    const cost = parseFloat((existing.pricePerUnit * qty).toFixed(2));

    if (editIngredientId) {
      setIngredientsList((prev) =>
        prev.map((item) =>
          item.id === editIngredientId
            ? {
                ...item,
                ingredientId: existing.id,
                name: existing.name,
                unit,
                quantity: qty,
                cost,
              }
            : item
        )
      );
      showToast('Bahan berhasil diperbarui.', 'success');
      setEditIngredientId(null);
    } else {
      if (ingredientsList.find((i) => i.name === ingredientName)) {
        showToast('Bahan sudah ditambahkan.', 'error');
        return;
      }

      const newIngredient = {
        id: uuid.v4() as string,
        ingredientId: existing.id,
        name: existing.name,
        quantity: qty,
        unit,
        cost,
      };

      setIngredientsList((prev) => [...prev, newIngredient]);
      showToast('Bahan berhasil ditambahkan.', 'success');
    }

    setIngredientName('');
    setQuantity('');
    setUnit('');
  };

  const removeIngredient = (id: string) => {
    setIngredientsList((prev) => prev.filter((i) => i.id !== id));
  };

  // Update cost, unit, name kalau data global ingredients berubah
  useEffect(() => {
    setIngredientsList((prev) =>
      prev.map((item) => {
        const matched = ingredients.find(
          (g) => g.id === item.ingredientId || g.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );

        if (!matched) {
          // Kalau bahan gak ditemukan di master ingredients, tetap kembalikan item lama supaya gak hilang
          return item;
        }

        const updatedCost = parseFloat((matched.pricePerUnit * item.quantity).toFixed(2));

        return {
          ...item,
          ingredientId: matched.id,
          name: matched.name,
          unit: matched.unit,
          cost: updatedCost,
        };
      })
    );
  }, [ingredients]);

  return {
    ingredientName,
    setIngredientName,
    quantity,
    setQuantity,
    unit,
    setUnit,
    ingredientsList,
    setIngredientsList,
    addIngredient,
    removeIngredient,
    editIngredientId,
    setEditIngredientId,
  };
}
