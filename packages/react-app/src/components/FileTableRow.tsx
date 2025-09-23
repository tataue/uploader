import React, { useState } from 'react';
import { Link, Button, useDisclosure, Chip } from '@nextui-org/react';
import { FileInfo } from '../types/FileInfo';
import { getFileIcon, formatTime, formatFileSize } from '../utils/formatUtils';
import { getTypeColor } from '../utils/colorUtils';
import DeleteModal from './DeleteModal';

interface FileTableRowProps {
  file: FileInfo;
  onDeleteFile: (filename: string) => Promise<void>;
}

const FileTableRow: React.FC<FileTableRowProps> = ({ file, onDeleteFile }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    onOpen();
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await onDeleteFile(file.name);
    } catch (error) {
      console.error('删除文件失败:', error);
      setError('删除文件失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = `./uploads/${encodeURIComponent(file.name)}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fileUrl = `./uploads/${encodeURIComponent(file.name)}`;
    window.open(fileUrl, '_blank');
  };

  const typeColor = getTypeColor(file.type);

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 group">
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            {getFileIcon(file.type)}
            <div className="min-w-0 flex-1">
              <Link
                href={`./uploads/${encodeURIComponent(file.name)}`}
                className="text-slate-900 hover:text-primary-600 font-medium text-sm block truncate"
              >
                {file.name}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5 md:hidden">
                {formatFileSize(file.size)} • {formatTime(file.uploadTime)}
              </p>
            </div>
          </div>
        </td>
        
        <td className="py-3 px-4 text-slate-600 text-sm hidden md:table-cell">
          {formatTime(file.uploadTime)}
        </td>
        
        <td className="py-3 px-4 text-slate-600 text-sm text-right hidden md:table-cell">
          {formatFileSize(file.size)}
        </td>
        
        <td className="py-3 px-4 hidden lg:table-cell">
          <Chip
            size="sm"
            variant="flat"
            className={`${typeColor.bg} ${typeColor.text} border ${typeColor.border} font-medium text-xs px-2 py-1 rounded-md`}
          >
            {file.type.toUpperCase() || 'UNKNOWN'}
          </Chip>
        </td>
        
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-500 hover:text-primary-600 h-8 w-8"
              onClick={handleView}
              title="预览"
            >
              <span className="text-base">👁️</span>
            </Button>
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-500 hover:text-green-600 h-8 w-8"
              onClick={handleDownload}
              title="下载"
            >
              <span className="text-base">⬇️</span>
            </Button>
            
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-slate-500 hover:text-red-600 h-8 w-8"
              onClick={handleDeleteClick}
              isLoading={deleting}
              disabled={deleting}
              title="删除"
            >
              <span className="text-base">🗑️</span>
            </Button>
          </div>
        </td>
      </tr>

      <DeleteModal
        isOpen={isOpen}
        filename={file.name}
        deleting={deleting}
        error={error}
        onClose={() => onOpenChange()}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
};

export default FileTableRow;