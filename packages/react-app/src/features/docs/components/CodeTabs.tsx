export type Language = 'curl' | 'browser' | 'node' | 'python';

interface CodeTabsProps {
  activeLang: Language;
  onLangChange: (lang: Language) => void;
  code: string;
}

const CodeTabs = ({ activeLang, onLangChange, code }: CodeTabsProps) => {
  const tabs: { id: Language; label: string }[] = [
    { id: 'curl', label: 'cURL' },
    { id: 'browser', label: 'Browser JS' },
    { id: 'node', label: 'Node.js' },
    { id: 'python', label: 'Python' },
  ];

  return (
    <div className="mt-4 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 shadow-sm">
      <div className="flex border-b border-neutral-700 bg-neutral-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onLangChange(tab.id)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              activeLang === tab.id
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="h-52 w-full overflow-auto p-4 scrollbar-slim">
        <pre className="text-sm font-mono text-neutral-50">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeTabs;
