import React from 'react';
import { Button } from '@nextui-org/react';

const EmptyState: React.FC = () => {
  return (
    <div className="enterprise-card p-8 text-center">
      <div className="max-w-sm mx-auto">
        {/* 图标 */}
        <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <span className="text-5xl text-slate-400">📁</span>
        </div>
        
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          暂无文件
        </h3>
        
        {/* 描述 */}
        <p className="text-slate-600 mb-6">
          您还没有上传任何文件。点击上方的上传区域或下面的按钮开始上传文件。
        </p>
        
        {/* 操作按钮 */}
        <div className="space-y-3">
          <Button
            color="primary"
            className="w-full"
            startContent={<span className=\"text-base\">⬆️</span>}
          >
            上传第一个文件
          </Button>
          
          <div className="text-xs text-slate-500">
            支持拖拽上传 • 任意文件格式
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;