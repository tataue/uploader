import React, { useEffect, useState } from 'react';
import Upload from 'antd/es/upload';
import { UploadChangeParam } from 'antd/es/upload/interface';
import message from 'antd/es/message';

import { InboxOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

import List, { FileData } from './List';
import './App.css';

interface FileList {
  type: string;
  name: string;
}
interface tempFileData {
  [index: string]: FileData;
}

const { Dragger } = Upload;

const fileListUrl = './uploader'; //https://run.mocky.io/v3/9ac83236-93ba-49a3-b82f-a8c0a968c002
const process = (data: string[]): FileData[] => {
  const fileList: FileList[] = [];
  data.forEach((item) => {
    let type = '';
    if (item.split('.').length > 1) {
      type = item.split('.').pop() || 'blank';
    }
    fileList.push({ type, name: item });
  });
  let tmp: tempFileData = {};
  fileList.forEach((item) => {
    if (!tmp[item.type]) {
      tmp[item.type] = {
        type: item.type,
        files: [],
      };
    }
    tmp[item.type]['files'].push(item.name);
  });

  const res: FileData[] = [];
  Object.keys(tmp).forEach((key) => {
    res.push(tmp[key]);
  });

  return res.sort((a, b) => {
    return b.files.length - a.files.length;
  });
};

function App() {
  const [needRefresh, refresh] = useState(Boolean);
  const [fileList, setFileList] = useState<FileData[]>([]);
  useEffect(() => {
    fetch(fileListUrl).then((res) => {
      res.json().then((data: string[]) => {
        setFileList(
          process(
            data.filter((name) => {
              return name !== '.' && name !== '..';
            })
          )
        );
      });
    });
  }, [needRefresh]);

  const props = {
    name: 'file',
    multiple: true,
    action: './uploader',
    onChange(info: UploadChangeParam) {
      const { status } = info.file;
      if (status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        // message.success(`${info.file.name} file uploaded successfully.`);
        console.log('refresh');
        refresh(!needRefresh);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    defaultFiLeList: [],
  };
  return (
    <div className="App">
      <h1>文件传递助手</h1>
      <div className="uploader">
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件上传</p>
        </Dragger>
      </div>
      <List data={fileList} />
    </div>
  );
}

export default App;
