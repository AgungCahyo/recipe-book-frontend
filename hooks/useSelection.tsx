import { useState, useCallback } from 'react';

export default function useSelection<T extends { id: string }>() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);

      // ⬇️ keluar dari selection mode kalau gak ada yang dipilih
      if (updated.size === 0) {
        setIsSelectionMode(false);
      }

      return updated;
    });
  }, []);

  const enableSelection = useCallback((id: string) => {
    setIsSelectionMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const cancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setIsSelectionMode(true);
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false); // ⬅️ auto exit juga
  }, []);

  return {
    selectedIds: Array.from(selectedIds),
    isSelectionMode,
    toggleSelect,
    enableSelection,
    cancelSelection,
    selectAll,
    deselectAll,
    isSelected: (id: string) => selectedIds.has(id),
  };
}
