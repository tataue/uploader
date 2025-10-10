import React, { useMemo, useState } from 'react';
import EmptyState from './components/EmptyState';
import { FileInfo } from './types/FileInfo';
import { formatFileSize, formatTime, getFileIcon } from './utils/formatUtils';

interface FileListProps {
  files: FileInfo[];
  onDeleteFile: (filename: string) => Promise<void>;
}

export default function FileList({ files, onDeleteFile }: FileListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFiles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const sortedFiles = [...files].sort(
      (a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    );

    if (!normalizedQuery) {
      return sortedFiles;
    }

    return sortedFiles.filter((file) => file.name.toLowerCase().includes(normalizedQuery));
  }, [files, searchQuery]);

  const handleDelete = async (filename: string): Promise<void> => {
    const confirmed = window.confirm(`确定要删除文件 "${filename}" 吗？`);
    if (!confirmed) {
      return;
    }

    try {
      await onDeleteFile(filename);
    } catch (error) {
      console.error('删除文件失败:', error);
      window.alert('删除失败，请稍后重试');
    }
  };

  const handleDownload = (filename: string): void => {
    const link = document.createElement('a');
    link.href = `./uploads/${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (filename: string): void => {
    const fileUrl = `./uploads/${encodeURIComponent(filename)}`;
    window.open(fileUrl, '_blank');
  };

  if (files.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">文件列表</h2>
          <p className="text-sm text-slate-500">共 {files.length} 个文件</p>
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="搜索文件名..."
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-64"
        />
      </header>

      {filteredFiles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          未找到匹配 "{searchQuery}" 的文件
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">文件</th>
                <th className="px-4 py-3 text-right">大小</th>
                <th className="px-4 py-3 text-left">上传时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFiles.map((file) => (
                <tr key={file.name} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                        {getFileIcon(file.type)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900" title={file.name}>
                          {file.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatTime(file.uploadTime)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handlePreview(file.name)}
                        className="rounded border border-transparent px-3 py-1 text-xs font-medium text-blue-600 transition hover:border-blue-100 hover:bg-blue-50"
                      >
                        预览
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(file.name)}
                        className="rounded border border-transparent px-3 py-1 text-xs font-medium text-emerald-600 transition hover:border-emerald-100 hover:bg-emerald-50"
                      >
                        下载
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(file.name)}
                        className="rounded border border-transparent px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-100 hover:bg-red-50"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
