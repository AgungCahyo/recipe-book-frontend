// hooks/useRecipeForm.ts
import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useRecipes,useRecipesActions } from '../context/RecipesContext';
import { useIngredients } from '../context/ingredients/IngredientsProvider';
import { useDraftRecipe } from '../context/DraftRecipeContext';
import showToast from 'utils/showToast';
import { useRecipeUploader, ImageStatus } from './useRecipeUploader';
import { useRecipeIngredients } from './useRecipeIngredients';
import { useRecipeSteps } from './useRecipeSteps';
import { useRecipeMetadata } from './useRecipeMetaData';

// shallow equal helper
function shallowEqualArray(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false;
  }
  return true;
}

// Signature helpers
const createIngredientsSignature = (ingredients: any[]) =>
  ingredients.map(i => `${i.id}-${i.name}-${i.unit}-${i.pricePerUnit}`).join('|||');
const createStepsSignature = (steps: string[]) => steps.join('|||');
const createImageSignature = (imageUris: ImageStatus[]) => imageUris.map(i => i.uri).join('|||');

export function useRecipeForm(id?: string) {
  const router = useRouter();
  const { recipes, addRecipe, editRecipe } = useRecipes();
  const { ingredients } = useIngredients();
  const { draft, updateDraft, clearDraft } = useDraftRecipe();
  const { reloadRecipes } = useRecipesActions();
  
  // ADD: State untuk track apakah sedang dalam proses save
  const [isSaving, setIsSaving] = useState(false);
  
  const editing = !!id;
  const existingRecipe = useMemo(() => recipes.find(r => r.id === id), [recipes, id]);

  // Reset draft saat buka form baru
  useEffect(() => {
    if (!editing) clearDraft();
  }, [editing, clearDraft]);

  // Initial recipe data
  const initialRecipeData = useMemo(() => {
    if (editing && existingRecipe) {
      return {
        title: existingRecipe.title,
        steps: existingRecipe.description?.split('\n') || [''],
        imageUris: (existingRecipe.imageUris || []).map(uri => ({ uri, status: 'done' as const })),
        ingredients: existingRecipe.ingredients || [],
        category: existingRecipe.category || '',
        sellingPrice: existingRecipe.sellingPrice ?? null,
        margin: existingRecipe.margin ?? undefined,
      };
    }
    return {
      ...draft,
      imageUris: (draft.imageUris || []).map(img => ({
        uri: typeof img === 'string' ? img : img.uri,
        status: 'done' as const,
      })),
    };
  }, [editing, existingRecipe, draft]);

  // Ingredients state
  const {
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
  } = useRecipeIngredients(initialRecipeData.ingredients);

  // Image uploader state
  const { imageUris, setImageUris, isUploading, pickImage, removeImage, replaceImage, resetImages } =
    useRecipeUploader(initialRecipeData.imageUris);

  // Steps state
  const { steps, setSteps, updateStep, addStep, removeStep } = useRecipeSteps(initialRecipeData.steps);

  // Metadata state
  const { title, setTitle, category, setCategory } = useRecipeMetadata({
    initialTitle: initialRecipeData.title,
    initialCategory: initialRecipeData.category,
    initialSteps: initialRecipeData.steps,
    initialIngredients: initialRecipeData.ingredients,
    initialImages: initialRecipeData.imageUris,
    steps,
    ingredients: ingredientsList,
    imageUris,
    isEditing: editing,
    isSaving, // ADDED: Pass saving state
  });

  const prevDraftRef = useRef(draft);

  // Draft snapshot
  const draftSnapshot = useMemo(() => ({
    title: title || '',
    steps: [...steps],
    ingredients: [...ingredientsList],
    imageUris: imageUris.map(i => ({
      ...i,
      status: (i.status === 'loading' || i.status === 'error' || i.status === 'done') ? i.status : 'loading'
    })),
    category: category || '',
  }), [title, steps, ingredientsList, imageUris, category]);

  // FIXED: Auto-update draft hanya jika tidak editing dan tidak sedang saving
  useEffect(() => {
    if (editing || isSaving) return;
    
    const prev = prevDraftRef.current;
    const hasChanged =
      (prev.title || '') !== draftSnapshot.title ||
      !shallowEqualArray(prev.steps || [], draftSnapshot.steps || []) ||
      !shallowEqualArray(prev.ingredients || [], draftSnapshot.ingredients || []) ||
      !shallowEqualArray(prev.imageUris || [], draftSnapshot.imageUris || []) ||
      (prev.category || '') !== draftSnapshot.category;

    if (hasChanged) {
      updateDraft(draftSnapshot);
      prevDraftRef.current = draftSnapshot;
    }
  }, [draftSnapshot, editing, updateDraft, isSaving]);

  // Total HPP calculation
  const calculateTotalHPP = useCallback(() => {
    return ingredientsList.reduce((total, item) => total + (item.cost || 0), 0);
  }, [ingredientsList]);

  // Validation
  const validateForm = useCallback(() => {
    const normalizedTitle = title.trim().toLowerCase();
    if (!normalizedTitle) return { isValid: false, message: 'Judul resep tidak boleh kosong.' };

    const isDuplicateTitle = recipes.some(r => {
      if (editing && r.id === existingRecipe?.id) return false;
      return r.title.trim().toLowerCase() === normalizedTitle;
    });
    if (isDuplicateTitle) return { isValid: false, message: 'Judul resep sudah digunakan. Gunakan nama lain.' };

    if (ingredientsList.length === 0) return { isValid: false, message: 'Tambahkan minimal satu bahan.' };
    return { isValid: true };
  }, [title, recipes, editing, existingRecipe?.id, ingredientsList.length]);

  // FIXED: Handle save dengan proper state management
  const handleSave = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      showToast(validation.message!, 'error');
      return;
    }

    // Set saving state
    setIsSaving(true);

    const cleanedSteps = steps.filter(s => s.trim() !== '');

    const recipeData = {
      title: title.trim(),
      description: cleanedSteps.join('\n'),
      ingredients: ingredientsList,
      imageUris: imageUris.map(i => i.uri),
      category: category.trim(),
      hpp: parseFloat(calculateTotalHPP().toFixed(2)),
      ...(editing && existingRecipe?.sellingPrice !== undefined && { sellingPrice: existingRecipe.sellingPrice }),
      ...(editing && existingRecipe?.margin !== undefined && { margin: existingRecipe.margin }),
    };

    try {
      if (editing && existingRecipe) {
        await editRecipe(existingRecipe.id, recipeData);
        // REMOVED: await reloadRecipes(); // Don't reload immediately to prevent state override
        showToast('Resep diperbarui.', 'success');
        router.back();
      } else {
        const newId = await addRecipe(recipeData);
        // REMOVED: await reloadRecipes(); // Don't reload immediately to prevent state override
        showToast('Resep berhasil ditambahkan.', 'success');
        
        // FIXED: Clear draft sebelum navigate untuk new recipe
        clearDraft();
        router.replace(`/main/recipes/${newId}`);
      }
      
      // FIXED: Hanya clear draft untuk new recipe, tidak reset imageUris untuk edit
      if (!editing) {
        clearDraft();
      }
      
    } catch (err) {
      showToast('Terjadi kesalahan saat menyimpan resep.', 'error');
      console.error(err);
    } finally {
      // Reset saving state
      setIsSaving(false);
    }
  }, [
    validateForm,
    steps,
    title,
    ingredientsList,
    imageUris,
    category,
    calculateTotalHPP,
    editing,
    existingRecipe,
    editRecipe,
    addRecipe,
    clearDraft,
    router,
    // REMOVED: reloadRecipes from dependencies to prevent unnecessary calls
  ]);

  return {
    // Form
    title, setTitle,
    steps, updateStep, addStep, removeStep,
    category, setCategory,

    // Ingredients
    ingredientsList, ingredientName, setIngredientName,
    quantity, setQuantity, unit, setUnit,
    addIngredient, removeIngredient,
    editIngredientId, setEditIngredientId,
    setIngredientsList,

    // Images
    imageUris, setImageUris, pickImage, isUploading, removeImage, replaceImage, resetImages,

    // Actions
    calculateTotalHPP,
    handleSave,
    validateForm,
    editing,
    
    // ADD: Return saving state jika diperlukan
    isSaving,
  };
}