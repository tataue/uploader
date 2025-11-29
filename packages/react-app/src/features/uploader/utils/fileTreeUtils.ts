import { FileInfo } from '../types/FileInfo';

export const findNodeByPath = (items: FileInfo[], path: string): FileInfo | undefined => {
  if (!path) return undefined;

  const parts = path.split('/').filter(Boolean);
  let current = items;

  for (const part of parts) {
    const found = current.find((item) => item.name === part && item.isDir);
    if (!found || !found.children) return undefined;
    current = found.children;
  }

  return {
    name: path,
    type: 'folder',
    size: 0,
    uploadTime: new Date().toISOString(),
    isDir: true,
    children: current,
    path,
  };
};

export const filterTree = (items: FileInfo[], query: string): FileInfo[] => {
  const normalizedQuery = query.toLowerCase();
  return items
    .filter((item) => {
      const matches = item.name.toLowerCase().includes(normalizedQuery);
      if (item.isDir && item.children) {
        const childMatches = filterTree(item.children, query);
        return matches || childMatches.length > 0;
      }
      return matches;
    })
    .map((item) => {
      if (item.isDir && item.children) {
        return { ...item, children: filterTree(item.children, query) };
      }
      return item;
    });
};

export const getBreadcrumbs = (currentPath: string): { name: string; path: string }[] => {
  if (!currentPath) return [];
  const parts = currentPath.split('/').filter(Boolean);
  return parts.map((part, index) => ({
    name: part,
    path: parts.slice(0, index + 1).join('/'),
  }));
};
