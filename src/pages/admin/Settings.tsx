import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Layout, Sliders } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Settings: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [saving, setSaving] = useState(false);

  // Dynamic layout sections
  const [sections, setSections] = useState([
    { id: 'sec-hero', name: isRtl ? 'البانر الترحيبي (Hero)' : 'Welcome Slider', enabled: true },
    { id: 'sec-categories', name: isRtl ? 'الأقسام المميزة' : 'Featured Categories', enabled: true },
    { id: 'sec-story', name: isRtl ? 'قصة البراند (Story)' : 'Artisan Story Highlights', enabled: true },
    { id: 'sec-featured', name: isRtl ? 'المنتجات المختارة' : 'Featured Products', enabled: true }
  ]);

  // Brand profile settings
  const [storeName, setStoreName] = useState('Luma Handmade');
  const [shippingThreshold, setShippingThreshold] = useState(200);
  const [contactEmail, setContactEmail] = useState('support@luma.com');
  const [contactPhone, setContactPhone] = useState('0512345678');

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert(isRtl ? 'تم حفظ التغييرات بنجاح!' : 'Settings updated successfully!');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div className="border-b border-brand-sand/30 pb-6">
        <h1 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand">
          {isRtl ? 'إعدادات المنصة وهيكلة الصفحة الرئيسية' : 'Platform & Storefront Configuration'}
        </h1>
        <p className="text-xs text-brand-gray mt-0.5">
          {isRtl ? 'تعديل المعاملات العامة للمتجر، تفعيل أو إيقاف أقسام الواجهة الأمامية دون تعديل الكود.' : 'Configure general brand values, threshold discounts, or toggle homepage slots.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* General parameters form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
          <h3 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand flex items-center gap-1.5 border-b border-brand-sand/20 pb-3">
            <Sliders className="h-4.5 w-4.5 text-brand-olive" />
            {isRtl ? 'المعاملات الأساسية للمتجر' : 'Core Business Rules'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم البراند التجاري"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <Input
              label="الحد الأدنى للشحن المجاني (ر.س)"
              type="number"
              value={shippingThreshold}
              onChange={(e) => setShippingThreshold(Number(e.target.value))}
            />
            <Input
              label="بريد الدعم الفني للعملاء"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              label="رقم هاتف التواصل للعلامة التجارية"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <Button type="submit" isLoading={saving} className="w-fit gap-1.5 font-bold uppercase text-xs h-10 mt-2">
            <Save className="h-4 w-4" />
            {isRtl ? 'حفظ البيانات' : 'Save General Settings'}
          </Button>
        </form>

        {/* CMS / Dynamic Layout toggle */}
        <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
          <h3 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand flex items-center gap-1.5 border-b border-brand-sand/20 pb-3">
            <Layout className="h-4.5 w-4.5 text-brand-olive" />
            {isRtl ? 'منشئ الصفحة الرئيسية الديناميكي' : 'Dynamic Homepage Builder'}
          </h3>

          <p className="text-[10px] text-brand-gray leading-relaxed mb-2">
            {isRtl ? 'قم بتعديل ظهور الأقسام وتخطيط الواجهة الأمامية لمتجرك بضغطة زر.' : 'Toggle or rearrange layout section modules live on the storefront.'}
          </p>

          <div className="flex flex-col gap-3.5">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-3 border border-brand-sand/30 rounded-lg bg-brand-cream/10">
                <span className="text-xs font-semibold text-brand-brown">{section.name}</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => toggleSection(section.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-brand-sand rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-olive/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-olive"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
