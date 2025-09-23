import React from 'react';
import { Chip } from '@nextui-org/react';
import { FileGroup } from '../types/FileInfo';

interface GroupHeaderProps {
  group: FileGroup;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group }) => {
  return (
    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 图标 */}
          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
            <div className="text-primary-600 text-lg">
              {group.icon}
            </div>
          </div>
          
          {/* 标题 */}
          <h3 className="text-base font-semibold text-slate-900">
            {group.label}
          </h3>
        </div>
        
        {/* 文件数量 */}
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <span className="font-medium text-slate-700">{group.files.length}</span>
          <span>个文件</span>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;