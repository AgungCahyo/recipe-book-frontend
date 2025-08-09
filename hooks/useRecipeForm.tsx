import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';

import { useRecipes } from '../context/RecipesContext';
import { useIngredients } from '../context/ingredients/IngredientsProvider';
import { useDraftRecipe } from '../context/DraftRecipeContext';
import { useAlert } from '../context/AlertContext';
import { useRecipeUploader } from './useRecipeUploader';
import { useRecipeIngredients } from './useRecipeIngredients';
import { useRecipeSteps } from './useRecipeSteps';
import { useRecipeMetadata } from './useRecipeMetaData';

function shallowEqualArray(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false;
  }
  return true;
}

export function useRecipeForm(id?: string) {
  console.log('useRecipeForm called with id:', id);
  const router = useRouter();
  const { showAlert } = useAlert();
  const { recipes, addRecipe, editRecipe } = useRecipes();
  const { ingredients } = useIngredients();
  const { draft, updateDraft, clearDraft } = useDraftRecipe();

  const editing = !!id;
  const existingRecipe = recipes.find((r) => r.id === id);

  // Reset draft saat buka form baru - FIX: Add dependency array
  useEffect(() => {
    console.log('[useEffect] clearDraft triggered, editing:', editing);
    if (!editing) clearDraft();
    console.log('[clearDraft] draft cleared');
  }, [editing]); // Removed clearDraft from dependencies

  const recipeData = useMemo(() => {
    console.log('[useMemo] Computing recipeData');
    if (editing && existingRecipe) {
      console.log('[useMemo] Editing mode, existingRecipe found:', existingRecipe.id);
      return {
        title: existingRecipe.title,
        steps: existingRecipe.description?.split('\n') || [''],
        imageUris: (existingRecipe.imageUris || []).map((uri) => ({
          uri,
          status: 'done' as const,
        })),
        ingredients: existingRecipe.ingredients || [],
        category: existingRecipe.category || '',
        sellingPrice: existingRecipe.sellingPrice ?? null,
        margin: existingRecipe.margin ?? undefined,
      };
    }
    console.log('[useMemo] New recipe mode, using draft');
    return {
      ...draft,
      imageUris: (draft.imageUris || []).map((uri) => ({
        uri,
        status: 'done' as const,
      })),
    };
  }, [editing, existingRecipe?.id, existingRecipe?.title, existingRecipe?.description, existingRecipe?.category, existingRecipe?.sellingPrice, existingRecipe?.margin, JSON.stringify(existingRecipe?.imageUris), JSON.stringify(existingRecipe?.ingredients), JSON.stringify(draft)]);

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
  } = useRecipeIngredients(recipeData.ingredients);

  const {
    imageUris,
    setImageUris,
    isUploading,
    pickImage,
  } = useRecipeUploader(showAlert, recipeData.imageUris);

  const {
    steps,
    setSteps,
    updateStep,
    addStep,
    removeStep,
  } = useRecipeSteps(recipeData.steps);

  const {
    title,
    setTitle,
    category,
    setCategory,
  } = useRecipeMetadata({
    initialTitle: recipeData.title,
    initialCategory: recipeData.category,
    initialSteps: recipeData.steps,
    initialIngredients: recipeData.ingredients,
    initialImages: recipeData.imageUris,
    steps,
    ingredients: ingredientsList,
    imageUris,
    isEditing: editing,
  });

  const prevDraftRef = useRef(draft);

  // FIX: Stabilize arrays dengan cara yang lebih efisien
  const stableSteps = useMemo(() => {
    return [...steps];
  }, [steps.length, steps.join('|||')]); // Use delimiter that's unlikely to appear in content

  const stableIngredientsList = useMemo(() => {
    return [...ingredientsList];
  }, [
    ingredientsList.length,
    ingredients.map(i => `${i.id}-${i.name}-${i.unit}-${i.pricePerUnit}`).join('|||')

  ]);

  const stableImageUris = useMemo(() => {
    return imageUris.map(i => i.uri);
  }, [
    imageUris.length,
    imageUris.map(i => i.uri).join('|||')
  ]);

  // FIX: Stabilize draft snapshot dengan useMemo yang lebih baik
  const draftSnapshot = useMemo(() => ({
    title: title || '',
    steps: stableSteps,
    ingredients: stableIngredientsList,
    imageUris: stableImageUris,
    category: category || '',
  }), [title, stableSteps, stableIngredientsList, stableImageUris, category]);

  // FIX: Use useCallback untuk updateDraft agar stabil
  const stableUpdateDraft = useCallback((data: any) => {
    updateDraft(data);
  }, []); // Empty dependency - updateDraft should be stable from context

  // FIX: Draft saving effect with better comparison
  useEffect(() => {
    if (editing) return; // don't save draft when editing existing

    const prev = prevDraftRef.current;

    const isSame =
      (prev.title || '') === (draftSnapshot.title || '') &&
      shallowEqualArray(prev.steps || [], draftSnapshot.steps || []) &&
      shallowEqualArray(prev.ingredients || [], draftSnapshot.ingredients || []) &&
      shallowEqualArray(prev.imageUris || [], draftSnapshot.imageUris || []) &&
      (prev.category || '') === (draftSnapshot.category || '');

    if (!isSame) {
      stableUpdateDraft(draftSnapshot);
      prevDraftRef.current = draftSnapshot;
    }
  }, [draftSnapshot, editing, stableUpdateDraft]);

  // FIX: Sync ingredients with better dependency management
  useEffect(() => {
    if (!editing || !existingRecipe) return;

    setIngredientsList((prevIngredientsList) => {
      let changed = false;
      const synced = prevIngredientsList.map((item) => {
        const latest = ingredients.find((i) => i.id === item.ingredientId);
        if (!latest) return item;

        const updatedCost = parseFloat((latest.pricePerUnit * item.quantity).toFixed(2));

        if (
          item.name !== latest.name ||
          item.unit !== latest.unit ||
          item.cost !== updatedCost
        ) {
          changed = true;
          return {
            ...item,
            name: latest.name,
            unit: latest.unit,
            cost: updatedCost,
          };
        }
        return item;
      });

      return changed ? synced : prevIngredientsList;
    });
  }, [
    editing,
    existingRecipe?.id, // Only depend on ID, not the whole object
    ingredients.length, // Track ingredients changes more efficiently
    ingredients.map(i => `${i.id}-${i.name}-${i.unit}-${i.pricePerUnit}`).join('|||')

  ]); // Removed setIngredientsList from dependencies

  const calculateTotalHPP = useCallback(() => {
    return ingredientsList.reduce((total, item) => total + (item.cost || 0), 0);
  }, [ingredientsList]);

  const handleSave = useCallback(async () => {
    const cleanedSteps = steps.filter((s) => s.trim() !== '');
    const normalizedTitle = title.trim().toLowerCase();

    if (!normalizedTitle) {
      showAlert('Judul resep tidak boleh kosong.', 'error');
      return;
    }

    const isDuplicateTitle = recipes.some((r) => {
      if (editing && r.id === existingRecipe?.id) return false;
      return r.title.trim().toLowerCase() === normalizedTitle;
    });

    if (isDuplicateTitle) {
      showAlert('Judul resep sudah digunakan. Gunakan nama lain.', 'error');
      return;
    }

    if (ingredientsList.length === 0) {
      showAlert('Tambahkan minimal satu bahan.', 'error');
      return;
    }

    const data = {
      title: title.trim(),
      description: cleanedSteps.join('\n'),
      ingredients: ingredientsList,
      imageUris: imageUris.map((i) => i.uri),
      category: category.trim(),
      hpp: parseFloat(calculateTotalHPP().toFixed(2)),

      ...(editing && existingRecipe?.sellingPrice !== undefined && {
        sellingPrice: existingRecipe.sellingPrice,
      }),
      ...(editing && existingRecipe?.margin !== undefined && {
        margin: existingRecipe.margin,
      }),
    };

    if (editing && existingRecipe) {
      await editRecipe(existingRecipe.id, data);
      clearDraft();
      showAlert('Resep diperbarui.', 'success');
      router.back();
    } else {
      const newId = await addRecipe(data);
      clearDraft();
      showAlert('Resep berhasil ditambahkan.', 'success');
      router.replace(`recipes/${newId}`);
    }
  }, [
    steps,
    title,
    ingredientsList,
    imageUris,
    category,
    calculateTotalHPP,
    recipes,
    editing,
    existingRecipe?.id,
    existingRecipe?.sellingPrice,
    existingRecipe?.margin,
    editRecipe,
    addRecipe,
    clearDraft,
    showAlert,
    router
  ]);

  return {
    title,
    setTitle,
    steps,
    updateStep,
    addStep,
    removeStep,
    ingredientsList,
    ingredientName,
    setIngredientName,
    quantity,
    setQuantity,
    unit,
    setUnit,
    addIngredient,
    removeIngredient,
    editIngredientId,
    setEditIngredientId,
    imageUris,
    setImageUris,
    category,
    setCategory,
    calculateTotalHPP,
    handleSave,
    editing,
    pickImage,
    isUploading,
    setIngredientsList,
  };
}