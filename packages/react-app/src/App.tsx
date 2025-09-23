import './App.css';
import UploadArea from './components/UploadArea';
import { useFileList } from './hooks/useFileList';
import List from './List';

function App() {
  const { fileList, refreshFileList } = useFileList();

  const handleDeleteFile = async (filename: string): Promise<void> => {
    try {
      const response = await fetch(`./uploader/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('文件删除成功');
        refreshFileList();
      } else {
        throw new Error('删除请求失败');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-enterprise-bg">
      {/* 主内容区域 */}
      <main className="relative z-10 p-4 lg:p-6">
        <div className="w-[80vw]">
          <UploadArea onUploadSuccess={refreshFileList} />
          <List files={fileList} onDeleteFile={handleDeleteFile} />
        </div>
      </main>
    </div>
  );
}

export default App;
