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
  const allPathsSet = useMemo(() => new Set(allPaths), [allPaths]);

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
    setSelectedPaths((prev) => new Set([...Array.from(prev), ...allPaths]));
  }, [allPaths]);

  const clearSelection = useCallback(() => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      for (const path of allPaths) {
        next.delete(path);
      }
      return next;
    });
  }, [allPaths]);

  const clearAll = useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  const selectedItems = useMemo(
    () => Array.from(selectedPaths).filter((p) => allPathsSet.has(p)),
    [selectedPaths, allPathsSet]
  );

  const isAllSelected = useMemo(
    () => allPaths.length > 0 && allPaths.every((p) => selectedPaths.has(p)),
    [allPaths, selectedPaths]
  );

  const hasSelection = selectedItems.length > 0;

  return {
    selectedItems,
    selectedCount: selectedItems.length,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    clearAll,
    isAllSelected,
    hasSelection,
  };
};
