export interface ApiExample {
  label: string;
  description: string;
  snippets: {
    curl: string;
    browser: string;
    node: string;
    python: string;
  };
}

export const apiExamples: Record<string, ApiExample> = {
  list: {
    label: '1. 列出文件 (List Files)',
    description: '获取当前上传目录下的文件列表。',
    snippets: {
      curl: `curl -X GET "{baseUrl}/uploader"`,
      browser: `const response = await fetch('{baseUrl}/uploader');
const files = await response.json();
console.log(files);`,
      node: `const response = await fetch('{baseUrl}/uploader');
const files = await response.json();
console.log(files);`,
      python: `import requests

response = requests.get('{baseUrl}/uploader')
files = response.json()
print(files)`,
    },
  },
  upload: {
    label: '2. 上传文件 (Upload Files)',
    description: '支持单文件及批量上传 (Multipart)。',
    snippets: {
      curl: `curl -X POST "{baseUrl}/uploader" \\
  -F "files=@/path/to/file1.txt" \\
  -F "files=@/path/to/file2.png"`,
      browser: `const formData = new FormData();
// fileInput 是 <input type="file" /> 元素
formData.append('files', fileInput.files[0]);

await fetch('{baseUrl}/uploader', {
  method: 'POST',
  body: formData
});`,
      node: `import { openAsBlob } from 'node:fs';

const formData = new FormData();
formData.append('files', await openAsBlob('./file1.txt'));

await fetch('{baseUrl}/uploader', {
  method: 'POST',
  body: formData
});`,
      python: `import requests

files = [
    ('files', open('file1.txt', 'rb')),
    ('files', open('file2.png', 'rb'))
]
requests.post('{baseUrl}/uploader', files=files)`,
    },
  },
  download: {
    label: '3. 下载文件 (Download File)',
    description: '下载单个文件或目录（目录会自动压缩）。',
    snippets: {
      curl: `curl -X POST "{baseUrl}/uploader/download/example.txt" \\
  -o example.txt`,
      browser: `const res = await fetch('{baseUrl}/uploader/download/example.txt', {
  method: 'POST'
});
const blob = await res.blob();
// 使用 URL.createObjectURL(blob) 进行下载...`,
      node: `import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const res = await fetch('{baseUrl}/uploader/download/example.txt', {
  method: 'POST'
});

await pipeline(res.body, createWriteStream('./example.txt'));`,
      python: `import requests

url = '{baseUrl}/uploader/download/example.txt'
with requests.post(url, stream=True) as r:
    with open('example.txt', 'wb') as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)`,
    },
  },
  batchDownload: {
    label: '4. 批量下载 (Batch Download)',
    description: '批量下载多个文件，返回 ZIP 包。',
    snippets: {
      curl: `curl -X POST "{baseUrl}/uploader/batch-download" \\
  -H "Content-Type: application/json" \\
  -d '{"paths": ["file1.txt", "dir/img.png"]}' \\
  -o download.zip`,
      browser: `await fetch('{baseUrl}/uploader/batch-download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paths: ['file1.txt', 'dir/img.png']
  })
});`,
      node: `import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const res = await fetch('{baseUrl}/uploader/batch-download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paths: ['file1.txt', 'dir/img.png']
  })
});

await pipeline(res.body, createWriteStream('./download.zip'));`,
      python: `import requests

data = {"paths": ["file1.txt", "dir/img.png"]}
r = requests.post(
    '{baseUrl}/uploader/batch-download',
    json=data,
    stream=True
)
# Save to file...`,
    },
  },
  delete: {
    label: '5. 删除文件 (Delete File)',
    description: '删除指定文件或目录。',
    snippets: {
      curl: `curl -X DELETE "{baseUrl}/uploader/example.txt"`,
      browser: `await fetch('{baseUrl}/uploader/example.txt', {
  method: 'DELETE'
});`,
      node: `await fetch('{baseUrl}/uploader/example.txt', {
  method: 'DELETE'
});`,
      python: `import requests

requests.delete('{baseUrl}/uploader/example.txt')`,
    },
  },
  batchDelete: {
    label: '6. 批量删除 (Batch Delete)',
    description: '批量删除多个文件或目录。',
    snippets: {
      curl: `curl -X POST "{baseUrl}/uploader/batch-delete" \\
  -H "Content-Type: application/json" \\
  -d '{"paths": ["file1.txt", "old_dir"]}'`,
      browser: `await fetch('{baseUrl}/uploader/batch-delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paths: ['file1.txt', 'old_dir']
  })
});`,
      node: `await fetch('{baseUrl}/uploader/batch-delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paths: ['file1.txt', 'old_dir']
  })
});`,
      python: `import requests

data = {"paths": ["file1.txt", "old_dir"]}
requests.post('{baseUrl}/uploader/batch-delete', json=data)`,
    },
  },
};
