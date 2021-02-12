import React, { useEffect, useState } from 'react';
import Upload from 'antd/es/upload';
import { UploadChangeParam } from 'antd/es/upload/interface';
import message from 'antd/es/message';

import Paragraph from 'antd/es/typography/Paragraph';

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

const fileListUrl =
  'https://run.mocky.io/v3/9ac83236-93ba-49a3-b82f-a8c0a968c002'; //https://run.mocky.io/v3/9ac83236-93ba-49a3-b82f-a8c0a968c002
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
    name: 'myFile',
    multiple: true,
    action: './upload.php',
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
      <Paragraph>
        还在使用微信文件传输助手？通过容器方式，快速部署可信网络下的文件传输，实现手机笔记本同子网络，文件交换，同时支持可靠的速度传输。
      </Paragraph>
    </div>
  );
}

export default App;
