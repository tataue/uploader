import CodeTabs, { Language } from './CodeTabs';

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Section = ({ title, description, children }: SectionProps) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      {title}
    </h3>
    <p className="text-neutral-600">{description}</p>
    {children}
  </section>
);

interface ApiDocsPresenterProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  baseUrl: string;
  sections: Array<{
    key: string;
    title: string;
    description: string;
    code: string;
  }>;
}

export const ApiDocsPresenter = ({
  lang,
  onLangChange,
  baseUrl,
  sections,
}: ApiDocsPresenterProps) => (
  <div className="mx-auto min-h-[calc(100vh-200px)] w-full max-w-[896px] animate-fade-in space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-100">
    <div className="border-b border-neutral-100 pb-6">
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900">API 文档</h2>
      <p className="mt-2 text-neutral-500">
        集成指南与代码示例。基础路径:
        <code className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm text-neutral-700">
          {baseUrl}/uploader
        </code>
      </p>
    </div>

    <div className="grid gap-10">
      {sections.map((section) => (
        <Section
          key={section.key}
          title={section.title}
          description={section.description}
        >
          <CodeTabs
            activeLang={lang}
            onLangChange={onLangChange}
            code={section.code}
          />
        </Section>
      ))}
    </div>
  </div>
);
