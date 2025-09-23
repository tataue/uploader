import React from 'react';
import { Button, Input } from '@nextui-org/react';
import { ViewMode } from '../types/FileInfo';

interface FileListHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  fileCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FileListHeader: React.FC<FileListHeaderProps> = ({ 
  viewMode, 
  onViewModeChange, 
  fileCount, 
  searchQuery, 
  onSearchChange 
}) => {
  return (
    <div className="enterprise-card p-4 mb-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* 左侧：标题和搜索 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              文件管理
            </h2>
            <p className="text-sm text-slate-600">
              共 {fileCount} 个文件
            </p>
          </div>
          
          {/* 搜索框 */}
          <div className="w-full sm:w-80">
            <Input
              type="text"
              placeholder="搜索文件名..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              startContent={
                <span className="text-slate-400 group-data-[focus=true]:text-primary-500 transition-colors text-sm">🔍</span>
              }
              classNames={{
                base: "w-full",
                mainWrapper: "h-full",
                input: [
                  "bg-transparent",
                  "text-slate-700",
                  "placeholder:text-slate-400",
                  "group-data-[focus=true]:placeholder:text-slate-300"
                ],
                inputWrapper: [
                  "bg-white",
                  "border-2",
                  "border-slate-200",
                  "hover:border-slate-300",
                  "data-[focus=true]:border-primary-300",
                  "data-[focus=true]:bg-white",
                  "transition-all",
                  "duration-200",
                  "rounded-xl",
                  "!cursor-text",
                  "backdrop-filter-none",
                  "!backdrop-blur-none",
                ],
              }}
              size="md"
              variant="bordered"
            />
          </div>
        </div>

        {/* 右侧：视图切换和操作 */}
        <div className="flex items-center gap-3">
          {/* 视图模式切换 */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'type' ? 'solid' : 'light'}
              color={viewMode === 'type' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('type')}
              className="px-3 text-sm font-medium"
            >
              <span className="mr-1 text-sm">▦</span>
              按类型
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'time' ? 'solid' : 'light'}
              color={viewMode === 'time' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('time')}
              className="px-3 text-sm font-medium"
            >
              <span className="mr-1 text-sm">☰</span>
              按时间
            </Button>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default FileListHeader;