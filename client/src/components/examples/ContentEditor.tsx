import { useState } from 'react';
import ContentEditor from '../ContentEditor';

export default function ContentEditorExample() {
  const [content, setContent] = useState(`تحسين محركات البحث هو عملية مهمة لكل موقع إلكتروني. 

يجب أن تحتوي المقالة على الكلمات المفتاحية بشكل متوازن. تحسين محركات البحث يساعد في رفع ترتيب الموقع.

من المهم اتباع معايير SEO الصحيحة لتحقيق أفضل النتائج.`);

  return (
    <div className="h-[600px]">
      <ContentEditor
        content={content}
        onChange={setContent}
        primaryKeyword="تحسين محركات البحث"
        secondaryKeywords={["معايير SEO", "الكلمات المفتاحية"]}
      />
    </div>
  );
}
