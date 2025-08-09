import { useState } from 'react';

export function useRecipeSteps(initialSteps: string[] = ['']) {
  const [steps, setSteps] = useState<string[]>(initialSteps);

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStep = () => setSteps((prev) => [...prev, '']);

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    steps,
    setSteps,
    updateStep,
    addStep,
    removeStep,
  };
}
