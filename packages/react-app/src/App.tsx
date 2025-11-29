import { useState } from 'react';
import UploadArea from './features/uploader/components/UploadArea';
import { useFileList } from './features/uploader/hooks/useFileList';
import FileList from './features/uploader/components/FileList';
import Navbar from './components/Navbar';

function App() {
  const { fileList, refreshFileList } = useFileList();
  const [currentPath, setCurrentPath] = useState<string>('');

  const handleBatchDelete = async (paths: string[]): Promise<void> => {
    const response = await fetch('./uploader/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });

    if (!response.ok) {
      throw new Error('批量删除失败');
    }

    refreshFileList();
  };

  const handleNavigateToDir = (dirPath: string): void => {
    setCurrentPath(dirPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-12 sm:px-6 lg:px-12 xl:px-16">
        <header className="flex flex-col gap-4 text-center lg:text-left">
          <span className="mx-auto flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-500 lg:m-0">
            <span className="h-[2px] w-6 bg-brand-500" />
            上传中心
          </span>
          <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">统一文件管理平台</h1>
          <p className="text-sm text-neutral-500 sm:text-base">
            轻松上传、浏览与管理文件与目录。实时同步进度，支持目录结构保持原样。
          </p>
        </header>

        <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] xl:items-start xl:gap-10">
          <UploadArea onUploadSuccess={refreshFileList} currentPath={currentPath} />
          <FileList
            files={fileList}
            onBatchDelete={handleBatchDelete}
            currentPath={currentPath}
            onNavigateToDir={handleNavigateToDir}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
