import { useApiDocs } from '../hooks/useApiDocs';
import { ApiDocsPresenter } from './ApiDocsPresenter';

const ApiDocs = () => {
  const { lang, setLang, baseUrl, sections } = useApiDocs();

  return (
    <ApiDocsPresenter
      lang={lang}
      onLangChange={setLang}
      baseUrl={baseUrl}
      sections={sections}
    />
  );
};

export default ApiDocs;
