interface UseFileActionsParams {
  selectedItems: string[];
  selectedCount: number;
  onBatchDelete: (paths: string[]) => Promise<void>;
  clearSelection: () => void;
}

interface UseFileActionsReturn {
  handleDelete: (filePath: string) => Promise<void>;
  handleDownload: (filePath: string) => void;
  handlePreview: (filePath: string) => void;
  handleBatchDelete: () => Promise<void>;
  handleBatchDownload: () => Promise<void>;
}

const isPreviewable = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const previewableExts = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    'pdf',
    'mp4', 'webm', 'ogg',
    'mp3', 'wav',
    'txt', 'json', 'xml', 'html', 'css', 'js', 'ts', 'md'
  ];
  return previewableExts.includes(ext);
};

export const useFileActions = ({
  selectedItems,
  selectedCount,
  onBatchDelete,
  clearSelection,
}: UseFileActionsParams): UseFileActionsReturn => {
  const handleDelete = async (filePath: string): Promise<void> => {
    try {
      await onBatchDelete([filePath]);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handlePreview = (filePath: string): void => {
    const url = `./uploader/download/${encodeURIComponent(filePath)}`;
    window.open(url, '_blank');
  };

  const handleDownload = (filePath: string): void => {
    const link = document.createElement('a');
    link.href = `./uploader/download/${encodeURIComponent(filePath)}?forceDownload=true`;
    link.download = filePath.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchDelete = async (): Promise<void> => {
    if (!confirm(`确定删除选中的 ${selectedCount} 项吗？`)) return;
    try {
      await onBatchDelete(selectedItems);
      clearSelection();
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('批量删除失败，请稍后重试');
    }
  };

  const handleBatchDownload = async (): Promise<void> => {
    try {
      const response = await fetch('./uploader/batch-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: selectedItems }),
      });
      if (!response.ok) throw new Error('下载失败');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'batch-download.zip';
      link.download = decodeURIComponent(filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('批量下载失败:', error);
      alert('批量下载失败，请稍后重试');
    }
  };

  return {
    handleDelete,
    handleDownload,
    handlePreview,
    handleBatchDelete,
    handleBatchDownload,
  };
};
