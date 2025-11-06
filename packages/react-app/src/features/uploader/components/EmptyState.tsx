import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <section className="card card-hover flex flex-col items-center space-y-6 p-10 text-center">
      <div className="relative">
        <span className="absolute inset-0 -translate-y-2 animate-pulse rounded-full bg-brand-200/30 blur-md" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-400/30 via-brand-400/20 to-brand-300/30 text-brand-500 shadow-soft">
          <FolderOpen className="h-12 w-12" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-neutral-900">暂无文件</h3>
        <p className="text-sm text-neutral-500">
          使用上传功能添加文件或目录，自动保持原有结构。
        </p>
      </div>
    </section>
  );
};

export default EmptyState;
