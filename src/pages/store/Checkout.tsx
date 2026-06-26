import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, MapPin, Truck, CreditCard, ShieldCheck, CheckCircle2, Ticket } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getSupabase } from '../../lib/supabaseClient';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { cartItems, coupon, getTotals, applyCoupon, removeCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const isRtl = i18n.language === 'ar';

  // Checkout Steps: 1: Shipping Address, 2: Shipping Method, 3: Payment, 4: Review, 5: Success
  const [step, setStep] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  // Shipping Form State
  const [addressForm, setAddressForm] = useState({
    name: user?.user_metadata?.full_name || '',
    phone: '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: isRtl ? 'المملكة العربية السعودية' : 'Saudi Arabia',
    postalCode: ''
  });

  const [shippingMethod, setShippingMethod] = useState<string>('standard');
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  
  // Finalized Order info
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  const totals = getTotals();

  if (cartItems.length === 0 && step < 5) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 gap-4 h-96">
        <ShoppingBag className="h-12 w-12 text-brand-sand" />
        <h2 className="font-serif text-lg font-bold">{isRtl ? 'سلتك فارغة حالياً' : 'Your cart is empty'}</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
          {t('back_to_shop')}
        </Button>
      </div>
    );
  }

  const handleCouponApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;

    const res = await applyCoupon(couponCode.trim());
    if (res.success) {
      setCouponSuccess(res.message);
    } else {
      setCouponError(res.message);
    }
  };

  const validateAddressForm = () => {
    const { name, phone, email, addressLine1, city, state, country } = addressForm;
    if (!name || !phone || !email || !addressLine1 || !city || !state || !country) {
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    // Validate form
    if (!validateAddressForm()) {
      setOrderError(isRtl ? 'الرجاء ملء جميع حقول العنوان' : 'Please fill all address fields');
      return;
    }

    // Clear any previous errors
    setOrderError('');
    setIsSubmitting(true);
    const orderNum = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    setPlacedOrderNumber(orderNum);

    // Save to Database if user is authenticated
    if (user) {
      try {
        const supabase = getSupabase();
        
        // Prepare order data with proper type conversion
        const orderData = {
          order_number: orderNum,
          profile_id: user.id,
          status: 'pending',
          coupon_id: coupon?.id || null,
          subtotal: Number(totals.subtotal),
          discount_amount: Number(totals.discount),
          shipping_cost: Number(totals.shipping),
          total: Number(totals.total),
          shipping_address: addressForm, // Send as object - Supabase will convert to JSONB
          shipping_method: shippingMethod
        };

        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert([orderData])
          .select('id')
          .single();

        if (orderError) {
          setOrderError(orderError.message || (isRtl ? 'خطأ في إنشاء الطلب' : 'Error creating order'));
          setIsSubmitting(false);
          return;
        }

        if (newOrder) {
          // Prepare items array
          const itemsToInsert = cartItems.map((item) => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            product_name_ar: item.product.name_ar,
            product_name_en: item.product.name_en,
            sku: item.product.sku,
            price: Number(item.variant?.price_override ?? item.product.price),
            quantity: Number(item.quantity),
            total: Number((item.variant?.price_override ?? item.product.price) * item.quantity)
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);
          
          if (itemsError) {
            console.warn('Order items insertion had issues but proceeding');
          }

          // Insert Payment Record
          await supabase.from('payments').insert({
            order_id: newOrder.id,
            method: paymentMethod,
            status: 'pending',
            amount: Number(totals.total)
          }).catch(() => {
            // Payment record is non-critical
          });
        }

        // Success - proceed to confirmation
        setTimeout(async () => {
          await clearCart();
          setIsSubmitting(false);
          setStep(5); // Success step
        }, 1200);
      } catch (err: any) {
        setOrderError(err?.message || (isRtl ? 'حدث خطأ أثناء معالجة الطلب' : 'An error occurred while processing your order'));
        setIsSubmitting(false);
      }
    } else {
      // Guest order - proceed without DB save
      setTimeout(async () => {
        await clearCart();
        setIsSubmitting(false);
        setStep(5); // Success step
      }, 1200);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10 animate-fade-in font-sans">
      
      {/* Checkout Steps Nav */}
      {step < 5 && (
        <div className="flex items-center justify-center gap-2 sm:gap-6 border-b border-brand-sand/30 pb-6 text-xs font-semibold text-brand-brown/50 uppercase tracking-wider">
          <button className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand-olive font-bold' : ''}`}>
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">{isRtl ? 'العنوان' : 'Address'}</span>
          </button>
          <span className="text-brand-sand">/</span>
          <button className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand-olive font-bold' : ''}`}>
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">{isRtl ? 'الشحن' : 'Shipping'}</span>
          </button>
          <span className="text-brand-sand">/</span>
          <button className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand-olive font-bold' : ''}`}>
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">{isRtl ? 'الدفع' : 'Payment'}</span>
          </button>
          <span className="text-brand-sand">/</span>
          <button className={`flex items-center gap-1.5 ${step >= 4 ? 'text-brand-olive font-bold' : ''}`}>
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{isRtl ? 'المراجعة' : 'Review'}</span>
          </button>
        </div>
      )}

      {step === 5 ? (
        // SUCCESS STEP
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-6 max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-brand-sand/30 rounded-2xl shadow-sm">
          <CheckCircle2 className="h-16 w-16 text-brand-olive animate-bounce" />
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl md:text-3.5xl font-bold text-brand-brown dark:text-brand-sand">{t('order_success')}</h1>
            <p className="text-xs text-brand-gray">
              {isRtl ? 'شكراً لشرائك من لوما. تم استلام طلبك بنجاح وجاري البدء في تجهيزه بكل حب وعناية.' : 'Your payment is approved. Our craftsmen started assembling your pieces.'}
            </p>
          </div>

          <div className="w-full bg-brand-sand/20 dark:bg-zinc-950 p-4 border border-brand-sand/35 rounded-xl flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-gray">{t('order_number')}:</span>
              <span className="font-bold text-brand-brown dark:text-brand-sand">{placedOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-gray">{t('estimated_delivery')}:</span>
              <span className="font-bold text-brand-olive">
                {isRtl ? 'خلال 4-7 أيام عمل' : 'Within 4-7 business days'}
              </span>
            </div>
          </div>

          <Button size="md" className="font-sans font-bold uppercase tracking-wider text-xs" onClick={() => navigate('/shop')}>
            {t('back_to_shop')}
          </Button>
        </div>
      ) : (
        // MAIN CHECKOUT CONTAINER
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Form Actions Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {step === 1 && (
              // STEP 1: ADDRESS
              <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
                <h3 className="font-serif text-lg font-bold text-brand-brown dark:text-brand-sand flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-olive" />
                  {isRtl ? 'عنوان التوصيل والشحن' : 'Delivery Address'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={isRtl ? 'الاسم بالكامل' : 'Full Name'}
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    label={isRtl ? 'رقم الجوال' : 'Phone'}
                    required
                    placeholder="05xxxxxxx"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    label={isRtl ? 'البريد الإلكتروني' : 'Email'}
                    type="email"
                    required
                    value={addressForm.email}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    label={isRtl ? 'العنوان (الشارع / الحي)' : 'Street Address'}
                    required
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                  />
                  <Input
                    label={isRtl ? 'المدينة' : 'City'}
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    label={isRtl ? 'المحافظة / الولاية' : 'State / Province'}
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                  />
                  <Input
                    label={isRtl ? 'الرمز البريدي (اختياري)' : 'Postal Code'}
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  />
                  <Input
                    label={isRtl ? 'الدولة' : 'Country'}
                    disabled
                    value={addressForm.country}
                  />
                </div>

                <Button
                  className="mt-4 font-sans font-bold uppercase text-xs w-fit align-end cursor-pointer"
                  disabled={!validateAddressForm()}
                  onClick={() => setStep(2)}
                >
                  {isRtl ? 'المتابعة للشحن' : 'Continue to Shipping'}
                </Button>
              </div>
            )}

            {step === 2 && (
              // STEP 2: SHIPPING METHODS
              <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
                <h3 className="font-serif text-lg font-bold text-brand-brown dark:text-brand-sand flex items-center gap-2">
                  <Truck className="h-5 w-5 text-brand-olive" />
                  {isRtl ? 'طريقة الشحن والتوصيل' : 'Shipping Method'}
                </h3>

                <div className="flex flex-col gap-4">
                  <label className="flex items-center justify-between p-4 border border-brand-sand rounded-xl bg-brand-cream/15 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="accent-brand-olive h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-brown">{isRtl ? 'توصيل قياسي يدوي' : 'Standard Artisan Delivery'}</span>
                        <span className="text-[10px] text-brand-gray">{isRtl ? 'توصيل آمن للمحافظة على الفخاريات والمنسوجات خلال 4-7 أيام عمل' : 'Safe shipping in 4-7 business days'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-olive">15.00 ر.س</span>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 border border-brand-sand rounded-xl bg-brand-cream/15 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="accent-brand-olive h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-brown">{isRtl ? 'توصيل سريع' : 'Express Delivery'}</span>
                        <span className="text-[10px] text-brand-gray">{isRtl ? 'توصيل مستعجل خلال 2-3 أيام عمل' : 'Fast shipping in 2-3 business days'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-olive">35.00 ر.س</span>
                  </label>
                </div>

                <div className="flex gap-4 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    {isRtl ? 'السابق' : 'Back'}
                  </Button>
                  <Button onClick={() => setStep(3)} className="font-sans font-bold uppercase text-xs cursor-pointer">
                    {isRtl ? 'المتابعة للدفع' : 'Continue to Payment'}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              // STEP 3: PAYMENTS
              <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
                <h3 className="font-serif text-lg font-bold text-brand-brown dark:text-brand-sand flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-olive" />
                  {isRtl ? 'طريقة الدفع' : 'Payment Choice'}
                </h3>

                <div className="flex flex-col gap-4">
                  <label className="flex items-center justify-between p-4 border border-brand-sand rounded-xl bg-brand-cream/15 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-brand-olive h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-brown">{t('cod')}</span>
                        <span className="text-[10px] text-brand-gray">{isRtl ? 'الدفع نقداً أو بالبطاقة لشركة الشحن عند تسليم طلبك' : 'Pay when you receive the package'}</span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 border border-brand-sand/30 rounded-xl bg-brand-cream/5 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        disabled
                        className="h-4 w-4"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-brown">{isRtl ? 'الدفع عبر البطاقة الائتمانية (قريباً)' : 'Credit Card (Coming Soon)'}</span>
                        <span className="text-[10px] text-brand-gray">Stripe / Paymob</span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                    {isRtl ? 'السابق' : 'Back'}
                  </Button>
                  <Button onClick={() => setStep(4)} className="font-sans font-bold uppercase text-xs cursor-pointer">
                    {isRtl ? 'مراجعة الطلب' : 'Review Order'}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              // STEP 4: REVIEW
              <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
                <h3 className="font-serif text-lg font-bold text-brand-brown dark:text-brand-sand flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-olive" />
                  {isRtl ? 'مراجعة وتأكيد طلبك' : 'Review & Confirm Order'}
                </h3>

                {orderError && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                    {orderError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-brand-sand/20 pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-brand-gray">{isRtl ? 'عنوان التوصيل' : 'Shipping Address'}:</span>
                    <span className="font-bold text-brand-brown dark:text-brand-sand">{addressForm.name}</span>
                    <span className="text-brand-brown/85 dark:text-brand-sand/85">{addressForm.addressLine1}، {addressForm.city}، {addressForm.state}</span>
                    <span>{addressForm.phone}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div>
                      <span className="text-brand-gray">{isRtl ? 'طريقة الشحن' : 'Shipping Method'}:</span>
                      <span className="font-bold text-brand-brown dark:text-brand-sand block">
                        {shippingMethod === 'standard' ? (isRtl ? 'توصيل قياسي (15 ر.س)' : 'Standard Delivery ($15)') : (isRtl ? 'توصيل سريع (35 ر.س)' : 'Express Delivery ($35)')}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-gray">{isRtl ? 'طريقة الدفع' : 'Payment Choice'}:</span>
                      <span className="font-bold text-brand-olive block uppercase">{paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                    {isRtl ? 'السابق' : 'Back'}
                  </Button>
                  <Button
                    isLoading={isSubmitting}
                    onClick={handlePlaceOrder}
                    className="font-sans font-bold uppercase text-xs flex-grow cursor-pointer"
                  >
                    {t('place_order')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Sidebar Column */}
          <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
            <h3 className="font-serif text-base font-bold text-brand-brown dark:text-brand-sand border-b border-brand-sand/20 pb-3">
              {isRtl ? 'ملخص الفاتورة' : 'Order Summary'}
            </h3>

            {/* Cart Items list */}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-52 pr-1.5">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img src={item.product.image_url} alt={isRtl ? item.product.name_ar : item.product.name_en} className="h-10 w-10 object-cover rounded" />
                  <div className="flex-grow">
                    <span className="font-serif font-bold line-clamp-1">{isRtl ? item.product.name_ar : item.product.name_en}</span>
                    <span className="text-[10px] text-brand-gray">
                      x {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-brand-brown dark:text-brand-sand shrink-0">
                    {((item.variant?.price_override ?? item.product.price) * item.quantity).toFixed(2)} ر.س
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Application Form */}
            <form onSubmit={handleCouponApply} className="flex flex-col gap-2 border-t border-brand-sand/20 pt-4">
              <label className="text-[10px] font-semibold text-brand-brown/75 dark:text-brand-sand uppercase tracking-wider flex items-center gap-1">
                <Ticket className="h-3.5 w-3.5 text-brand-olive" />
                {t('coupon_code')}
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isRtl ? 'مثال: LUMA10' : 'e.g. LUMA10'}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow px-2 py-1 text-xs border border-brand-sand uppercase"
                />
                <Button type="submit" variant="secondary" className="px-3 h-8 text-[10px] tracking-wide font-bold">
                  {t('apply')}
                </Button>
              </div>
              
              {couponError && <span className="text-[10px] text-red-500">{couponError}</span>}
              {couponSuccess && <span className="text-[10px] text-green-600">{couponSuccess}</span>}

              {coupon && (
                <div className="flex items-center justify-between bg-brand-olive/10 text-brand-olive p-2 rounded text-[10px]">
                  <span>{isRtl ? `نشط: خصم بقيمة ${coupon.value}${coupon.discount_type === 'percentage' ? '%' : ' ر.س'}` : `Active: -${coupon.value}`}</span>
                  <button type="button" onClick={removeCoupon} className="text-red-500 font-bold hover:underline cursor-pointer">
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              )}
            </form>

            {/* Calculations */}
            <div className="border-t border-brand-sand/20 pt-4 flex flex-col gap-2.5 text-xs text-brand-brown/85 dark:text-brand-sand/85">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span>{totals.subtotal.toFixed(2)} ر.س</span>
              </div>
              
              {totals.discount > 0 && (
                <div className="flex justify-between text-red-500 font-semibold">
                  <span>{t('discount')}</span>
                  <span>- {totals.discount.toFixed(2)} ر.س</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>{t('shipping')}</span>
                <span>
                  {totals.shipping === 0 ? (isRtl ? 'شحن مجاني' : 'Free Shipping') : `${totals.shipping.toFixed(2)} ر.س`}
                </span>
              </div>
              
              <div className="flex justify-between text-sm font-bold border-t border-brand-sand/20 pt-2 text-brand-olive">
                <span>{t('total')}</span>
                <span>{totals.total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
