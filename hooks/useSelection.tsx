import { useState } from 'react';

export default function useSelection<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const enableSelection = (id: string) => {
    setIsSelectionMode(true);
    setSelectedIds([id]);
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const selectAll = (items: T[]) => {
    setIsSelectionMode(true);
    setSelectedIds(items.map((item) => item.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    isSelectionMode,
    toggleSelect,
    enableSelection,
    cancelSelection,
    selectAll,
    deselectAll,
  };
}
