import CriteriaCard from '../CriteriaCard';

export default function CriteriaCardExample() {
  return (
    <div className="space-y-4 max-w-2xl">
      <CriteriaCard
        title="عدد الكلمات"
        description="إجمالي عدد الكلمات في المحتوى الكامل"
        status="achieved"
        required="800 كلمة على الأقل"
        current="1,245 كلمة"
      />
      
      <CriteriaCard
        title="طول الفقرات"
        description="متوسط طول الفقرات في المحتوى"
        status="close"
        required="3-5 جمل (50-70 كلمة)"
        current="7 فقرات مخالفة"
        details={[
          'الفقرة الثالثة: 85 كلمة (طويلة جداً)',
          'الفقرة الخامسة: 35 كلمة (قصيرة جداً)'
        ]}
      />
      
      <CriteriaCard
        title="العبارة الأساسية في أول 150 حرف"
        description="تأكد من وجود الكلمة المفتاحية في بداية المقالة"
        status="violation"
        required="موجودة في أول 150 حرف"
        current="غير موجودة"
      />
    </div>
  );
}
