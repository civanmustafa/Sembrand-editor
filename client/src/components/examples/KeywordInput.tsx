import { useState } from 'react';
import KeywordInput from '../KeywordInput';

export default function KeywordInputExample() {
  const [primary, setPrimary] = useState('تحسين محركات البحث');
  const [secondary, setSecondary] = useState(['معايير SEO', 'الكلمات المفتاحية', 'المحتوى الرقمي']);

  const handleKeywordClick = (keyword: string, type: 'primary' | 'secondary') => {
    console.log(`Clicked ${type} keyword: ${keyword}`);
  };

  return (
    <KeywordInput
      primaryKeyword={primary}
      secondaryKeywords={secondary}
      onPrimaryChange={setPrimary}
      onSecondaryChange={setSecondary}
      onKeywordClick={handleKeywordClick}
    />
  );
}
