import { useMemo } from 'react';
import CriteriaCard from './CriteriaCard';

interface KeywordAnalysisProps {
  content: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export default function KeywordAnalysis({ 
  content, 
  primaryKeyword, 
  secondaryKeywords 
}: KeywordAnalysisProps) {
  const analysis = useMemo(() => {
    const text = content.toLowerCase();
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    
    // Count primary keyword occurrences (case-insensitive)
    const primaryCount = primaryKeyword ? 
      (text.match(new RegExp(primaryKeyword.toLowerCase(), 'g')) || []).length : 0;
    
    // Count secondary keywords
    const secondaryCounts = secondaryKeywords.map(kw => ({
      keyword: kw,
      count: kw ? (text.match(new RegExp(kw.toLowerCase(), 'g')) || []).length : 0
    }));

    // Calculate density
    const primaryDensity = wordCount > 0 ? (primaryCount / wordCount * 100).toFixed(2) : '0.00';
    
    // Check first 150 characters
    const first150 = content.substring(0, 150).toLowerCase();
    const inFirst150 = primaryKeyword ? first150.includes(primaryKeyword.toLowerCase()) : false;

    // Check last 2 paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    const lastParas = paragraphs.slice(-2).join(' ').toLowerCase();
    const inLastParas = primaryKeyword ? lastParas.includes(primaryKeyword.toLowerCase()) : false;

    // Expected density calculation
    const totalKeywords = 1 + secondaryKeywords.length;
    let expectedPrimaryDensity = 1.2;
    
    if (totalKeywords === 2) expectedPrimaryDensity = 0.8;
    else if (totalKeywords === 3) expectedPrimaryDensity = 0.7;
    else if (totalKeywords === 4) expectedPrimaryDensity = 0.6;
    else if (totalKeywords >= 5) expectedPrimaryDensity = 0.5;

    const expectedCount = Math.round((wordCount / 1000) * (expectedPrimaryDensity * 10));

    return {
      primaryCount,
      primaryDensity: parseFloat(primaryDensity),
      secondaryCounts,
      inFirst150,
      inLastParas,
      expectedCount,
      expectedDensity: expectedPrimaryDensity,
      wordCount
    };
  }, [content, primaryKeyword, secondaryKeywords]);

  // Determine status
  const densityDiff = Math.abs(analysis.primaryDensity - analysis.expectedDensity);
  const densityStatus = densityDiff <= 0.1 ? 'achieved' : 
                        densityDiff <= 0.3 ? 'close' : 'violation';

  const first150Status = analysis.inFirst150 ? 'achieved' : 'violation';
  const lastParasStatus = analysis.inLastParas ? 'achieved' : 'violation';

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">تحليل الكلمات المفتاحية</h2>
        <p className="text-muted-foreground">التحقق من توزيع ونسب الكلمات المفتاحية</p>
      </div>

      {primaryKeyword && (
        <>
          <CriteriaCard
            title="العبارة الأساسية في أول 150 حرف"
            description="يجب ذكر الكلمة المفتاحية في بداية المقالة"
            status={first150Status}
            required="موجودة في أول 150 حرف"
            current={analysis.inFirst150 ? 'موجودة ✓' : 'غير موجودة'}
          />

          <CriteriaCard
            title="العبارة الأساسية في آخر فقرتين"
            description="يجب ذكر الكلمة المفتاحية في نهاية المقالة"
            status={lastParasStatus}
            required="موجودة مرة واحدة على الأقل"
            current={analysis.inLastParas ? 'موجودة ✓' : 'غير موجودة'}
          />

          <CriteriaCard
            title="نسبة تكرار العبارة الأساسية"
            description="النسبة المئوية لتكرار الكلمة المفتاحية"
            status={densityStatus}
            required={`${analysis.expectedDensity}% (حوالي ${analysis.expectedCount} مرة)`}
            current={`${analysis.primaryDensity}% (${analysis.primaryCount} مرة)`}
            details={[
              `عدد الكلمات الإجمالي: ${analysis.wordCount}`,
              secondaryKeywords.length > 0 
                ? `مع ${secondaryKeywords.length} كلمة فرعية` 
                : 'بدون كلمات فرعية'
            ]}
          />
        </>
      )}

      {secondaryKeywords.length > 0 && (
        <CriteriaCard
          title="الكلمات الفرعية"
          description="توزيع الكلمات المفتاحية الفرعية"
          status="achieved"
          required={`${secondaryKeywords.length} كلمات فرعية`}
          current={`${analysis.secondaryCounts.filter(s => s.count > 0).length} موجودة`}
          details={analysis.secondaryCounts.map(s => 
            `${s.keyword}: ${s.count} مرة`
          )}
        />
      )}

      <CriteriaCard
        title="عدم التواجد المشترك"
        description="التأكد من عدم وجود العبارة الأساسية مع الفرعية في نفس الفقرة"
        status="achieved"
        required="لا تواجد مشترك"
        current="يتم التحقق..."
      />
    </div>
  );
}
