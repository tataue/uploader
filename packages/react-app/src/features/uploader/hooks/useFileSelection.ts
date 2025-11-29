import { useState, useCallback, useMemo } from 'react';
import { FileInfo } from '../types/FileInfo';

const collectAllPaths = (items: FileInfo[]): string[] => {
  const paths: string[] = [];
  for (const item of items) {
    const itemPath = item.path || item.name;
    paths.push(itemPath);
    if (item.isDir && item.children) {
      paths.push(...collectAllPaths(item.children));
    }
  }
  return paths;
};

export const useFileSelection = (files: FileInfo[]) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  const allPaths = useMemo(() => collectAllPaths(files), [files]);

  const isSelected = useCallback(
    (path: string) => selectedPaths.has(path),
    [selectedPaths]
  );

  const toggleSelection = useCallback((path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPaths(new Set(allPaths));
  }, [allPaths]);

  const clearSelection = useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  const selectedItems = useMemo(
    () => Array.from(selectedPaths),
    [selectedPaths]
  );

  const isAllSelected = useMemo(
    () => allPaths.length > 0 && allPaths.every((p) => selectedPaths.has(p)),
    [allPaths, selectedPaths]
  );

  const hasSelection = selectedPaths.size > 0;

  return {
    selectedItems,
    selectedCount: selectedPaths.size,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
  };
};
