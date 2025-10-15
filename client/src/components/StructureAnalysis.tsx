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
        headings: { h2: [], h3: [], h4: [] },
        allHeadings: []
      };
    }

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sentences = text.split(/[.!?؟]/).filter(s => s.trim().length > 0);

    const h2Headings = text.match(/^##\s+(.+)$/gm) || [];
    const h3Headings = text.match(/^###\s+(.+)$/gm) || [];
    const h4Headings = text.match(/^####\s+(.+)$/gm) || [];
    const allHeadings = text.match(/^#+\s+.+$/gm) || [];

    return { 
      wordCount, 
      paragraphs, 
      sentences, 
      headings: { 
        h2: h2Headings.map(h => h.replace(/^##\s+/, '')),
        h3: h3Headings.map(h => h.replace(/^###\s+/, '')),
        h4: h4Headings.map(h => h.replace(/^####\s+/, ''))
      },
      allHeadings 
    };
  }, [content]);

  const wordCountStatus = analysis.wordCount >= 800 ? 'achieved' : 
                         analysis.wordCount >= 600 ? 'close' : 'violation';

  const firstPara = analysis.paragraphs[0] || '';
  const firstParaWords = firstPara.split(/\s+/).length;
  const firstParaSents = firstPara.split(/[.!?؟]/).filter(s => s.trim()).length;
  const summaryStatus = (firstParaSents >= 2 && firstParaSents <= 4 && firstParaWords >= 30 && firstParaWords <= 60) 
    ? 'achieved' : 'violation';

  const secondPara = analysis.paragraphs[1] || '';
  const secondParaWords = secondPara.split(/\s+/).length;
  const secondParaSents = secondPara.split(/[.!?؟]/).filter(s => s.trim()).length;
  const secondParaStatus = (secondParaSents >= 2 && secondParaSents <= 3 && secondParaWords >= 30 && secondParaWords <= 60) 
    ? 'achieved' : 'violation';

  const violatingParagraphs = analysis.paragraphs.filter(p => {
    const words = p.split(/\s+/).length;
    const sents = p.split(/[.!?؟]/).filter(s => s.trim()).length;
    return words < 50 || words > 70 || sents < 3 || sents > 5;
  });
  const paragraphStatus = violatingParagraphs.length === 0 ? 'achieved' :
                          violatingParagraphs.length <= 2 ? 'close' : 'violation';

  const analyzeH2Sections = (): { h2Status: 'achieved' | 'violation'; violatingH2Count: number; h2Details: string[] } => {
    const h2Positions: { heading: string; start: number; end: number }[] = [];
    const h2Matches = Array.from(content.matchAll(/^##\s+(.+)$/gm));
    
    h2Matches.forEach((match, i) => {
      const start = match.index || 0;
      const end = i < h2Matches.length - 1 ? (h2Matches[i + 1].index || content.length) : content.length;
      h2Positions.push({ heading: match[1], start, end });
    });

    let violatingH2Count = 0;
    const h2Details: string[] = [];

    h2Positions.forEach(({ heading, start, end }) => {
      const section = content.substring(start, end);
      const sectionWords = section.split(/\s+/).length;
      const h3Count = (section.match(/^###\s+/gm) || []).length;

      let requiredH3 = 0;
      if (sectionWords >= 300 && sectionWords < 400) requiredH3 = 1;
      else if (sectionWords >= 400 && sectionWords < 500) requiredH3 = 2;
      else if (sectionWords >= 500 && sectionWords < 600) requiredH3 = 3;
      else if (sectionWords >= 600) requiredH3 = 4;

      if (sectionWords >= 300 && h3Count !== requiredH3) {
        violatingH2Count++;
        h2Details.push(`${sectionWords} كلمة - ${h3Count} عناوين H3`);
      }
    });

    const h2Status: 'achieved' | 'violation' = violatingH2Count === 0 && h2Positions.length > 0 ? 'achieved' : 'violation';
    return { h2Status, violatingH2Count, h2Details };
  };

  const { h2Status, violatingH2Count, h2Details } = analyzeH2Sections();

  const analyzeH3Sections = (): 'achieved' | 'violation' => {
    const h3Violations = analysis.headings.h3.filter((_, i) => {
      const h3Match = Array.from(content.matchAll(/^###\s+(.+)$/gm))[i];
      if (!h3Match) return false;
      
      const start = h3Match.index || 0;
      const nextH3Match = Array.from(content.matchAll(/^###\s+(.+)$/gm))[i + 1];
      const nextH2Match = Array.from(content.matchAll(/^##\s+(.+)$/gm)).find(m => (m.index || 0) > start);
      
      let end = content.length;
      if (nextH3Match && nextH2Match) {
        end = Math.min(nextH3Match.index || content.length, nextH2Match.index || content.length);
      } else if (nextH3Match) {
        end = nextH3Match.index || content.length;
      } else if (nextH2Match) {
        end = nextH2Match.index || content.length;
      }

      const section = content.substring(start, end);
      const paragraphs = section.split(/\n\n+/).filter(p => p.trim() && !p.trim().startsWith('#')).length;
      const words = section.split(/\s+/).length;

      return paragraphs < 1 || paragraphs > 2 || words < 60 || words > 150;
    });

    return analysis.headings.h3.length > 0 ? (h3Violations.length === 0 ? 'achieved' : 'violation') : 'achieved';
  };

  const h3Status = analyzeH3Sections();

  const analyzeH4Sections = (): 'achieved' | 'violation' => {
    const h4Violations = analysis.headings.h4.filter((_, i) => {
      const h4Match = Array.from(content.matchAll(/^####\s+(.+)$/gm))[i];
      if (!h4Match) return false;
      
      const start = h4Match.index || 0;
      const nextHeading = Array.from(content.matchAll(/^#+\s+(.+)$/gm)).find(m => (m.index || 0) > start);
      const end = nextHeading ? (nextHeading.index || content.length) : content.length;

      const section = content.substring(start, end);
      const paragraphs = section.split(/\n\n+/).filter(p => p.trim() && !p.trim().startsWith('#')).length;
      const words = section.split(/\s+/).length;

      return paragraphs !== 1 || words < 30 || words > 80;
    });

    return analysis.headings.h4.length > 0 ? (h4Violations.length === 0 ? 'achieved' : 'violation') : 'achieved';
  };

  const h4Status = analyzeH4Sections();

  const analyzeH2ToH3Gap = (): 'achieved' | 'violation' => {
    const violations: number[] = [];
    const h2Matches = Array.from(content.matchAll(/^##\s+(.+)$/gm));
    
    h2Matches.forEach((h2Match) => {
      const h2Start = h2Match.index || 0;
      const h3Match = Array.from(content.matchAll(/^###\s+(.+)$/gm)).find(m => (m.index || 0) > h2Start);
      
      if (h3Match) {
        const h3Start = h3Match.index || 0;
        const section = content.substring(h2Start, h3Start);
        const paragraphs = section.split(/\n\n+/).filter(p => p.trim() && !p.trim().startsWith('#')).length;
        const words = section.split(/\s+/).length;

        if (paragraphs < 1 || paragraphs > 2 || words < 50 || words > 140) {
          violations.push(paragraphs);
        }
      }
    });

    return h2Matches.length > 0 ? (violations.length === 0 ? 'achieved' : 'violation') : 'achieved';
  };

  const h2ToH3Status = analyzeH2ToH3Gap();

  const faqKeywords = ['أسئلة', 'الأسئلة', 'سؤال وجواب'];
  const hasFAQSection = analysis.headings.h2.some(h => 
    faqKeywords.some(kw => h.includes(kw))
  );
  const faqStatus = hasFAQSection ? 'achieved' : 'violation';

  const questionWords = ['ما', 'من', 'متى', 'أين', 'كيف', 'لماذا', 'هل', 'أليس', 'ألا', 'أم'];
  const interrogativeH2Count = analysis.headings.h2.filter(h => 
    questionWords.some(qw => h.includes(qw))
  ).length;
  const interrogativeH2Status = interrogativeH2Count >= 3 ? 'achieved' : 
                                interrogativeH2Count >= 1 ? 'close' : 'violation';

  const transitionWords = [
    'أولاً', 'ثانياً', 'ثالثاً', 'رابعاً', 'أخيراً', 'بالإضافة إلى ذلك', 'علاوة على ذلك', 
    'لذلك', 'وبالتالي', 'من ناحية أخرى', 'من جهة أخرى', 'في المقابل', 'على العكس من ذلك',
    'بالمقابل', 'أيضاً', 'كذلك', 'كما أن', 'فضلاً عن ذلك', 'زيادة على ذلك', 'إضافة إلى ما سبق',
    'بناءً على ذلك', 'نتيجة لذلك', 'من هنا', 'ومن ثم', 'إذاً', 'إذن', 'لهذا السبب', 'من أجل ذلك',
    'على سبيل المثال', 'على وجه الخصوص', 'بشكل خاص', 'بصفة عامة', 'بشكل عام', 'في الواقع',
    'في الحقيقة', 'حقيقة الأمر', 'الأمر الذي', 'مما يعني', 'وهذا يعني', 'بمعنى آخر', 'بعبارة أخرى',
    'بكلمات أخرى', 'وبناءً عليه', 'تبعاً لذلك', 'نظراً لـ', 'بسبب', 'بفضل', 'نتيجة', 'ولهذا', 'من ثم',
    'بعد ذلك', 'في البداية', 'في النهاية', 'ختاماً', 'في المقام الأول', 'في المرتبة الثانية',
    'قبل كل شيء', 'فوق كل ذلك', 'علاوة على ما سبق', 'بالإشارة إلى', 'بالرجوع إلى', 'كما ذكرنا سابقاً',
    'كما أشرنا', 'من جانب آخر', 'من زاوية أخرى', 'بالنظر إلى', 'بالاعتماد على', 'اعتماداً على',
    'وفقاً لـ', 'طبقاً لـ', 'بالفعل', 'حقاً', 'بلا شك', 'بالطبع', 'بالتأكيد', 'دون شك', 'من الواضح أن',
    'من الجدير بالذكر', 'تجدر الإشارة إلى', 'من المهم أن', 'ينبغي الإشارة إلى', 'مع ذلك',
    'بالرغم من ذلك', 'رغم ذلك', 'على الرغم من', 'برغم', 'ومع ذلك', 'لكن', 'إلا أن', 'غير أن', 'بيد أن',
    'في حين أن', 'بينما', 'في المجمل', 'إجمالاً', 'باختصار', 'بإيجاز', 'خلاصة القول', 'في الختام'
  ];
  
  const foundTransitionWords = transitionWords.filter(tw => content.includes(tw));
  const transitionWordsCount = new Set(foundTransitionWords).size;
  const transitionStatus = transitionWordsCount >= 3 ? 'achieved' : 
                          (transitionWordsCount === 2 || transitionWordsCount === 4) ? 'close' : 'violation';

  const repeatedWordsInParagraphs = analysis.paragraphs.filter(p => {
    const words = p.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();
    words.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
    return Array.from(wordCounts.values()).some(count => count > 1);
  }).length;

  const repeatedParaStatus = repeatedWordsInParagraphs <= 3 ? 'achieved' : 
                            (repeatedWordsInParagraphs <= 5) ? 'close' : 'violation';

  const headingsWithRepeatedWords = [...analysis.headings.h2, ...analysis.headings.h3, ...analysis.headings.h4]
    .filter(h => {
      const words = h.toLowerCase().split(/\s+/);
      const wordCounts = new Map<string, number>();
      words.forEach(w => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));
      return Array.from(wordCounts.values()).some(count => count > 1);
    }).length;

  const repeatedHeadingStatus = headingsWithRepeatedWords === 0 ? 'achieved' : 'violation';

  const paragraphEndings = analysis.paragraphs.filter(p => {
    const trimmed = p.trim();
    return !trimmed.match(/[.!?؟:]$/);
  }).length;

  const paragraphEndingStatus = paragraphEndings === 0 ? 'achieved' : 'violation';

  const ctaWords = [
    'ابدأ الآن', 'لا تتردد', 'لا تنتظر', 'اتخذ الخطوة الأولى', 'انطلق اليوم', 'جرّب الآن', 'سجّل الآن',
    'احجز مكانك', 'احصل على', 'اطلب الآن', 'تواصل معنا', 'اتصل بنا', 'راسلنا', 'انضم إلينا', 'انضم الآن',
    'شارك معنا', 'كن جزءاً من', 'لا تفوت الفرصة', 'اغتنم الفرصة', 'بادر الآن', 'سارع بـ', 'سارع في',
    'ابدأ رحلتك', 'ابدأ تجربتك', 'اكتشف المزيد', 'تعرّف على المزيد', 'تعلّم المزيد', 'استفد الآن',
    'احجز موعدك', 'قم بالتسجيل', 'سجل بياناتك', 'أكمل الطلب', 'أرسل طلبك', 'قدّم طلبك', 'اشترك الآن',
    'اشترك معنا', 'انتقل إلى', 'زر موقعنا', 'تصفح خدماتنا', 'اطلع على', 'اقرأ المزيد', 'شاهد المزيد',
    'حمّل التطبيق', 'نزّل التطبيق', 'جرّب مجاناً', 'ابدأ تجربتك المجانية', 'احصل على استشارة',
    'احجز استشارتك', 'تحدث معنا', 'دعنا نساعدك', 'اسمح لنا بمساعدتك', 'نحن في انتظارك',
    'ننتظر تواصلك', 'نسعد بخدمتك', 'لا تتأخر', 'المقاعد محدودة', 'العرض لفترة محدودة', 'احجز الآن',
    'سجّل اهتمامك', 'أبدِ اهتمامك', 'عبّر عن اهتمامك', 'اطلب عرضاً', 'احصل على عرض', 'تقدم بطلبك',
    'ابدأ اليوم', 'انطلق معنا', 'كن معنا'
  ];

  const hasCtaWords = ctaWords.some(cta => content.includes(cta));
  const ctaStatus = hasCtaWords ? 'achieved' : 'violation';

  const interactiveWords = [
    'تستطيع', 'يمكنك', 'ستجد', 'تحتاج', 'تريد', 'تبحث', 'تفضّل', 'تسعى', 'تهتم', 'ترغب', 'تخطط',
    'تطمح', 'تتساءل', 'تواجه', 'تملك', 'ستلاحظ', 'ستكتشف', 'ستحصل', 'ستتمكن', 'ستتعلم', 'اكتشف',
    'تعلّم', 'جرّب', 'اختر', 'استخدم', 'ابدأ', 'تابع', 'احصل', 'استفد', 'استمتع', 'تصفح', 'اقرأ',
    'شاهد', 'شارك', 'سجّل', 'انضم', 'قارن', 'راجع', 'تحقق', 'اطّلع', 'لديك', 'بإمكانك', 'في متناول يدك',
    'أمامك', 'معك', 'تحت تصرفك', 'بين يديك', 'لك الحرية في', 'من حقك', 'خاص بك', 'ستستفيد من',
    'سيساعدك على', 'سيوفر لك', 'سيمنحك', 'ستحظى بـ', 'سيضمن لك', 'سيسهّل عليك', 'سيدعمك في',
    'سيرشدك إلى', 'سيقودك نحو', 'هل تعلم', 'هل سبق لك', 'هل تساءلت', 'هل تبحث عن', 'هل جربت',
    'هل تواجه', 'هل ترغب في', 'ماذا لو', 'ماذا عنك', 'كيف يمكنك', 'دعنا نستكشف', 'معاً سنتعرف',
    'لنتعلم كيف', 'دعك من', 'اجعل', 'حان الوقت لـ', 'لا تفوّت', 'لا تتردد في', 'استعد لـ', 'كن مستعدا'
  ];

  const interactiveWordCount = interactiveWords.filter(iw => content.includes(iw)).length;
  const requiredInteractiveWords = Math.ceil(analysis.wordCount * 0.0002);
  const interactiveStatus = interactiveWordCount >= requiredInteractiveWords ? 'achieved' : 'violation';

  const conclusionKeywords = [
    'الخاتمة', 'الخلاصة', 'في النهاية', 'أخيراً', 'ختاماً', 'في الختام', 'وفي الختام', 'في الأخير',
    'وأخيراً', 'في نهاية المطاف', 'خلاصة القول', 'خلاصة الأمر', 'في المحصلة', 'في النهاية نقول',
    'نهاية القول', 'قولاً واحداً', 'إجمالاً', 'بإيجاز', 'باختصار', 'في المجمل', 'وفي الأخير',
    'وفي النهاية', 'في نهاية حديثنا', 'في ختام حديثنا', 'وختاماً نقول', 'وأخيراً نقول', 'في الأخير نؤكد',
    'ختاماً نؤكد', 'في النهاية نستنتج', 'في الختام نستخلص', 'وبهذا نكون قد', 'وبهذا نصل إلى',
    'وبهذا نختتم', 'وبهذا ننهي', 'وبهذا نختم', 'وبهذا نصل لنهاية', 'في آخر المطاف', 'في نهاية الأمر',
    'في الأخير والأهم', 'في الخلاصة', 'للتلخيص', 'كخلاصة', 'بشكل ختامي', 'كنقطة أخيرة',
    'كملاحظة أخيرة', 'في الكلمات الأخيرة', 'في السطور الأخيرة'
  ];

  const lastH2 = analysis.headings.h2[analysis.headings.h2.length - 1] || '';
  const lastH2HasConclusionWord = conclusionKeywords.some(kw => lastH2.includes(kw));
  const lastH2Status = lastH2HasConclusionWord ? 'achieved' : 'violation';

  const lastH2Index = content.lastIndexOf(`## ${lastH2}`);
  const conclusionSection = lastH2Index >= 0 ? content.substring(lastH2Index) : '';
  const conclusionFirstPara = conclusionSection.split(/\n\n+/).filter(p => p.trim() && !p.startsWith('#'))[0] || '';
  const conclusionParaHasKeyword = conclusionKeywords.some(kw => conclusionFirstPara.includes(kw));
  const conclusionParaStatus = conclusionParaHasKeyword ? 'achieved' : 'violation';

  const conclusionWords = conclusionSection.split(/\s+/).length;
  const conclusionWordsStatus = (conclusionWords >= 150 && conclusionWords <= 300) ? 'achieved' :
                                (conclusionWords >= 100 && conclusionWords <= 350) ? 'close' : 'violation';

  // Check for bullet lists in conclusion section
  const checkConclusionBulletPoints = (): { status: 'achieved' | 'violation'; listType: string } => {
    if (!conclusionSection.trim()) {
      return { status: 'violation', listType: '0' };
    }

    // Check for ordered list items at the start of lines (1., 2., etc.)
    const orderedListPattern = /^\s*\d+\.\s+/m;
    const hasOrderedList = orderedListPattern.test(conclusionSection);
    
    // Check for bullet list items at the start of lines (•, -, *)
    const bulletListPattern = /^\s*[•\-*]\s+/m;
    const hasBulletList = bulletListPattern.test(conclusionSection);
    
    if (hasOrderedList) {
      return { status: 'achieved', listType: 'قائمة مرتبة' };
    } else if (hasBulletList) {
      return { status: 'achieved', listType: 'قائمة نقطية' };
    }
    
    return { status: 'violation', listType: '0' };
  };

  const { status: bulletPointsStatus, listType: bulletPointsType } = checkConclusionBulletPoints();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">معايير الهيكل والمحتوى</h2>
        <p className="text-muted-foreground">تحليل شامل لبنية المحتوى ومطابقتها للمعايير</p>
      </div>

      <CriteriaCard
        title="الكلمات"
        description="إجمالي عدد الكلمات في المحتوى الكامل"
        status={wordCountStatus}
        required="أكثر من 800"
        current={`${analysis.wordCount}`}
      />

      <CriteriaCard
        title="الفقرة التلخيصية"
        description="الفقرة الأولى في المحتوى التي تلخص الموضوع (2-4 جمل، 30-60 كلمة)"
        status={summaryStatus}
        required="2-4 جمل (30-60 كلمة)"
        current={`${firstParaSents} جمل، ${firstParaWords} كلمة`}
      />

      <CriteriaCard
        title="الفقرة الثانية"
        description="الفقرة التي تلي الفقرة التلخيصية مباشرة (2-3 جمل، 30-60 كلمة)"
        status={secondParaStatus}
        required="2-3 جمل (30-60 كلمة)"
        current={`${secondParaSents} جمل، ${secondParaWords} كلمة`}
      />

      <CriteriaCard
        title="طول الفقرات"
        description="متوسط طول الفقرات في المحتوى (3-5 جمل، 50-70 كلمة)"
        status={paragraphStatus}
        required="3-5 جمل (50-70 كلمة)"
        current={`${violatingParagraphs.length} فقرة مخالفة`}
      />

      <div className="my-6 border-t border-border pt-4">
        <h3 className="text-xl font-semibold text-foreground mb-3">📋 معايير العناوين والتسلسل</h3>
      </div>

      <CriteriaCard
        title="عنوان H2"
        description="العناوين الرئيسية من المستوى الثاني H2 في المحتوى"
        status={h2Status}
        required="تنظيم حسب عدد الكلمات"
        current={violatingH2Count > 0 ? `${violatingH2Count} عنوان مخالف` : 'جميع العناوين متوافقة'}
        details={h2Details.length > 0 ? h2Details : undefined}
      />

      <CriteriaCard
        title="عنوان H3"
        description="العناوين الفرعية من المستوى الثالث (1-2 فقرة، 60-150 كلمة)"
        status={h3Status}
        required="1-2 فقرة (60-150 كلمة)"
        current={h3Status === 'achieved' ? 'متوافق' : 'غير متوافق'}
      />

      <CriteriaCard
        title="عنوان H4"
        description="العناوين الفرعية من المستوى الرابع (1 فقرة، 30-80 كلمة)"
        status={h4Status}
        required="1 فقرة (30-80 كلمة)"
        current={h4Status === 'achieved' ? 'متوافق' : 'غير متوافق'}
      />

      <CriteriaCard
        title="بين H2-H3"
        description="مسافة المحتوى بين عنوان H2 والعنوان H3 الذي يليه (1-2 فقرة، 50-140 كلمة)"
        status={h2ToH3Status}
        required="1-2 فقرة (50-140 كلمة)"
        current={h2ToH3Status === 'achieved' ? 'متوافق' : 'غير متوافق'}
      />

      <CriteriaCard
        title="قسم H2 خاص بالأسئلة والأجوبة"
        description="معرفة هل يوجد قسم خاص للأسئلة والأجوبة في النص"
        status={faqStatus}
        required="وجود كلمات: أسئلة، الأسئلة، سؤال وجواب"
        current={hasFAQSection ? 'يوجد' : 'لا يوجد'}
      />

      <div className="my-6 border-t border-border pt-4">
        <h3 className="text-xl font-semibold text-foreground mb-3">✍️ معايير الجودة اللغوية والنحوية</h3>
      </div>

      <CriteriaCard
        title="نهايات الفقرات"
        description="كل فقرة يجب أن تنتهي بأحد العلامات (. ! ? ؟ :)"
        status={paragraphEndingStatus}
        required="جميع الفقرات تنتهي بعلامة ترقيم"
        current={paragraphEndings === 0 ? 'جميع الفقرات صحيحة' : `${paragraphEndings} فقرة بدون علامة ترقيم`}
      />

      <CriteriaCard
        title="عناوين H2 استفهامية"
        description="وجود كلمات تدل على الاستفهام والتساؤل في عناوين H2"
        status={interrogativeH2Status}
        required="3"
        current={`${interrogativeH2Count}`}
      />

      <CriteriaCard
        title="كلمات انتقالية مختلفة"
        description="الكلمات التي تربط بين الأفكار والفقرات بشكل منطقي (2-3 كلمات مختلفة)"
        status={transitionStatus}
        required="3"
        current={`${transitionWordsCount}`}
      />

      <CriteriaCard
        title="كلمات مكررة في نفس الفقرة"
        description="تكرار نفس الكلمة أكثر من مرة في الفقرة الواحدة"
        status={repeatedParaStatus}
        required="أقل من 3"
        current={`${repeatedWordsInParagraphs}`}
      />

      <CriteriaCard
        title="كلمات مكررة في نفس العنوان"
        description="تكرار نفس الكلمة أكثر من مرة في العنوان الواحد"
        status={repeatedHeadingStatus}
        required="0"
        current={`${headingsWithRepeatedWords}`}
      />

      <CriteriaCard
        title="كلمات الحث على اتخاذ إجراء"
        description="الكلمات والعبارات التي تحث القارئ على اتخاذ إجراء معين"
        status={ctaStatus}
        required="وجود كلمة واحدة على الأقل"
        current={hasCtaWords ? 'يوجد' : 'لا يوجد'}
      />

      <CriteriaCard
        title="0.02% لغة تفاعلية"
        description="النسبة المئوية من الكلمات التفاعلية في المحتوى"
        status={interactiveStatus}
        required={`${requiredInteractiveWords} كلمة على الأقل`}
        current={`${interactiveWordCount} كلمة`}
      />

      <div className="my-6 border-t border-border pt-4">
        <h3 className="text-xl font-semibold text-foreground mb-3">📝 معايير الخاتمة</h3>
      </div>

      <CriteriaCard
        title="آخر عنوان H2"
        description="آخر عنوان من المستوى الثاني H2 في المقال يجب أن يحتوي على أحد الكلمات المحددة"
        status={lastH2Status}
        required="وجود كلمة ختامية"
        current={lastH2HasConclusionWord ? conclusionKeywords.find(kw => lastH2.includes(kw)) || 'يوجد' : 'لا يوجد'}
      />

      <CriteriaCard
        title="فقرة الخاتمة"
        description="وجود خاتمة واضحة في الفقرة الخاصة بآخر عنوان H2"
        status={conclusionParaStatus}
        required="1 كلمة ختامية على الأقل"
        current={conclusionParaHasKeyword ? conclusionKeywords.find(kw => conclusionFirstPara.includes(kw)) || 'يوجد' : '0'}
      />

      <CriteriaCard
        title="عدد كلمات الخاتمة"
        description="عدد الكلمات في قسم الخاتمة والذي هو كل المحتوى بعد آخر عنوان H2 (150-300 كلمة)"
        status={conclusionWordsStatus}
        required="150-300"
        current={`${conclusionWords}`}
      />

      <CriteriaCard
        title="التعداد الآلي"
        description="وجود قوائم منظمة في الخاتمة أي بعد آخر عنوان H2 في المحتوى"
        status={bulletPointsStatus}
        required="قائمة واحدة على الأقل"
        current={bulletPointsType}
      />
    </div>
  );
}
