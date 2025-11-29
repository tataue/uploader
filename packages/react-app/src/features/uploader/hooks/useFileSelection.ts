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

const getParentPath = (path: string): string | null => {
  const lastSlash = path.lastIndexOf('/');
  return lastSlash > 0 ? path.substring(0, lastSlash) : null;
};

export const useFileSelection = (files: FileInfo[], allFiles: FileInfo[]) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [excludedPaths, setExcludedPaths] = useState<Set<string>>(new Set());

  const allPaths = useMemo(() => collectAllPaths(files), [files]);
  const allPathsSet = useMemo(() => new Set(allPaths), [allPaths]);

  const hasSelectedParent = useCallback(
    (path: string, selected: Set<string>, excluded: Set<string>): boolean => {
      const parts = path.split('/');
      for (let i = 1; i < parts.length; i++) {
        const parentPath = parts.slice(0, i).join('/');
        if (selected.has(parentPath) && !excluded.has(path)) return true;
      }
      return false;
    },
    []
  );

  const isSelected = useCallback(
    (path: string) => {
      if (excludedPaths.has(path)) return false;
      if (selectedPaths.has(path)) return true;
      return hasSelectedParent(path, selectedPaths, excludedPaths);
    },
    [selectedPaths, excludedPaths, hasSelectedParent]
  );

  const toggleSelection = useCallback(
    (path: string) => {
      const currentlySelected = isSelected(path);
      const item = findItemByPath(allFiles, path);
      const childPaths = item ? getChildPaths(item) : [];

      if (currentlySelected) {
        setSelectedPaths((prev) => {
          const next = new Set(prev);
          next.delete(path);
          for (const childPath of childPaths) {
            next.delete(childPath);
          }
          return next;
        });
        setExcludedPaths((prev) => {
          const next = new Set(prev);
          next.add(path);
          for (const childPath of childPaths) {
            next.add(childPath);
          }
          return next;
        });
      } else {
        setSelectedPaths((prev) => {
          const next = new Set(prev);
          next.add(path);
          for (const childPath of childPaths) {
            next.add(childPath);
          }
          return next;
        });
        setExcludedPaths((prev) => {
          const next = new Set(prev);
          next.delete(path);
          for (const childPath of childPaths) {
            next.delete(childPath);
          }
          return next;
        });
      }
    },
    [allFiles, isSelected]
  );

  const selectAll = useCallback(() => {
    setSelectedPaths((prev) => new Set([...Array.from(prev), ...allPaths]));
    setExcludedPaths((prev) => {
      const next = new Set(prev);
      for (const path of allPaths) {
        next.delete(path);
      }
      return next;
    });
  }, [allPaths]);

  const clearSelection = useCallback(() => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      for (const path of allPaths) {
        next.delete(path);
      }
      return next;
    });
    setExcludedPaths((prev) => {
      const next = new Set(prev);
      for (const path of allPaths) {
        next.delete(path);
      }
      return next;
    });
  }, [allPaths]);

  const clearAll = useCallback(() => {
    setSelectedPaths(new Set());
    setExcludedPaths(new Set());
  }, []);

  const selectedItems = useMemo(
    () => allPaths.filter((p) => isSelected(p)),
    [allPaths, isSelected]
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
