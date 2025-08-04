// hooks/useRecipeForm.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRecipes } from '../context/RecipesContext';
import { useIngredients } from '../context/IngredientsContext';
import { useDraftRecipe } from '../context/DraftRecipeContext';
import { useAlert } from '../context/AlertContext';


export function useRecipeForm(id?: string) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { recipes, addRecipe, editRecipe } = useRecipes();
  const { ingredients } = useIngredients();
  const { draft, updateDraft, clearDraft } = useDraftRecipe();

  const editing = !!id;
  const existingRecipe = recipes.find((r) => r.id === id);
  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    if (!recipeData || !recipeData.title) return;
    setTitle(recipeData.title);
    setSteps(recipeData.steps);
    setImageUris(recipeData.imageUris);
    setIngredientsList(recipeData.ingredients);
    setCategory(recipeData.category);
  }, []);

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

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStep = () => setSteps((prev) => [...prev, '']);
  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const addIngredient = () => {
    if (!ingredientName || !quantity || !unit) {
      showAlert('Isi nama, jumlah, dan satuan terlebih dahulu.', 'warning');
      return;
    }

    if (ingredientsList.find((i) => i.name === ingredientName)) {
      showAlert('Bahan sudah ditambahkan.', 'error');
      return;
    }

    const existing = ingredients.find((i) => i.name === ingredientName);
    if (!existing) {
      showAlert('Bahan tidak ditemukan. Tambahkan bahan terlebih dahulu.', 'error');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      showAlert('Jumlah harus berupa angka positif.', 'warning');
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
      showAlert('Judul resep tidak boleh kosong.', 'error');
      return;
    }

    if (ingredientsList.length === 0) {
      showAlert('Tambahkan minimal satu bahan.', 'error');
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
    showAlert(editing ? 'Resep diperbarui.' : 'Resep berhasil ditambahkan.', 'success');
    router.push(`/recipes?refresh=${Date.now()}`);
  };

  const saveImagePermanently = async (uri: string): Promise<string> => {
    try {
      const fileName = uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}images/${fileName}`;

      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, {
        intermediates: true,
      });

      await FileSystem.copyAsync({ from: uri, to: newPath });

      return newPath;
    } catch (err) {
      console.error('❌ Gagal simpan gambar permanen:', err);
      showAlert('Gagal menyimpan gambar.', 'error');
      throw err;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Akses galeri dibutuhkan untuk memilih gambar.', 'warning');
      return;
    }

    setIsUploading(true);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        const placeholders = result.assets.map(() => 'loading');
        setImageUris((prev) => [...prev, ...placeholders]);

        const resizedUris = await Promise.all(
          result.assets.map(async (asset) => {
            const manipulated = await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 800 } }],
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipulated.uri;
          })
        );

        const savedUris = await Promise.all(resizedUris.map(saveImagePermanently));

        setImageUris((prev) => {
          const prevWithoutPlaceholders = prev.filter((uri) => uri !== 'loading');
          return [...prevWithoutPlaceholders, ...savedUris];
        });
      } catch (err) {
        console.error('❌ Gagal upload:', err);
        showAlert('Gagal menyimpan gambar.', 'error');
        setImageUris((prev) => prev.filter((uri) => uri !== 'loading'));
      } finally {
        setIsUploading(false);
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
    isUploading,
  };
}