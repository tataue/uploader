import React from 'react';
import List from 'antd/es/list';
import Tag from 'antd/es/tag';

export interface FileData {
  type: string,
  files: string[]
};



const genDarkColor = (): string => {
  const color = Math.random().toString(16).slice(2, 8);
  let res = [];
  for (let i = 0; i < color.length; i += 2) {
    const n = color.split('').splice(i, 2).join('');
    res.push(parseInt(n, 16));
  }
  const [r, g, b] = res;
  if (r * 0.299 + g * 0.578 + b * 0.114 >= 100) {
    // 越小颜色越深
    // console.log('re gen...');
    return genDarkColor();
  } else {
    return color;
  }
};

const TagHeader = (props: { tag: string }) => {
  return <Tag color={`#${genDarkColor()}`}>{props.tag}</Tag>;
};

export default function FileList(props: {data: FileData[]}) {
  const data: FileData[] = props.data;
  return (
    <div className="list">
      <List
        grid={{
          gutter: 64,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 6,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List
              size="small"
              header={<TagHeader tag={item.type} />}
              dataSource={item.files}
              renderItem={(file) => (
                <List.Item>
                  <a className="link" href={`./uploads/${file}`}>{file}</a>
                </List.Item>
              )}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
