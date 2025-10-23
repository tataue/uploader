import React, { useState, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import EmptyState from './components/EmptyState';
import DirectoryTree from './components/DirectoryTree';
import { FileInfo } from './types/FileInfo';

interface FileListProps {
  files: FileInfo[];
  onDeleteFile: (filePath: string) => Promise<void>;
  currentPath?: string;
  onNavigateToDir?: (dirPath: string) => void;
}

const findNodeByPath = (items: FileInfo[], path: string): FileInfo | undefined => {
  if (!path) return undefined;
  
  const parts = path.split('/').filter(Boolean);
  let current = items;
  
  for (const part of parts) {
    const found = current.find(item => item.name === part && item.isDir);
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

export default function FileList({ files, onDeleteFile, currentPath = '', onNavigateToDir }: FileListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDelete = async (filePath: string): Promise<void> => {
    try {
      await onDeleteFile(filePath);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleDownload = (filePath: string): void => {
    const link = document.createElement('a');
    link.href = `./uploader/download/${encodeURIComponent(filePath)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNavigateToDir = (dirPath: string): void => {
    onNavigateToDir?.(dirPath);
  };

  const handleGoBack = (): void => {
    if (currentPath) {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
      handleNavigateToDir(parentPath);
    }
  };

  const handleBreadcrumbClick = (path: string): void => {
    handleNavigateToDir(path);
  };

  const getBreadcrumbs = (): { name: string; path: string }[] => {
    if (!currentPath) return [];
    const parts = currentPath.split('/').filter(Boolean);
    return parts.map((part, index) => ({
      name: part,
      path: parts.slice(0, index + 1).join('/'),
    }));
  };

  const filterTree = (items: FileInfo[], query: string): FileInfo[] => {
    const normalizedQuery = query.toLowerCase();
    return items.filter(item => {
      const matches = item.name.toLowerCase().includes(normalizedQuery);
      if (item.isDir && item.children) {
        const childMatches = filterTree(item.children, query);
        return matches || childMatches.length > 0;
      }
      return matches;
    }).map(item => {
      if (item.isDir && item.children) {
        return { ...item, children: filterTree(item.children, query) };
      }
      return item;
    });
  };

  const displayedItems = useMemo(() => {
    if (!currentPath) {
      return files;
    }
    const node = findNodeByPath(files, currentPath);
    return node?.children || [];
  }, [files, currentPath]);

  const filteredFiles = searchQuery ? filterTree(displayedItems, searchQuery) : displayedItems;

  if (files.length === 0) {
    return <EmptyState />;
  }

  const breadcrumbs = getBreadcrumbs();

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">文件列表</h2>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
              <span>当前目录:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleBreadcrumbClick('')}
                  className="hover:text-blue-600 hover:underline px-1 py-0.5 rounded bg-slate-100"
                >
                  /
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    <span className="text-slate-400">/</span>
                    <button
                      onClick={() => handleBreadcrumbClick(crumb.path)}
                      className="hover:text-blue-600 hover:underline px-1 py-0.5 rounded hover:bg-slate-100 transition"
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          {currentPath && (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-1 px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm text-slate-700 transition w-fit"
            >
              <ChevronLeft size={16} />
              返回上级
            </button>
          )}
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索文件或文件夹..."
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 sm:w-64"
        />
      </header>

      {filteredFiles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          {searchQuery ? `未找到匹配 "${searchQuery}" 的文件` : '当前目录为空'}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <DirectoryTree
            items={filteredFiles}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onNavigateToDir={handleNavigateToDir}
          />
        </div>
      )}
    </section>
  );
}

