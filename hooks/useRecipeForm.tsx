// hooks/useRecipeForm.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'

import { useRecipes } from '../context/RecipesContext';
import { useIngredients } from '../context/IngredientsContext';
import { useDraftRecipe } from '../context/DraftRecipeContext';

export function useRecipeForm(id?: string) {
  const router = useRouter();
  const { recipes, addRecipe, editRecipe } = useRecipes();
  const { ingredients } = useIngredients();
  const { draft, updateDraft, clearDraft } = useDraftRecipe();

  const editing = !!id;
  const existingRecipe = recipes.find((r) => r.id === id);

  const recipeData = useMemo(() => {
    if (editing && existingRecipe) {
      return {
        title: existingRecipe.title,
        steps: existingRecipe.description?.split('\n') || [''],
        imageUris: existingRecipe.imageUris || [],
        ingredients: existingRecipe.ingredients || [],
        category: existingRecipe.category || '',
      };
    }
    return draft;
  }, [editing, existingRecipe, draft]);

  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [ingredientsList, setIngredientsList] = useState<any[]>([]);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [category, setCategory] = useState('');

  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const prevDraftRef = useRef(draft);

  // Inisialisasi state saat pertama render
  useEffect(() => {
    if (!recipeData || !recipeData.title) return;
    setTitle(recipeData.title);
    setSteps(recipeData.steps);
    setImageUris(recipeData.imageUris);
    setIngredientsList(recipeData.ingredients);
    setCategory(recipeData.category);
  }, []);

  // Update draft secara otomatis setiap perubahan
  useEffect(() => {
    const prev = prevDraftRef.current;
    const isSame =
      prev.title === title &&
      JSON.stringify(prev.steps) === JSON.stringify(steps) &&
      JSON.stringify(prev.ingredients) === JSON.stringify(ingredientsList) &&
      JSON.stringify(prev.imageUris) === JSON.stringify(imageUris) &&
      prev.category === category;

    if (!isSame) {
      const newDraft = { title, steps, ingredients: ingredientsList, imageUris, category };
      updateDraft(newDraft);
      prevDraftRef.current = newDraft;
    }
  }, [title, steps, ingredientsList, imageUris, category]);

  // Fungsi logika
  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStep = () => setSteps((prev) => [...prev, '']);
  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const addIngredient = () => {
    if (!ingredientName || !quantity || !unit) {
      Alert.alert('Lengkapi Bahan', 'Isi nama, jumlah, dan satuan terlebih dahulu.');
      return;
    }

    if (ingredientsList.find((i) => i.name === ingredientName)) {
      Alert.alert('Bahan Duplikat', 'Bahan sudah ditambahkan.');
      return;
    }

    const existing = ingredients.find((i) => i.name === ingredientName);
    if (!existing) {
      Alert.alert('Bahan Tidak Ditemukan', 'Silakan tambahkan bahan terlebih dahulu.');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Jumlah Salah', 'Jumlah harus berupa angka positif.');
      return;
    }

    const cost = parseFloat((existing.pricePerUnit * qty).toFixed(2));

    const newIngredient = {
      id: uuid.v4() as string,
      name: existing.name,
      quantity: qty,
      unit,
      cost,
    };

    setIngredientsList((prev) => [...prev, newIngredient]);
    setIngredientName('');
    setQuantity('');
    setUnit('');
  };

  const removeIngredient = (id: string) => {
    setIngredientsList((prev) => prev.filter((i) => i.id !== id));
  };

  const calculateTotalHPP = () => {
    return ingredientsList.reduce((total, item) => total + (item.cost || 0), 0);
  };

  const handleSave = async () => {
    const cleanedSteps = steps.filter((s) => s.trim() !== '');
    if (!title.trim()) {
      Alert.alert('Judul Kosong', 'Harap isi judul resep.');
      return;
    } if (ingredientsList.length === 0) {
      Alert.alert('Bahan Kosong', 'Tambahkan minimal satu bahan.');
      return;
    }


    const data = {
      title: title.trim(),
      description: cleanedSteps.length > 0 ? cleanedSteps.join('\n') : '',
      ingredients: ingredientsList,
      imageUris,
      category: category.trim(),
      hpp: calculateTotalHPP(),
    };

    if (editing && existingRecipe) {
      await editRecipe(existingRecipe.id, data);
    } else {
      await addRecipe(data);
    }

    clearDraft();
    Alert.alert('Sukses', editing ? 'Resep diperbarui.' : 'Resep berhasil ditambahkan.');
    router.push(`/recipes?refresh=${Date.now()}`);

  };


  // Fungsi internal (private)
  const saveImagePermanently = async (uri: string): Promise<string> => {
    try {
      const fileName = uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}images/${fileName}`;

      // Pastikan folder ada
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, { intermediates: true });

      // Copy file ke path permanen
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });
console.log('Gambar disimpan di:', newPath);

      return newPath;
    } catch (err) {
      console.error('❌ Gagal simpan gambar permanen:', err);
      throw err;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Akses galeri dibutuhkan untuk memilih gambar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        const savedUris = await Promise.all(
          result.assets.map((a) => saveImagePermanently(a.uri))
        );
        setImageUris((prev) => [...prev, ...savedUris]);
      } catch (err) {
        Alert.alert('Gagal Simpan', 'Gagal menyimpan gambar secara permanen.');
      }
    }
  };


  return {
    title, setTitle,
    steps, updateStep, addStep, removeStep,
    ingredientsList, setIngredientName, setQuantity, setUnit,
    ingredientName, quantity, unit,
    addIngredient, removeIngredient,
    imageUris, setImageUris,
    category, setCategory,
    calculateTotalHPP,
    handleSave,
    editing,
    pickImage,
  };
}
