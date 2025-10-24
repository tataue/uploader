import React, { useState, useMemo } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
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
    <section className="space-y-5">
      <header className="card card-hover space-y-5 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand-500">
              <span className="h-1 w-1 rounded-full bg-brand-500" />
              <span>资源管理器</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-neutral-900">文件列表</h2>
              <p className="text-sm text-neutral-500">浏览、搜索和管理已上传的文件与文件夹</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              <span>当前目录:</span>
              <nav className="flex flex-wrap items-center gap-1 rounded-full bg-neutral-100/70 px-3 py-1 text-neutral-700 shadow-inner">
                {([{ name: '根目录', path: '' }, ...breadcrumbs] as const).map((crumb, index) => (
                  <React.Fragment key={crumb.path || `root-${index}`}>
                    {index > 0 && <span className="text-neutral-300">/</span>}
                    <button
                      onClick={() => handleBreadcrumbClick(crumb.path)}
                      className={`rounded-full px-2 py-0.5 text-sm transition hover:bg-white hover:text-brand-600 ${
                        crumb.path === currentPath ? 'font-semibold text-brand-600' : ''
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            </div>
          </div>
          {currentPath && (
            <button onClick={handleGoBack} className="btn-ghost flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800">
              <ChevronLeft size={16} />
              返回上级
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件或文件夹..."
              className="input-base rounded-full pl-11 pr-4 shadow-soft"
              aria-label="搜索文件或文件夹"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-neutral-200/80 text-xs text-neutral-600 hover:bg-neutral-300"
                aria-label="清除搜索"
              >
                ×
              </button>
            )}
          </div>
          <span className="text-xs text-neutral-400">共 {filteredFiles.length} 项</span>
        </div>
      </header>

      {filteredFiles.length === 0 ? (
        <div className="card card-hover rounded-xl border border-dashed border-neutral-200/70 p-8 text-center text-sm text-neutral-500">
          {searchQuery ? `未找到匹配 "${searchQuery}" 的文件` : '当前目录为空'}
        </div>
      ) : (
        <div className="card card-hover p-6 backdrop-blur-sm">
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

