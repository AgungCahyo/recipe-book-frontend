import { Ingredient } from '../context/ingredients/IngredientsProvider';
import { RecipeIngredient } from '../context/RecipesContext';  // import tipe yang sudah ada
import { useIngredients } from '../context/ingredients/IngredientsProvider';
import { useRecipes } from '../context/RecipesContext';
import uuid from 'react-native-uuid';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

export const useRecipeImporter = () => {
  const { ingredients: globalIngredients } = useIngredients();
  const { addRecipe } = useRecipes();

  const importRecipe = (data: { title: string; ingredients: any[] }) => {
    if (!data?.title || !Array.isArray(data.ingredients)) return;

    // Gunakan tipe RecipeIngredient untuk normalizedIngredients
    const normalizedIngredients: RecipeIngredient[] = data.ingredients.map((item: any) => {
      const matched = globalIngredients.find(
        (g) =>
          g.id === item.ingredientId ||
          g.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );

      if (!matched) {
        console.warn(`Bahan '${item.name}' tidak ditemukan di master bahan. Dilewati.`);
        return null;
      }

      return {
        id: uuid.v4() as string,
        ingredientId: matched.id,
        name: matched.name,
        quantity: Number(item.quantity) || 0,
        unit: matched.unit,
        cost: parseFloat(((matched.pricePerUnit ?? 0) * (Number(item.quantity) || 0)).toFixed(2)),
      };
    }).filter(Boolean) as RecipeIngredient[];

    if (normalizedIngredients.length === 0) {
      alert('Tidak ada bahan valid yang ditemukan untuk resep ini.');
      return;
    }

    // Merge ingredients yang dobel berdasarkan ingredientId
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
        alert('CSV kosong atau tidak valid.');
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

      Object.entries(grouped).forEach(([title, ingredients]) => {
        importRecipe({ title, ingredients });
      });

      alert('Semua resep dari CSV berhasil ditambahkan!');
    } catch (err) {
      console.error('Gagal import CSV:', err);
      alert('Gagal import CSV. Cek format file kamu.');
    }
  };

  return { importFromCSV, importRecipe };
};
