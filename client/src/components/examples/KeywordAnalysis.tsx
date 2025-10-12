import KeywordAnalysis from '../KeywordAnalysis';

export default function KeywordAnalysisExample() {
  const sampleContent = `تحسين محركات البحث هو عملية مهمة لكل موقع إلكتروني. يساعد في رفع ترتيب الموقع.

من المهم اتباع معايير SEO الصحيحة لتحقيق أفضل النتائج. الكلمات المفتاحية يجب أن توزع بشكل متوازن.

تحسين محركات البحث يتطلب فهماً عميقاً. معايير SEO تضمن وصول المحتوى للجمهور.

المحتوى الجيد مع تحسين محركات البحث يحقق نتائج ممتازة.`;

  return (
    <KeywordAnalysis
      content={sampleContent}
      primaryKeyword="تحسين محركات البحث"
      secondaryKeywords={["معايير SEO", "الكلمات المفتاحية"]}
    />
  );
}
