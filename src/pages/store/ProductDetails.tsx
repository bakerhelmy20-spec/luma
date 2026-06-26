import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Truck, Calendar, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../constants/mockData';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const isRtl = i18n.language === 'ar';

  const [product, setProduct] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('default');

  // Review Form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([
    { id: 1, name: isRtl ? 'سارة أ.' : 'Sarah A.', rating: 5, comment: isRtl ? 'المنتج مذهل وتفاصيل الصنع غاية في الدقة والرقي! واللافندر رائحته قوية وهادئة.' : 'The lavender candle smells amazing and the ceramic holder is absolutely gorgeous!' },
    { id: 2, name: isRtl ? 'محمد خالد' : 'Mohamed K.', rating: 4, comment: isRtl ? 'صناعة ممتازة ولكن التوصيل استغرق يومين إضافيين بسبب ظروف الشحن. التغليف رائع.' : 'Outstanding quality. Packing was elegant, though shipping took 2 days longer.' }
  ]);

  useEffect(() => {
    const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (found) {
      setProduct(found);
      setSelectedImage(found.image_url);
    } else {
      setProduct(null);
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 gap-4 h-96">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="font-serif text-xl font-bold">{isRtl ? 'عذراً، لم يتم العثور على المنتج' : 'Product Not Found'}</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
          {t('back_to_shop')}
        </Button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setAdding(true);
    // Mimic slight network latency
    setTimeout(async () => {
      const variantObj = selectedVariant !== 'default' ? {
        title_ar: isRtl ? 'حجم قياسي' : 'Standard Size',
        title_en: 'Standard Size',
        price_override: undefined
      } : undefined;

      await addToCart(
        product.id,
        quantity,
        selectedVariant !== 'default' ? selectedVariant : undefined,
        product,
        variantObj
      );
      setAdding(false);
    }, 450);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewComment.trim()) {
      const newRev = {
        id: Date.now(),
        name: isRtl ? 'مشتري متحقق' : 'Verified Buyer',
        rating: reviewRating,
        comment: reviewComment.trim()
      };
      setReviews(prev => [newRev, ...prev]);
      setReviewComment('');
      setReviewRating(5);
    }
  };

  // Recommendations: Other products from the same category
  const recommendations = MOCK_PRODUCTS.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 3);

  return (
    <div className="flex flex-col gap-16 animate-fade-in font-sans">
      
      {/* Back Button */}
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs text-brand-brown/70 hover:text-brand-olive cursor-pointer font-bold uppercase tracking-wider">
          <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          {isRtl ? 'العودة' : 'Back'}
        </button>
      </div>

      {/* Main product showcase sheet */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-brand-sand/10 border border-brand-sand/20">
            <img src={selectedImage} alt={isRtl ? product.name_ar : product.name_en} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex gap-4 overflow-x-auto py-1">
            {product.images.map((imgUrl: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`h-20 w-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedImage === imgUrl ? 'border-brand-olive scale-95' : 'border-brand-sand/30 hover:border-brand-sand'}`}
              >
                <img src={imgUrl} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 border-b border-brand-sand/20 pb-5">
            <div className="flex items-center justify-between">
              <Badge variant="primary">{isRtl ? 'منتج يدوي أصيل' : 'Artisan Craft'}</Badge>
              <span className="text-[10px] text-brand-gray font-semibold tracking-wider uppercase font-sans">{product.sku}</span>
            </div>
            
            <h1 className="font-serif text-2xl md:text-3.5xl font-bold text-brand-brown dark:text-brand-sand mt-1">
              {isRtl ? product.name_ar : product.name_en}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= Math.round(product.rating) ? 'fill-current' : 'text-brand-sand'}`} />
                ))}
              </div>
              <span className="text-xs text-brand-gray">({product.rating} / 5)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-brand-olive">{product.price.toFixed(2)} ر.س</span>
            {product.compare_at_price && (
              <span className="text-sm text-brand-gray line-through">{product.compare_at_price.toFixed(2)} ر.س</span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-brand-gray leading-relaxed font-sans">
            {isRtl ? product.description_ar : product.description_en}
          </p>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-4 bg-brand-sand/25 dark:bg-zinc-900/40 p-4 border border-brand-sand/15 rounded-xl text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-brown/60 dark:text-brand-sand/60">{t('handmade_time')}</span>
              <span className="font-semibold text-brand-brown dark:text-brand-sand flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-brand-olive" />
                {product.handmade_time_days} {t('days')}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-brown/60 dark:text-brand-sand/60">{t('dimensions')}</span>
              <span className="font-semibold text-brand-brown dark:text-brand-sand">{isRtl ? product.dimensions_ar : product.dimensions_en}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-brown/60 dark:text-brand-sand/60">{t('weight')}</span>
              <span className="font-semibold text-brand-brown dark:text-brand-sand">{product.weight_kg} كجم</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-brown/60 dark:text-brand-sand/60">{t('materials')}</span>
              <span className="font-semibold text-brand-brown dark:text-brand-sand line-clamp-1">{product.materials.join('، ')}</span>
            </div>
          </div>

          {/* Selection Controls */}
          {product.stock > 0 ? (
            <div className="flex flex-col gap-4 border-t border-brand-sand/20 pt-5">
              
              {/* Optional Variants */}
              {product.category_slug === 'textiles' && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-brand-brown/80 tracking-wide uppercase">{isRtl ? 'المقاس' : 'Size'}</span>
                  <div className="flex gap-2">
                    {['standard', 'large'].map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-all cursor-pointer ${selectedVariant === variant ? 'bg-brand-olive border-brand-olive text-brand-cream' : 'border-brand-sand bg-white text-brand-brown hover:bg-brand-sand/20'}`}
                      >
                        {variant === 'standard' ? (isRtl ? 'قياسي 45 * 45 سم' : 'Standard 45x45 cm') : (isRtl ? 'كبير 60 * 60 سم (+15 ر.س)' : 'Large 60x60 cm (+$15)')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-brand-brown/80 tracking-wide uppercase">{isRtl ? 'الكمية' : 'Qty'}</span>
                  <div className="flex items-center border border-brand-sand/50 bg-white rounded-md h-10 w-24">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-brand-sand/15 cursor-pointer">-</button>
                    <span className="flex-grow text-center font-sans font-bold text-sm select-none">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 hover:bg-brand-sand/15 cursor-pointer">+</button>
                  </div>
                </div>
                
                {/* Submit */}
                <div className="flex-grow flex flex-col gap-1">
                  <span className="invisible text-xs">btn</span>
                  <Button
                    variant="primary"
                    isLoading={adding}
                    className="w-full h-10 font-sans font-bold uppercase tracking-wider text-xs gap-2"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {t('add_to_cart')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-xs flex items-center gap-2 mt-4">
              <AlertCircle className="h-4 w-4" />
              <span>{isRtl ? 'هذا المنتج غير متوفر حالياً بالمخزون. يمكنك التسجيل لإشعارك عند توفره.' : 'Currently out of stock. Leave your email to get notified when back.'}</span>
            </div>
          )}

          {/* Delivery Note */}
          <div className="flex gap-3 text-xs text-brand-gray font-sans border-t border-brand-sand/20 pt-5">
            <Truck className="h-5 w-5 text-brand-olive shrink-0" />
            <p className="leading-relaxed">
              {isRtl 
                ? 'تجهيز يدوي فاخر: يستغرق العمل على طلبك من 1 إلى 5 أيام عمل، ويتم الشحن مع أفضل شركات الخدمات اللوجستية للمحافظة على سلامة قطعك الفريدة.' 
                : 'Free worldwide delivery on orders over $200. Please note that handmade items take crafting times before shipping.'}
            </p>
          </div>
        </div>
      </section>

      {/* Reviews & Commentary Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-brand-sand/35 dark:border-zinc-800 pt-12">
        <div className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-bold text-brand-brown dark:text-brand-sand">
            {isRtl ? 'آراء الحاصلين على المنتج' : 'Collector Reviews'}
          </h2>
          
          {/* Write review */}
          <form onSubmit={handleAddReview} className="flex flex-col gap-4 bg-brand-sand/15 dark:bg-zinc-900/30 p-5 rounded-2xl border border-brand-sand/10">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-brown">{isRtl ? 'اكتب تقييمك' : 'Write a Review'}</h3>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-brand-gray">{isRtl ? 'التقييم بالنجوم' : 'Rating'}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`p-1 cursor-pointer ${star <= reviewRating ? 'text-amber-500' : 'text-brand-sand'}`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-brand-gray">{isRtl ? 'التعليق' : 'Commentary'}</span>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={isRtl ? 'شارع رأيك وتجربتك الفنية مع المنتج...' : 'How is the texture, weight, and details?'}
                className="w-full text-xs"
              />
            </div>

            <Button type="submit" variant="outline" size="sm" className="w-fit font-bold uppercase text-[10px] tracking-wider">
              {isRtl ? 'إرسال التقييم' : 'Submit Review'}
            </Button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {reviews.length === 0 ? (
            <p className="text-xs text-brand-gray">{isRtl ? 'لا توجد تقييمات لهذا المنتج بعد.' : 'No reviews written yet.'}</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="flex flex-col gap-2 pb-5 border-b border-brand-sand/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-brown dark:text-brand-sand">{rev.name}</span>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-3 w-3 ${star <= rev.rating ? 'fill-current' : 'text-brand-sand'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-brand-gray leading-relaxed font-sans">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-brand-sand/35 dark:border-zinc-800 pt-12">
          <h2 className="font-serif text-xl font-bold text-brand-brown dark:text-brand-sand">{isRtl ? 'قطع فنية مكملة قد تعجبك' : 'Complementary Masterpieces'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.slug}`)}
                className="group bg-white dark:bg-zinc-900 border border-brand-sand/20 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-brand-sand hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-square overflow-hidden bg-brand-sand/15">
                  <img src={p.image_url} alt={isRtl ? p.name_ar : p.name_en} className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300" />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[9px] tracking-widest text-brand-olive font-bold uppercase">{p.category_slug}</span>
                    <h3 className="font-serif text-sm font-bold text-brand-brown line-clamp-1">{isRtl ? p.name_ar : p.name_en}</h3>
                  </div>
                  <div className="flex items-center justify-between border-t border-brand-sand/20 pt-2 text-xs font-semibold text-brand-olive">
                    <span>{p.price.toFixed(2)} ر.س</span>
                    <span className="text-[9px] tracking-wide font-sans text-brand-brown/60">{p.handmade_time_days} {t('days')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
