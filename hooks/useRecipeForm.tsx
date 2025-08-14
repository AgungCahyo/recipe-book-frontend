import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';

import { useRecipes } from '../context/RecipesContext';
import { useIngredients } from '../context/ingredients/IngredientsProvider';
import { useDraftRecipe } from '../context/DraftRecipeContext';
import showToast from 'utils/showToast';
import { useRecipeUploader } from './useRecipeUploader';
import { useRecipeIngredients } from './useRecipeIngredients';
import { useRecipeSteps } from './useRecipeSteps';
import { useRecipeMetadata } from './useRecipeMetaData';

// Optimized comparison functions
function shallowEqualArray(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false;
  }
  return true;
}

// Memoized string generator for better performance
const createIngredientsSignature = (ingredients: any[]) => 
  ingredients.map(i => `${i.id}-${i.name}-${i.unit}-${i.pricePerUnit}`).join('|||');

const createStepsSignature = (steps: string[]) => 
  steps.join('|||');

const createImageSignature = (imageUris: any[]) => 
  imageUris.map(i => i.uri).join('|||');

export function useRecipeForm(id?: string) {
  const router = useRouter();
  const { recipes, addRecipe, editRecipe } = useRecipes();
  const { ingredients } = useIngredients();
  const { draft, updateDraft, clearDraft } = useDraftRecipe();

  const editing = !!id;
  const existingRecipe = useMemo(() => 
    recipes.find((r) => r.id === id),
    [recipes, id]
  );

  // Optimized: Memoize expensive signature calculations
  const ingredientsSignature = useMemo(() => 
    createIngredientsSignature(ingredients), 
    [ingredients]
  );

  // Reset draft saat buka form baru
  useEffect(() => {
    if (!editing) clearDraft();
  }, [editing, clearDraft]);

  // Optimized recipeData calculation
  const recipeData = useMemo(() => {
    if (editing && existingRecipe) {
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
    return {
      ...draft,
      imageUris: (draft.imageUris || []).map((uri) => ({
        uri,
        status: 'done' as const,
      })),
    };
  }, [
    editing,
    existingRecipe?.id,
    existingRecipe?.title,
    existingRecipe?.description,
    existingRecipe?.category,
    existingRecipe?.sellingPrice,
    existingRecipe?.margin,
    // Use memoized signatures instead of JSON.stringify
    existingRecipe ? createImageSignature(existingRecipe.imageUris || []) : '',
    existingRecipe ? createIngredientsSignature(existingRecipe.ingredients || []) : '',
    // For draft, we need to be more careful
    Object.keys(draft).join('-') + Object.values(draft).map(v => 
      Array.isArray(v) ? v.length : String(v)
    ).join('-')
  ]);

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
  } = useRecipeUploader(showToast, recipeData.imageUris);

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

  // Optimized: More efficient array stabilization
  const stepsSignature = useMemo(() => 
    createStepsSignature(steps), 
    [steps]
  );

  const ingredientsListSignature = useMemo(() => 
    createIngredientsSignature(ingredientsList), 
    [ingredientsList]
  );

  const imageUrisSignature = useMemo(() => 
    createImageSignature(imageUris), 
    [imageUris]
  );

  // Stable arrays using signatures for comparison
  const stableSteps = useMemo(() => [...steps], [stepsSignature]);
  const stableIngredientsList = useMemo(() => [...ingredientsList], [ingredientsListSignature]);
  const stableImageUris = useMemo(() => imageUris.map(i => i.uri), [imageUrisSignature]);

  // Optimized draft snapshot
  const draftSnapshot = useMemo(() => ({
    title: title || '',
    steps: stableSteps,
    ingredients: stableIngredientsList,
    imageUris: stableImageUris,
    category: category || '',
  }), [title, stableSteps, stableIngredientsList, stableImageUris, category]);

  // Stable updateDraft - Remove if updateDraft is already stable
  const stableUpdateDraft = useCallback((data: any) => {
    updateDraft(data);
  }, [updateDraft]);

  // Optimized draft saving effect
  useEffect(() => {
    if (editing) return;

    const prev = prevDraftRef.current;
    
    // More efficient comparison using direct property checks
    const hasChanged = (
      (prev.title || '') !== (draftSnapshot.title || '') ||
      prev.steps?.length !== draftSnapshot.steps?.length ||
      prev.ingredients?.length !== draftSnapshot.ingredients?.length ||
      prev.imageUris?.length !== draftSnapshot.imageUris?.length ||
      (prev.category || '') !== (draftSnapshot.category || '') ||
      // Only do deep comparison if lengths match but content might differ
      (prev.steps?.length === draftSnapshot.steps?.length && 
       !shallowEqualArray(prev.steps || [], draftSnapshot.steps || [])) ||
      (prev.ingredients?.length === draftSnapshot.ingredients?.length && 
       !shallowEqualArray(prev.ingredients || [], draftSnapshot.ingredients || [])) ||
      (prev.imageUris?.length === draftSnapshot.imageUris?.length && 
       !shallowEqualArray(prev.imageUris || [], draftSnapshot.imageUris || []))
    );

    if (hasChanged) {
      stableUpdateDraft(draftSnapshot);
      prevDraftRef.current = draftSnapshot;
    }
  }, [draftSnapshot, editing, stableUpdateDraft]);

  // Optimized ingredients sync
  useEffect(() => {
    if (!editing || !existingRecipe) return;

    setIngredientsList((prevIngredientsList) => {
      let hasChanges = false;
      const syncedIngredients = prevIngredientsList.map((item) => {
        const currentIngredient = ingredients.find((i) => i.id === item.ingredientId);
        
        if (!currentIngredient) return item;

        const newCost = parseFloat((currentIngredient.pricePerUnit * item.quantity).toFixed(2));
        const needsUpdate = (
          item.name !== currentIngredient.name ||
          item.unit !== currentIngredient.unit ||
          Math.abs(item.cost - newCost) > 0.001 // Handle floating point precision
        );

        if (needsUpdate) {
          hasChanges = true;
          return {
            ...item,
            name: currentIngredient.name,
            unit: currentIngredient.unit,
            cost: newCost,
          };
        }

        return item;
      });

      return hasChanges ? syncedIngredients : prevIngredientsList;
    });
  }, [
    editing,
    existingRecipe?.id,
    ingredientsSignature, // Use memoized signature instead of recreating
    setIngredientsList
  ]);

  // Memoized calculations
  const calculateTotalHPP = useCallback(() => {
    return ingredientsList.reduce((total, item) => total + (item.cost || 0), 0);
  }, [ingredientsList]);

  // Optimized validation
  const validateForm = useCallback(() => {
    const normalizedTitle = title.trim().toLowerCase();
    
    if (!normalizedTitle) {
      return { isValid: false, message: 'Judul resep tidak boleh kosong.' };
    }

    const isDuplicateTitle = recipes.some((r) => {
      if (editing && r.id === existingRecipe?.id) return false;
      return r.title.trim().toLowerCase() === normalizedTitle;
    });

    if (isDuplicateTitle) {
      return { isValid: false, message: 'Judul resep sudah digunakan. Gunakan nama lain.' };
    }

    if (ingredientsList.length === 0) {
      return { isValid: false, message: 'Tambahkan minimal satu bahan.' };
    }

    return { isValid: true };
  }, [title, recipes, editing, existingRecipe?.id, ingredientsList.length]);

  const handleSave = useCallback(async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      showToast(validation.message!, 'error');
      return;
    }

    const cleanedSteps = steps.filter((s) => s.trim() !== '');
    const recipeData = {
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

    try {
      if (editing && existingRecipe) {
        await editRecipe(existingRecipe.id, recipeData);
        showToast('Resep diperbarui.', 'success');
        router.back();
      } else {
        const newId = await addRecipe(recipeData);
        showToast('Resep berhasil ditambahkan.', 'success');
        router.replace(`/main/recipes/${newId}`);
      }
      clearDraft();
    } catch (error) {
      showToast('Terjadi kesalahan saat menyimpan resep.', 'error');
      console.error('Save recipe error:', error);
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
    showToast,
    router
  ]);

  return {
    // Form state
    title,
    setTitle,
    steps,
    updateStep,
    addStep,
    removeStep,
    category,
    setCategory,
    
    // Ingredients
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
    setIngredientsList,
    
    
    // Images
    imageUris,
    setImageUris,
    pickImage,
    isUploading,
    
    // Actions & utilities
    calculateTotalHPP,
    handleSave,
    validateForm,
    editing,
  };
}