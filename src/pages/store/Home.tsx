import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Leaf, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  const featuredProducts = MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[450px] w-full rounded-2xl overflow-hidden shadow-sm border border-brand-sand/20">
        <img
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1920"
          alt="Luma Handmade background"
          className="absolute inset-0 w-full h-full object-cover brightness-85 dark:brightness-75 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent" />
        
        {/* Caption */}
        <div className={`absolute bottom-10 ${isRtl ? 'right-6 md:right-16 text-right' : 'left-6 md:left-16 text-left'} max-w-xl flex flex-col gap-4 text-brand-cream`}>
          <div className="inline-flex items-center gap-2 bg-brand-olive/85 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            {isRtl ? 'منتجات حصرية وبطابع فريد' : '100% HANDMADE MASTERPIECES'}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight drop-shadow-md">
            {isRtl ? 'أصالة الصناعة اليدوية للمنازل العصرية' : 'Artisanal Craftsmanship for Modern Homes'}
          </h1>
          <p className="text-xs md:text-sm text-brand-cream/80 leading-relaxed font-sans max-w-md">
            {isRtl ? 'قطع فنية مصنوعة يدوياً تعكس دفء الطبيعة وشغف الصناع المبدعين بمواد صديقة للبيئة.' : 'Exquisite hand-carved details and natural materials crafted by master creators.'}
          </p>
          <div className="mt-2">
            <Button size="lg" className="font-sans font-bold tracking-wider uppercase text-xs cursor-pointer" onClick={() => navigate('/shop')}>
              {isRtl ? 'تسوق المجموعة كاملة' : 'Discover the Collection'}
              <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Values / Trust Badges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-brand-sand/35 dark:border-zinc-800">
        <div className="flex gap-4 items-start p-4">
          <div className="p-3 bg-brand-sand/50 dark:bg-zinc-900 rounded-full text-brand-olive">
            <Leaf className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand">{isRtl ? 'صديق للبيئة وطبيعي' : 'Eco-Friendly & Organic'}</h4>
            <p className="text-xs text-brand-gray leading-relaxed">{isRtl ? 'نعتمد بالكامل على مواد عضوية مثل شمع الصويا، أخشاب الزيتون المعمرة، والكتان النقي.' : 'We use purely organic ingredients like soy wax, seasoned olive wood, and premium Belgian linen.'}</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-4">
          <div className="p-3 bg-brand-sand/50 dark:bg-zinc-900 rounded-full text-brand-olive">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand">{isRtl ? 'دقة وتفاصيل متناهية' : 'Masterfully Detailed'}</h4>
            <p className="text-xs text-brand-gray leading-relaxed">{isRtl ? 'كل قطعة نقوم بحياكتها أو صبها أو نحتها تقضي ساعات طوال لتخرج بجودة مثالية ومتفردة.' : 'Each item is individually wheel-thrown, hand-poured, or hand-embroidered over hours.'}</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-4">
          <div className="p-3 bg-brand-sand/50 dark:bg-zinc-900 rounded-full text-brand-olive">
            <Heart className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand">{isRtl ? 'يدعم الحرفية المحلية' : 'Crafted with Love'}</h4>
            <p className="text-xs text-brand-gray leading-relaxed">{isRtl ? 'عملنا يربطك مباشرة بلمسة صانعها الأصلي لتعيش قصة كل منتج داخل زوايا منزلك.' : 'Every purchase supports hours of manual craft, bringing a unique soul to your space.'}</p>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] tracking-widest text-brand-olive font-sans font-bold uppercase">{t('categories')}</span>
            <h2 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand mt-1">{isRtl ? 'تصفح حسب الفئات الفنية' : 'Artisan Categories'}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop?category=${cat.slug}`)}
              className="group relative h-72 rounded-xl overflow-hidden border border-brand-sand/20 cursor-pointer shadow-xs hover:-translate-y-1 transition-all duration-300"
            >
              <img src={cat.image_url} alt={isRtl ? cat.name_ar : cat.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/70 via-brand-charcoal/20 to-transparent" />
              <div className={`absolute bottom-4 ${isRtl ? 'right-4 text-right' : 'left-4 text-left'} text-brand-cream`}>
                <h3 className="font-serif text-base font-bold">{isRtl ? cat.name_ar : cat.name_en}</h3>
                <span className="text-[10px] tracking-wider font-sans font-semibold uppercase text-brand-sand flex items-center gap-1 group-hover:text-brand-cream mt-1">
                  {isRtl ? 'اكتشف المزيد' : 'Browse Category'}
                  <ArrowRight className={`h-3 w-3 ${isRtl ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Story Highlight */}
      <section className="bg-brand-sand/30 dark:bg-zinc-900/40 border border-brand-sand/20 rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-5">
          <span className="text-[10px] tracking-widest text-brand-olive font-sans font-bold uppercase">{isRtl ? 'قصة لوما' : 'The Luma Story'}</span>
          <h2 className="font-serif text-3xl font-bold text-brand-brown dark:text-brand-sand">{isRtl ? 'الجمال يكمن في عدم الكمال' : 'Inperfectly Perfect'}</h2>
          <p className="text-xs text-brand-gray leading-relaxed font-sans">
            {isRtl 
              ? 'في عصر الإنتاج الآلي الضخم، تضيع البصمة الروحية للمنتجات. في لوما، نؤمن بأن كل التعرجات البسيطة والاختلافات الطفيفة في درجات الألوان هي التواقيع الحقيقية للحرفي على تحفته الفنية.' 
              : 'In the age of mass machine production, products lose their soul. At Luma, we believe that the subtle natural curves, ripples, and color shifts are the craftsman signature of authenticity on every item.'}
          </p>
          <p className="text-xs text-brand-gray leading-relaxed font-sans">
            {isRtl
              ? 'جميع الشموع والفخاريات والوسائد لدينا تصنع قطعة قطعة، محلياً، وبمواد تدعم استدامة الطبيعة ولا تضر ببيئتنا.'
              : 'Our candles, ceramics, and textiles are individually shaped, poured, and stitched locally, supporting sustainable materials and eco-friendly practices.'}
          </p>
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/about')}>
              {isRtl ? 'اقرأ قصتنا الكاملة' : 'Read Our Full Story'}
            </Button>
          </div>
        </div>
        <div className="h-80 rounded-xl overflow-hidden border border-brand-sand/30">
          <img
            src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800"
            alt="Handmade creation process"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Featured Masterpieces */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] tracking-widest text-brand-olive font-sans font-bold uppercase">{t('featured_products')}</span>
            <h2 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand mt-1">{isRtl ? 'قطع فنية مصنعة بشغف' : 'Featured Masterpieces'}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/shop')} className="text-brand-olive font-sans font-semibold uppercase text-xs tracking-wider gap-1 cursor-pointer">
            {isRtl ? 'عرض الكل' : 'View All'}
            <ArrowRight className={`h-3 w-3 ${isRtl ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.slug}`)}
              className="group bg-white dark:bg-zinc-900 border border-brand-sand/20 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-sand hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="relative aspect-square overflow-hidden bg-brand-sand/10">
                <img
                  src={product.image_url}
                  alt={isRtl ? product.name_ar : product.name_en}
                  className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                />
                {product.compare_at_price && (
                  <span className="absolute top-3 right-3 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[9px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase">
                    {isRtl ? 'خصم' : 'Save'}
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="absolute inset-0 bg-brand-charcoal/45 flex items-center justify-center text-brand-cream text-xs font-serif tracking-widest uppercase font-semibold">
                    {t('out_of_stock')}
                  </span>
                )}
              </div>
              
              <div className="p-5 flex-grow flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] tracking-widest text-brand-olive font-sans font-bold uppercase">
                    {product.category_slug}
                  </span>
                  <h3 className="font-serif text-base font-bold text-brand-brown dark:text-brand-sand line-clamp-1">
                    {isRtl ? product.name_ar : product.name_en}
                  </h3>
                  <p className="text-[10px] text-brand-gray font-sans line-clamp-2 leading-relaxed">
                    {isRtl ? product.description_ar : product.description_en}
                  </p>
                </div>
                
                <div className="flex items-center justify-between border-t border-brand-sand/20 pt-3">
                  <div className="flex items-baseline gap-1.5 font-sans">
                    <span className="text-sm font-semibold text-brand-olive">{product.price.toFixed(2)} ر.س</span>
                    {product.compare_at_price && (
                      <span className="text-xs text-brand-gray line-through">{product.compare_at_price.toFixed(2)} ر.س</span>
                    )}
                  </div>
                  <span className="text-[9px] tracking-wide font-sans text-brand-brown/60 dark:text-brand-sand/60">
                    {isRtl ? `تجهيز: ${product.handmade_time_days} يوم` : `${product.handmade_time_days} days craft`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
