import { useState, useCallback, useMemo } from 'react';
import { FileInfo } from '../types/FileInfo';

const collectAllPaths = (items: FileInfo[]): string[] => {
  const paths: string[] = [];
  for (const item of items) {
    const itemPath = item.path || item.name;
    if (!item.isDir) {
      paths.push(itemPath);
    }
    if (item.isDir && item.children) {
      paths.push(...collectAllPaths(item.children));
    }
  }
  return paths;
};

export const useFileSelection = (files: FileInfo[]) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  const allFilePaths = useMemo(() => collectAllPaths(files), [files]);

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
    setSelectedPaths(new Set(allFilePaths));
  }, [allFilePaths]);

  const clearSelection = useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  const selectedFiles = useMemo(
    () => Array.from(selectedPaths),
    [selectedPaths]
  );

  const isAllSelected = useMemo(
    () => allFilePaths.length > 0 && allFilePaths.every((p) => selectedPaths.has(p)),
    [allFilePaths, selectedPaths]
  );

  const hasSelection = selectedPaths.size > 0;

  return {
    selectedFiles,
    selectedCount: selectedPaths.size,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    hasSelection,
  };
};
