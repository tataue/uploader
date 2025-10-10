import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <FolderOpen className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-900">暂无文件</h3>
      <p className="mt-2 text-sm text-slate-500">使用上方的上传区域开始上传文件</p>
    </section>
  );
};

export default EmptyState;
