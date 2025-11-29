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

const findItemByPath = (items: FileInfo[], path: string): FileInfo | undefined => {
  for (const item of items) {
    const itemPath = item.path || item.name;
    if (itemPath === path) return item;
    if (item.isDir && item.children) {
      const found = findItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return undefined;
};

const getChildPaths = (item: FileInfo): string[] => {
  if (!item.isDir || !item.children) return [];
  return collectAllPaths(item.children);
};

export const useFileSelection = (files: FileInfo[], allFiles: FileInfo[]) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  const allPaths = useMemo(() => collectAllPaths(files), [files]);
  const allPathsSet = useMemo(() => new Set(allPaths), [allPaths]);

  const isSelected = useCallback(
    (path: string) => {
      if (selectedPaths.has(path)) return true;
      const parts = path.split('/');
      for (let i = 1; i < parts.length; i++) {
        const parentPath = parts.slice(0, i).join('/');
        if (selectedPaths.has(parentPath)) return true;
      }
      return false;
    },
    [selectedPaths]
  );

  const toggleSelection = useCallback(
    (path: string) => {
      setSelectedPaths((prev) => {
        const next = new Set(prev);
        const item = findItemByPath(allFiles, path);
        const childPaths = item ? getChildPaths(item) : [];

        if (next.has(path)) {
          next.delete(path);
          for (const childPath of childPaths) {
            next.delete(childPath);
          }
        } else {
          next.add(path);
          for (const childPath of childPaths) {
            next.add(childPath);
          }
        }
        return next;
      });
    },
    [allFiles]
  );

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
    () => allPaths.length > 0 && allPaths.every((p) => isSelected(p)),
    [allPaths, isSelected]
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
