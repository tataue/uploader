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

const collectFilePaths = (items: FileInfo[]): string[] => {
  const paths: string[] = [];
  for (const item of items) {
    const itemPath = item.path || item.name;
    if (!item.isDir) {
      paths.push(itemPath);
    } else if (item.children) {
      paths.push(...collectFilePaths(item.children));
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

export type SelectionState = 'none' | 'partial' | 'all';

export const useFileSelection = (files: FileInfo[], allFiles: FileInfo[]) => {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [excludedPaths, setExcludedPaths] = useState<Set<string>>(new Set());

  const allPaths = useMemo(() => collectAllPaths(files), [files]);

  const isPathSelected = useCallback(
    (path: string): boolean => {
      if (excludedPaths.has(path)) return false;
      if (selectedPaths.has(path)) return true;
      const parts = path.split('/');
      for (let i = 1; i < parts.length; i++) {
        const parentPath = parts.slice(0, i).join('/');
        if (selectedPaths.has(parentPath) && !excludedPaths.has(path)) return true;
      }
      return false;
    },
    [selectedPaths, excludedPaths]
  );

  const getSelectionState = useCallback(
    (path: string, item?: FileInfo): SelectionState => {
      const resolvedItem = item || findItemByPath(allFiles, path);
      if (!resolvedItem?.isDir) {
        return isPathSelected(path) ? 'all' : 'none';
      }
      const childPaths = getChildPaths(resolvedItem);
      if (childPaths.length === 0) {
        return isPathSelected(path) ? 'all' : 'none';
      }
      const selectedCount = childPaths.filter((p) => isPathSelected(p)).length;
      if (selectedCount === 0) return 'none';
      if (selectedCount === childPaths.length) return 'all';
      return 'partial';
    },
    [allFiles, isPathSelected]
  );

  const toggleSelection = useCallback(
    (path: string) => {
      const item = findItemByPath(allFiles, path);
      const childPaths = item ? getChildPaths(item) : [];
      const state = getSelectionState(path, item);

      if (state === 'none') {
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
      } else if (state === 'partial') {
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
      } else {
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
      }
    },
    [allFiles, getSelectionState]
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
    () => allPaths.filter((p) => isPathSelected(p)),
    [allPaths, isPathSelected]
  );

  const effectiveSelectedPaths = useMemo(() => {
    const result: string[] = [];
    const processedDirs = new Set<string>();

    for (const path of selectedItems) {
      const item = findItemByPath(allFiles, path);
      if (item?.isDir) {
        const state = getSelectionState(path, item);
        if (state === 'all') {
          result.push(path);
          processedDirs.add(path);
        }
      }
    }

    for (const path of selectedItems) {
      let hasFullySelectedParent = false;
      for (const dir of Array.from(processedDirs)) {
        if (path.startsWith(dir + '/')) {
          hasFullySelectedParent = true;
          break;
        }
      }
      if (!hasFullySelectedParent) {
        const item = findItemByPath(allFiles, path);
        if (!item?.isDir) {
          result.push(path);
        }
      }
    }

    return result;
  }, [selectedItems, allFiles, getSelectionState]);

  const isAllSelected = useMemo(
    () => allPaths.length > 0 && allPaths.every((p) => isPathSelected(p)),
    [allPaths, isPathSelected]
  );

  const hasSelection = selectedItems.length > 0;

  return {
    selectedItems: effectiveSelectedPaths,
    selectedCount: selectedItems.length,
    isSelected: isPathSelected,
    getSelectionState,
    toggleSelection,
    selectAll,
    clearSelection,
    clearAll,
    isAllSelected,
    hasSelection,
  };
};
