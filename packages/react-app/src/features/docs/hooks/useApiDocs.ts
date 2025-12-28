import { useState } from 'react';
import { Language } from '../components/CodeTabs';
import { apiExamples } from '../data/apiExamples';

export const useApiDocs = () => {
  const [lang, setLang] = useState<Language>('curl');
  const baseUrl = window.location.origin;

  const getCode = (template: string) => template.replace(/{baseUrl}/g, baseUrl);

  const sections = Object.values(apiExamples).map((example) => ({
    key: example.label,
    title: example.label,
    description: example.description,
    code: getCode(example.snippets[lang]),
  }));

  return {
    lang,
    setLang,
    baseUrl,
    sections,
  };
};
