import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Search, Star, Trash2 } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

export const Shop: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRtl = i18n.language === 'ar';

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState<number>(150);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL search param
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearchQuery(urlSearch);
    
    const urlCat = searchParams.get('category');
    if (urlCat !== null) setSelectedCategory(urlCat);
  }, [searchParams]);

  // Extract all unique materials across all mock products
  const allMaterials = Array.from(
    new Set(
      MOCK_PRODUCTS.flatMap((p) => p.materials)
    )
  );

  // Filter Logic
  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    // 1. Text Search matching name, desc, SKU, tags
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      product.name_en.toLowerCase().includes(searchLower) ||
      product.name_ar.includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.tags.some(tag => tag.includes(searchLower));

    // 2. Category Filter
    const matchesCategory = selectedCategory === 'all' || product.category_slug === selectedCategory;

    // 3. Price Filter
    const matchesPrice = product.price <= priceRange;

    // 4. Material Filter
    const matchesMaterial = selectedMaterial === 'all' || product.materials.includes(selectedMaterial);

    // 5. Availability Filter
    const matchesStock = !inStockOnly || product.stock > 0;

    // 6. Rating Filter
    const matchesRating = product.rating >= minRating;

    return matchesSearch && matchesCategory && matchesPrice && matchesMaterial && matchesStock && matchesRating;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating-desc') return b.rating - a.rating;
    if (sortBy === 'time-asc') return a.handmade_time_days - b.handmade_time_days;
    return 0; // Default
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange(150);
    setSelectedMaterial('all');
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('default');
    setSearchParams({});
  };

  const handleProductClick = (slug: string) => {
    window.location.href = `/product/${slug}`;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-sand/30 pb-6 gap-4">
        <div>
          <span className="text-[10px] tracking-widest text-brand-olive font-bold uppercase">{t('shop')}</span>
          <h1 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand mt-1">
            {isRtl ? 'استكشف إبداعاتنا الفنية' : 'Browse All Creations'}
          </h1>
        </div>
        
        {/* Sort & Mobile Filters button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-2"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {isRtl ? 'تصفية المنتجات' : 'Filters'}
          </Button>

          <Select
            options={[
              { value: 'default', label: isRtl ? 'الترتيب الافتراضي' : 'Default Sorting' },
              { value: 'price-asc', label: isRtl ? 'السعر: من الأقل للأعلى' : 'Price: Low to High' },
              { value: 'price-desc', label: isRtl ? 'السعر: من الأعلى للأقل' : 'Price: High to Low' },
              { value: 'rating-desc', label: isRtl ? 'التقييم: الأعلى أولاً' : 'Highest Rated' },
              { value: 'time-asc', label: isRtl ? 'أسرع تجهيزاً' : 'Quickest to Craft' }
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-48 text-xs h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col gap-6 p-5 border border-brand-sand/35 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl h-fit">
          <div className="flex items-center justify-between border-b border-brand-sand/20 pb-3">
            <h3 className="font-serif font-bold text-brand-brown dark:text-brand-sand text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-olive" />
              {isRtl ? 'خيارات التصفية' : 'Filter Options'}
            </h3>
            <button onClick={clearFilters} className="text-[10px] text-red-500 flex items-center gap-1 hover:underline cursor-pointer">
              <Trash2 className="h-3 w-3" />
              {isRtl ? 'إعادة ضبط' : 'Reset'}
            </button>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-brand-brown/75 dark:text-brand-sand uppercase tracking-wider">{isRtl ? 'البحث' : 'Search'}</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-xs bg-brand-cream/40 dark:bg-zinc-950 border border-brand-sand/40 focus:border-brand-olive text-brand-charcoal dark:text-brand-cream"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-brand-brown/40" />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-brand-brown/75 dark:text-brand-sand uppercase tracking-wider">{t('categories')}</label>
            <div className="flex flex-col gap-1.5 text-xs text-brand-brown/80 dark:text-brand-sand/80">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-right ${isRtl ? 'text-right' : 'text-left'} py-1 px-2 rounded hover:bg-brand-sand/20 cursor-pointer ${selectedCategory === 'all' ? 'bg-brand-olive/10 text-brand-olive font-bold' : ''}`}
              >
                {isRtl ? 'جميع الأقسام' : 'All Categories'}
              </button>
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-right ${isRtl ? 'text-right' : 'text-left'} py-1 px-2 rounded hover:bg-brand-sand/20 cursor-pointer ${selectedCategory === cat.slug ? 'bg-brand-olive/10 text-brand-olive font-bold' : ''}`}
                >
                  {isRtl ? cat.name_ar : cat.name_en}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-brown/75 dark:text-brand-sand">
              <label className="uppercase tracking-wider">{isRtl ? 'أقصى سعر' : 'Max Price'}</label>
              <span>{priceRange} ر.س</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-olive h-1 bg-brand-sand rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Materials */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-brand-brown/75 dark:text-brand-sand uppercase tracking-wider">{isRtl ? 'خامات الصنع' : 'Handmade Material'}</label>
            <div className="flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => setSelectedMaterial('all')}
                className={`text-right ${isRtl ? 'text-right' : 'text-left'} py-1 px-2 rounded hover:bg-brand-sand/20 cursor-pointer ${selectedMaterial === 'all' ? 'bg-brand-olive/10 text-brand-olive font-bold' : ''}`}
              >
                {isRtl ? 'جميع المواد' : 'All Materials'}
              </button>
              {allMaterials.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`text-right ${isRtl ? 'text-right' : 'text-left'} py-1 px-2 rounded hover:bg-brand-sand/20 cursor-pointer ${selectedMaterial === mat ? 'bg-brand-olive/10 text-brand-olive font-bold' : ''}`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-brand-brown/75 dark:text-brand-sand uppercase tracking-wider">{isRtl ? 'تقييم المنتج' : 'Minimum Rating'}</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(star === minRating ? 0 : star)}
                  className={`p-1 cursor-pointer hover:text-brand-olive ${star <= minRating ? 'text-amber-500' : 'text-brand-sand'}`}
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between border-t border-brand-sand/20 pt-4">
            <label className="text-xs font-semibold text-brand-brown/75 dark:text-brand-sand uppercase tracking-wider">{isRtl ? 'متوفر بالمخزون فقط' : 'In Stock Only'}</label>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-brand-olive h-4 w-4 rounded border-brand-sand"
            />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-zinc-900 border border-brand-sand/25 rounded-xl gap-4 h-80">
              <SlidersHorizontal className="h-12 w-12 text-brand-sand/70" />
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-lg font-bold text-brand-brown dark:text-brand-sand">{isRtl ? 'لم نجد أي منتجات تطابق اختياراتك' : 'No Products Match Your Criteria'}</h3>
                <p className="text-xs text-brand-gray">{isRtl ? 'يرجى تجربة تعديل خيارات التصفية أو البحث عن كلمة أخرى.' : 'Please try broadening your searches or adjusting filters.'}</p>
              </div>
              <Button size="sm" onClick={clearFilters}>
                {isRtl ? 'مسح الفلاتر' : 'Clear All Filters'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.slug)}
                  className="group bg-white dark:bg-zinc-900 border border-brand-sand/25 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-sand hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-brand-sand/15">
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
                  
                  <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] tracking-widest text-brand-olive font-sans font-bold uppercase">
                        {product.category_slug}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand line-clamp-1">
                        {isRtl ? product.name_ar : product.name_en}
                      </h3>
                      <p className="text-[10px] text-brand-gray leading-relaxed font-sans line-clamp-2">
                        {isRtl ? product.description_ar : product.description_en}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-brand-sand/20 pt-3">
                      <div className="flex items-baseline gap-1.5 font-sans">
                        <span className="text-xs font-semibold text-brand-olive">{product.price.toFixed(2)} ر.س</span>
                        {product.compare_at_price && (
                          <span className="text-[10px] text-brand-gray line-through">{product.compare_at_price.toFixed(2)} ر.س</span>
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
          )}
        </div>
      </div>

      {/* Mobile Drawer Filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
          <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-brand-cream dark:bg-brand-charcoal border-r border-brand-sand/30 shadow-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-brand-sand/30 pb-4">
              <h3 className="font-serif font-bold text-sm">{isRtl ? 'خيارات التصفية' : 'Filters'}</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-xs text-brand-brown cursor-pointer font-bold uppercase">{isRtl ? 'إغلاق' : 'Close'}</button>
            </div>
            
            {/* Same Filter content as desktop sidebar */}
            <div className="flex-grow overflow-y-auto flex flex-col gap-5">
              {/* Search */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-brand-brown/80 uppercase">{isRtl ? 'البحث' : 'Search'}</label>
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-brand-sand rounded"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-brand-brown/80 uppercase">{t('categories')}</label>
                <div className="flex flex-col gap-1 text-xs">
                  <button onClick={() => { setSelectedCategory('all'); setShowMobileFilters(false); }} className={`text-right ${isRtl ? 'text-right' : 'text-left'} py-1 px-2 rounded ${selectedCategory === 'all' ? 'bg-brand-olive/10 text-brand-olive font-bold' : ''}`}>
                    {isRtl ? 'جميع الأقسام' : 'All Categories'}
                  </button>
                  {MOCK_CATEGORIES.map((cat) => (
                    <button key={cat.id} onClick={() => { setSelectedCategory(cat.slug); setShowMobileFilters(false); }} className={`text-right ${isRtl ? 'text-right' : 'text-left'} py-1 px-2 rounded ${selectedCategory === cat.slug ? 'bg-brand-olive/10 text-brand-olive font-bold' : ''}`}>
                      {isRtl ? cat.name_ar : cat.name_en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold">{isRtl ? 'أقصى سعر' : 'Max Price'}</label>
                  <span>{priceRange} ر.س</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand-olive h-1 bg-brand-sand"
                />
              </div>

              {/* In stock */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-brand-brown/80 uppercase">{isRtl ? 'متوفر بالمخزون' : 'In Stock Only'}</label>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-brand-olive"
                />
              </div>
            </div>

            <Button className="w-full font-bold uppercase tracking-wider text-xs" onClick={() => setShowMobileFilters(false)}>
              {isRtl ? 'تطبيق الفلاتر' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
