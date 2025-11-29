import React from 'react';
import { Download, Trash2, X, CheckSquare } from 'lucide-react';

interface BatchActionBarProps {
  selectedCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchDownload: () => void;
}

const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onBatchDelete,
  onBatchDownload,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
        <CheckSquare size={16} />
        <span>已选择 {selectedCount} 个文件</span>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        <button
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          className="btn-ghost rounded-full px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100"
        >
          {isAllSelected ? '取消全选' : '全选'}
        </button>
        <button
          onClick={onClearSelection}
          className="btn-ghost flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <X size={14} />
          清除选择
        </button>
        <button
          onClick={onBatchDownload}
          className="btn-ghost flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
        >
          <Download size={14} />
          批量下载
        </button>
        <button
          onClick={onBatchDelete}
          className="btn-ghost flex items-center gap-1 rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
        >
          <Trash2 size={14} />
          批量删除
        </button>
      </div>
    </div>
  );
};

export default BatchActionBar;
