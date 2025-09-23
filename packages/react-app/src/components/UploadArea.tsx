import React, { useRef } from 'react';
import { Card, Button } from '@nextui-org/react';

import { useFileUpload } from '../hooks/useFileUpload';
import UploadProgress from './UploadProgress';

interface UploadAreaProps {
  onUploadSuccess: () => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    dragActive, 
    uploading, 
    uploadProgress, 
    overallProgress, 
    handleDrag, 
    handleDrop, 
    handleChange 
  } = useFileUpload(onUploadSuccess);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="enterprise-card mb-6 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">文件上传</h2>
        <p className="text-sm text-slate-600">支持拖拽上传或点击选择文件</p>
      </div>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-slate-300 hover:border-slate-400'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        {/* 上传图标 */}
        <div className="mb-4">
          <div className={`
            inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
            ${dragActive ? 'bg-primary-100' : 'bg-slate-100'}
          `}>
            <span 
              className={`text-2xl ${dragActive ? 'text-primary-600' : 'text-slate-600'}`} 
            >
              ⬆️
            </span>
          </div>
        </div>
        
        {/* 主要文字 */}
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {dragActive ? '释放文件开始上传' : '拖拽文件到此处'}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          或者点击下方按钮选择文件
        </p>
        
        {/* 上传按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            color="primary"
            size="lg"
            onClick={onButtonClick}
            isLoading={uploading}
            disabled={uploading}
            className="font-medium px-6"
          >
            {uploading ? '上传中...' : '选择文件'}
          </Button>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-sm mr-1">📄</span>
              <span>文档</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm mr-1">🖼️</span>
              <span>图片</span>
            </div>
            <span>支持多文件上传</span>
          </div>
        </div>
        
        <UploadProgress 
          uploading={uploading}
          uploadProgress={uploadProgress}
          overallProgress={overallProgress}
        />
      </div>
      
      {/* 上传提示 */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-primary-500 mt-0.5 flex-shrink-0"></div>
          <div>
            <p className="text-sm text-slate-700 font-medium mb-1">上传说明</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• 支持任意格式文件上传</li>
              <li>• 可同时上传多个文件</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UploadArea;