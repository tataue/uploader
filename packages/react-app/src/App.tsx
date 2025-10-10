import UploadArea from './components/UploadArea';
import { useFileList } from './hooks/useFileList';
import List from './List';

function App() {
  const { fileList, refreshFileList } = useFileList();

  const handleDeleteFile = async (filename: string): Promise<void> => {
    const response = await fetch(`./uploader/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('删除文件失败');
    }

    refreshFileList();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4">
        <UploadArea onUploadSuccess={refreshFileList} />
        <List files={fileList} onDeleteFile={handleDeleteFile} />
      </main>
    </div>
  );
}

export default App;
