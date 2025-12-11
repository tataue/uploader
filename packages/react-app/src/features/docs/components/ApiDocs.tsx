import React from 'react';

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm font-mono text-neutral-50 shadow-inner">
    <code>{children}</code>
  </pre>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
      {title}
    </h3>
    {children}
  </section>
);

const ApiDocs = () => {
  const baseUrl = window.location.origin;

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-100">
      <div className="border-b border-neutral-100 pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">API 文档</h2>
        <p className="mt-2 text-neutral-500">
          基于 Curl 的命令行操作指南。基础路径: <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm text-neutral-700">{baseUrl}/uploader</code>
        </p>
      </div>

      <div className="grid gap-10">
        <Section title="1. 列出文件 (List Files)">
          <p className="text-neutral-600">获取当前上传目录下的文件列表。</p>
          <CodeBlock>curl -X GET "{baseUrl}/uploader"</CodeBlock>
        </Section>

        <Section title="2. 上传文件 (Upload Files)">
          <p className="text-neutral-600">支持单文件及批量上传 (Multipart)。</p>
          <CodeBlock>
            curl -X POST "{baseUrl}/uploader" \<br/>
            &nbsp;&nbsp;-F "files=@/path/to/file1.txt" \<br/>
            &nbsp;&nbsp;-F "files=@/path/to/file2.png"
          </CodeBlock>
        </Section>

        <Section title="3. 下载文件 (Download File)">
          <p className="text-neutral-600">下载单个文件或目录（目录会自动压缩）。注意 URL 编码。</p>
          <CodeBlock>
            curl -X POST "{baseUrl}/uploader/download/example.txt" \<br/>
            &nbsp;&nbsp;-o example.txt
          </CodeBlock>
        </Section>

        <Section title="4. 批量下载 (Batch Download)">
          <p className="text-neutral-600">批量下载多个文件，返回 ZIP 包。</p>
          <CodeBlock>
            curl -X POST "{baseUrl}/uploader/batch-download" \<br/>
            &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
            &nbsp;&nbsp;-d '&#123;"paths": ["file1.txt", "dir/image.png"]&#125;' \<br/>
            &nbsp;&nbsp;-o download.zip
          </CodeBlock>
        </Section>

        <Section title="5. 删除文件 (Delete File)">
          <p className="text-neutral-600">删除指定文件或目录。</p>
          <CodeBlock>
            curl -X DELETE "{baseUrl}/uploader/example.txt"
          </CodeBlock>
        </Section>

        <Section title="6. 批量删除 (Batch Delete)">
          <p className="text-neutral-600">批量删除多个文件或目录。</p>
          <CodeBlock>
            curl -X POST "{baseUrl}/uploader/batch-delete" \<br/>
            &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
            &nbsp;&nbsp;-d '&#123;"paths": ["file1.txt", "old_dir"]&#125;'
          </CodeBlock>
        </Section>
      </div>
    </div>
  );
};

export default ApiDocs;
