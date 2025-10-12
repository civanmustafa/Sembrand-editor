import AnalysisTabs from '../AnalysisTabs';

export default function AnalysisTabsExample() {
  const sampleContent = `تحسين محركات البحث هو عملية مهمة لكل موقع إلكتروني. تحسين محركات البحث يساعد في رفع ترتيب الموقع.

من المهم اتباع معايير SEO الصحيحة لتحقيق أفضل النتائج. معايير SEO الصحيحة تضمن وصول المحتوى للجمهور المستهدف.

الكلمات المفتاحية يجب أن توزع بشكل متوازن في المحتوى. الكلمات المفتاحية تساعد محركات البحث على فهم الموضوع.`;

  return (
    <div className="h-[600px]">
      <AnalysisTabs
        content={sampleContent}
        primaryKeyword="تحسين محركات البحث"
        secondaryKeywords={["معايير SEO", "الكلمات المفتاحية"]}
      />
    </div>
  );
}
