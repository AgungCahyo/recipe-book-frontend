//hooks/useRecipeMetadata

import { useState, useEffect, useRef } from 'react';
import { ImageStatus } from './useRecipeUploader';
import { useDraftRecipe } from '../context/DraftRecipeContext';

type UseRecipeMetadataProps = {
  initialTitle: string;
  initialCategory: string;
  initialSteps: string[];
  initialIngredients: any[];
  initialImages: ImageStatus[];
  steps: string[];
  ingredients: any[];
  imageUris: ImageStatus[];
    isEditing: boolean,
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
  isEditing
}: UseRecipeMetadataProps) {
  const { draft, updateDraft } = useDraftRecipe();
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const prevDraftRef = useRef(draft);

useEffect(() => {
  if (isEditing) return; // ⛔ skip update draft saat sedang edit resep

  const currentSnapshot = {
    title,
    steps,
    ingredients,
    imageUris: imageUris.map((i) => i.uri),
    category,
  };

  const prev = prevDraftRef.current;

  const isSame =
    prev.title === currentSnapshot.title &&
    JSON.stringify(prev.steps) === JSON.stringify(currentSnapshot.steps) &&
    JSON.stringify(prev.ingredients) === JSON.stringify(currentSnapshot.ingredients) &&
    JSON.stringify(prev.imageUris) === JSON.stringify(currentSnapshot.imageUris) &&
    prev.category === currentSnapshot.category;

  if (!isSame) {
    updateDraft(currentSnapshot);
    prevDraftRef.current = currentSnapshot;
  }
}, [title, steps, ingredients, imageUris, category]);



  return {
    title,
    setTitle,
    category,
    setCategory,
  };
}
