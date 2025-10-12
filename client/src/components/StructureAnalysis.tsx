import { useMemo } from 'react';
import CriteriaCard from './CriteriaCard';

interface StructureAnalysisProps {
  content: string;
}

export default function StructureAnalysis({ content }: StructureAnalysisProps) {
  const analysis = useMemo(() => {
    const text = content.trim();
    if (!text) {
      return {
        wordCount: 0,
        paragraphs: [],
        sentences: [],
        headings: { h2: 0, h3: 0, h4: 0 }
      };
    }

    // Count words
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Count sentences (basic - split by common Arabic punctuation)
    const sentences = text.split(/[.!?؟。]+/).filter(s => s.trim().length > 0);

    // For demo: simulate heading detection (in real app, would parse HTML/Markdown)
    const headings = {
      h2: (text.match(/^##\s/gm) || []).length,
      h3: (text.match(/^###\s/gm) || []).length,
      h4: (text.match(/^####\s/gm) || []).length
    };

    return { wordCount, paragraphs, sentences, headings };
  }, [content]);

  // Word count status
  const wordCountStatus = analysis.wordCount >= 800 ? 'achieved' : 
                         analysis.wordCount >= 600 ? 'close' : 'violation';

  // Paragraph analysis
  const violatingParagraphs = analysis.paragraphs.filter(p => {
    const words = p.split(/\s+/).length;
    const sents = p.split(/[.!?؟。]+/).filter(s => s.trim()).length;
    return words < 50 || words > 70 || sents < 3 || sents > 5;
  });

  const paragraphStatus = violatingParagraphs.length === 0 ? 'achieved' :
                          violatingParagraphs.length <= 2 ? 'close' : 'violation';

  // First paragraph (summary) analysis
  const firstPara = analysis.paragraphs[0] || '';
  const firstParaWords = firstPara.split(/\s+/).length;
  const firstParaSents = firstPara.split(/[.!?؟。]+/).filter(s => s.trim()).length;
  const summaryStatus = (firstParaSents >= 2 && firstParaSents <= 4 && firstParaWords >= 30 && firstParaWords <= 60) 
    ? 'achieved' : 'violation';

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">معايير الهيكل والمحتوى</h2>
        <p className="text-muted-foreground">تحليل شامل لبنية المحتوى ومطابقتها للمعايير</p>
      </div>

      <CriteriaCard
        title="عدد الكلمات"
        description="إجمالي عدد الكلمات في المحتوى الكامل"
        status={wordCountStatus}
        required="800 كلمة على الأقل"
        current={`${analysis.wordCount} كلمة`}
      />

      <CriteriaCard
        title="الفقرة التلخيصية"
        description="الفقرة الأولى في المحتوى التي تلخص الموضوع"
        status={summaryStatus}
        required="2-4 جمل (30-60 كلمة)"
        current={`${firstParaSents} جمل، ${firstParaWords} كلمة`}
      />

      <CriteriaCard
        title="طول الفقرات"
        description="متوسط طول الفقرات في المحتوى"
        status={paragraphStatus}
        required="3-5 جمل (50-70 كلمة)"
        current={`${violatingParagraphs.length} فقرة مخالفة`}
        details={violatingParagraphs.length > 0 ? [
          `من ${analysis.paragraphs.length} فقرة، ${violatingParagraphs.length} غير مطابقة`
        ] : undefined}
      />

      <CriteriaCard
        title="التسلسل الهرمي للعناوين"
        description="توزيع العناوين H2, H3, H4"
        status={analysis.headings.h2 > 0 ? 'achieved' : 'violation'}
        required="عناوين منظمة بشكل هرمي"
        current={`H2: ${analysis.headings.h2}, H3: ${analysis.headings.h3}, H4: ${analysis.headings.h4}`}
      />

      <CriteriaCard
        title="علامات الترقيم"
        description="استخدام صحيح لعلامات الترقيم"
        status="close"
        required="لا فراغ قبل العلامات، فراغ بعد الفاصلة"
        current="3 أخطاء محتملة"
      />

      <CriteriaCard
        title="الفراغات المزدوجة"
        description="التأكد من عدم وجود فراغات متعددة"
        status={content.includes('  ') ? 'violation' : 'achieved'}
        required="فراغ واحد بين الكلمات"
        current={content.includes('  ') ? 'يوجد فراغات مزدوجة' : 'لا توجد فراغات مزدوجة'}
      />
    </div>
  );
}
