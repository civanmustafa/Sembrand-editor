import RepeatedPhrases from '../RepeatedPhrases';

export default function RepeatedPhrasesExample() {
  const sampleContent = `تحسين محركات البحث هو عملية مهمة. تحسين محركات البحث يساعد في رفع الترتيب.
  
  معايير SEO الصحيحة ضرورية لكل موقع. معايير SEO الصحيحة تحدد نجاح المحتوى.
  
  الكلمات المفتاحية يجب أن توزع بشكل متوازن. الكلمات المفتاحية تساعد في الوصول للجمهور المستهدف.`;

  return <RepeatedPhrases content={sampleContent} />;
}
