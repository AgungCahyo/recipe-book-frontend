import { RecipeIngredient } from '../context/RecipesContext';
import { useIngredients } from '../context/ingredients/IngredientsProvider';
import { useRecipes, Recipe } from '../context/RecipesContext';
import uuid from 'react-native-uuid';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import showToast from '../utils/showToast'; 

export const useRecipeImporter = () => {
  const { ingredients: globalIngredients } = useIngredients();
  const { addRecipe, recipes } = useRecipes();

  const importRecipe = (data: { title: string; ingredients: any[] }) => {
    if (!data?.title || !Array.isArray(data.ingredients)) return { success: false };

    // cek duplikat
    const recipeExists = recipes.some(
      (r) => r.title.trim().toLowerCase() === data.title.trim().toLowerCase()
    );
    if (recipeExists) {
      return { success: false, duplicate: true };
    }

    const missingIngredients: string[] = [];

    const normalizedIngredients: RecipeIngredient[] = data.ingredients
      .map((item: any) => {
        const matched = globalIngredients.find(
          (g) =>
            g.id === item.ingredientId ||
            g.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        );

        if (!matched) {
          missingIngredients.push(item.name);
          return null;
        }

        return {
          id: uuid.v4() as string,
          ingredientId: matched.id,
          name: matched.name,
          quantity: Number(item.quantity) || 0,
          unit: matched.unit,
          cost: parseFloat(
            ((matched.pricePerUnit ?? 0) * (Number(item.quantity) || 0)).toFixed(2)
          ),
        };
      })
      .filter(Boolean) as RecipeIngredient[];

    if (normalizedIngredients.length === 0) {
      return { success: false, invalid: true };
    }

    // Merge ingredients
    const mergedIngredients = normalizedIngredients.reduce<RecipeIngredient[]>((acc, item) => {
      const existing = acc.find(i => i.ingredientId === item.ingredientId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.cost += item.cost;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    addRecipe({
      title: data.title,
      description: '',
      ingredients: mergedIngredients,
    });

    return { success: true, missingIngredients };
  };



  const importFromCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
      });

      if (result.canceled || !result.assets?.length) return;

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      const { data } = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (!data || data.length === 0) {
        showToast('CSV kosong atau tidak valid.', 'error');
        return;
      }

      const grouped: Record<string, any[]> = {};
      data.forEach((row: any) => {
        if (!row.title) return;
        const title = row.title.trim();
        if (!grouped[title]) grouped[title] = [];
        grouped[title].push({
          name: row.name?.trim() || '',
          quantity: Number(row.quantity) || 0,
          unit: row.unit?.trim() || '',
          pricePerUnit: Number(row.pricePerUnit) || 0,
        });
      });

      let addedCount = 0;
      let duplicateCount = 0;
      let invalidCount = 0;
      let missingIngredientsAcc: string[] = [];

      Object.entries(grouped).forEach(([title, ingredients]) => {
        const result = importRecipe({ title, ingredients });
        if (result.success) {
          addedCount++;
          if (result.missingIngredients && result.missingIngredients.length > 0) {
            missingIngredientsAcc.push(...result.missingIngredients);
          }
        } else {
          if (result.duplicate) duplicateCount++;
          if (result.invalid) invalidCount++;
        }
      });

      // Buat pesan missing bahan unik dan ringkas
      const uniqueMissing = [...new Set(missingIngredientsAcc)];

      let msg = '';
      if (addedCount > 0) {
        msg = `${addedCount} resep baru ditambahkan`;
        if (duplicateCount > 0) msg += `, ${duplicateCount} duplikat`;
        if (invalidCount > 0) msg += `, ${invalidCount} gagal (bahan tidak valid)`;
      }

      if (addedCount === 0) {
        showToast('Tidak ada resep baru yang ditambahkan.', 'error');
      } else if (duplicateCount > 0 || invalidCount > 0) {
        showToast(msg, 'warning');
      } else {
        showToast(msg, 'success');
      }

      if (uniqueMissing.length > 0) {
        showToast(`Bahan tidak ditemukan: ${uniqueMissing.join(', ')}`, 'warning');
      }

    } catch (err) {
      console.error('Gagal import CSV:', err);
      showToast('Gagal import CSV. Cek format file kamu.', 'error');
    }
  };



  return { importFromCSV, importRecipe };
};
