// hooks/useRecipeMetadata.ts
import { useState, useEffect, useRef } from 'react';
import { ImageStatus } from './useRecipeUploader';
import { useDraftRecipe } from '../context/DraftRecipeContext';

// Helper untuk bandingkan array secara shallow
function shallowEqualArray<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    // Jika item adalah object, bandingkan JSON string-nya
    if (typeof arr1[i] === 'object' && typeof arr2[i] === 'object') {
      if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false;
    } else {
      if (arr1[i] !== arr2[i]) return false;
    }
  }
  return true;
}

type UseRecipeMetadataProps = {
  initialTitle: string;
  initialCategory: string;
  initialSteps: string[];
  initialIngredients: any[];
  initialImages: ImageStatus[];
  steps: string[];
  ingredients: any[];
  imageUris: ImageStatus[];
  isEditing: boolean;
  isSaving?: boolean; // ADDED: Optional prop untuk mencegah update saat saving
};

export function useRecipeMetadata({
  initialTitle,
  initialCategory,
  initialSteps,
  initialIngredients,
  initialImages,
  steps,
  ingredients,
  imageUris,
  isEditing,
  isSaving = false // ADDED: Default false
}: UseRecipeMetadataProps) {
  const { draft, updateDraft } = useDraftRecipe();
  
  // FIXED: Initialize dari draft jika tidak editing dan draft ada
  const [title, setTitle] = useState(() => {
    if (!isEditing && draft.title) {
      return draft.title;
    }
    return initialTitle;
  });
  
  const [category, setCategory] = useState(() => {
    if (!isEditing && draft.category) {
      return draft.category;
    }
    return initialCategory;
  });

  // FIXED: Track last update untuk mencegah infinite loop
  const lastUpdateRef = useRef<string>('');
  const prevDraftRef = useRef(draft);

  // FIXED: Hanya update jika tidak editing dan tidak saving
  useEffect(() => {
    // FIXED: Skip update jika sedang editing atau saving
    if (isEditing || isSaving) return;

    const currentSnapshot = {
      title,
      steps,
      ingredients,
      imageUris,
      category,
    };

    // FIXED: Create signature untuk detect perubahan yang meaningful
    const currentSignature = JSON.stringify({
      title: currentSnapshot.title,
      stepsLength: currentSnapshot.steps.length,
      ingredientsLength: currentSnapshot.ingredients.length,
      imagesLength: currentSnapshot.imageUris.length,
      category: currentSnapshot.category,
    });

    // FIXED: Hanya update jika signature berubah
    if (lastUpdateRef.current !== currentSignature) {
      const prev = prevDraftRef.current;

      const hasChanged =
        prev.title !== currentSnapshot.title ||
        !shallowEqualArray(prev.steps || [], currentSnapshot.steps || []) ||
        !shallowEqualArray(prev.ingredients || [], currentSnapshot.ingredients || []) ||
        !shallowEqualArray(prev.imageUris || [], currentSnapshot.imageUris || []) ||
        prev.category !== currentSnapshot.category;

      if (hasChanged) {
        updateDraft(currentSnapshot);
        prevDraftRef.current = currentSnapshot;
        lastUpdateRef.current = currentSignature;
      }
    }
  }, [title, steps, ingredients, imageUris, category, isEditing, isSaving, updateDraft]);

  // FIXED: Reset state saat initial data berubah (untuk editing mode)
  useEffect(() => {
    if (isEditing) {
      setTitle(initialTitle);
      setCategory(initialCategory);
    }
  }, [initialTitle, initialCategory, isEditing]);

  // FIXED: Custom setters yang lebih smart
  const setTitleSmart = (newTitle: string) => {
    setTitle(newTitle);
    // Reset update tracking untuk memastikan perubahan ter-detect
    lastUpdateRef.current = '';
  };

  const setCategorySmart = (newCategory: string) => {
    setCategory(newCategory);
    // Reset update tracking untuk memastikan perubahan ter-detect
    lastUpdateRef.current = '';
  };
console.log('Metadata update:', { 
  title, 
  isEditing, 
  isSaving, 
  imagesLength: imageUris.length 
});
  return {
    title,
    setTitle: setTitleSmart,
    category,
    setCategory: setCategorySmart,
  };
}