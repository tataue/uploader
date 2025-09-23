import React, { useState, useMemo } from 'react';
import { FileInfo, ViewMode } from './types/FileInfo';
import { useFileGroups } from './hooks/useFileGroups';
import EmptyState from './components/EmptyState';
import FileListHeader from './components/FileListHeader';
import GroupHeader from './components/GroupHeader';
import FileTableRow from './components/FileTableRow';

interface FileListProps {
  files: FileInfo[];
  onDeleteFile: (filename: string) => Promise<void>;
}

export default function FileList({ files, onDeleteFile }: FileListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('time');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return files;
    }
    return files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const { currentGroups } = useFileGroups(filteredFiles, viewMode);

  if (files.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <FileListHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        fileCount={filteredFiles.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Show message when search returns no results */}
      {searchQuery.trim() && filteredFiles.length === 0 && (
        <div className="enterprise-card p-8 text-center">
          <p className="text-slate-500">未找到匹配 "{searchQuery}" 的文件</p>
        </div>
      )}

      {currentGroups.map((group, index) => (
        <div key={index} className="enterprise-card overflow-hidden">
          <GroupHeader group={group} />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    文件名
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                    上传时间
                  </th>
                  <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                    文件大小
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                    类型
                  </th>
                  <th className="text-right py-4 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.files.map((file, fileIndex) => (
                  <FileTableRow key={fileIndex} file={file} onDeleteFile={onDeleteFile} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
