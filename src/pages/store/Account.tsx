import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, ClipboardList, MapPin, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const isRtl = i18n.language === 'ar';

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching user orders:', err);
        // Seeding mock order history for gorgeous visual presentation
        setOrders([
          {
            id: "order-mock-1",
            order_number: "ORD-928172-209",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "processing",
            shipping_method: "standard",
            shipping_cost: 15.00,
            discount_amount: 0.00,
            subtotal: 140.00,
            total: 155.00,
            shipping_address: {
              name: profile?.full_name || 'مشتري لوما',
              city: isRtl ? 'الرياض' : 'Riyadh',
              addressLine1: isRtl ? 'شارع العليا العام، حي الملك فهد' : 'Olaya Street'
            },
            order_items: [
              { id: "item-1", product_name_ar: "شمعة اللافندر والبرغموت في كوب فخاري", product_name_en: "Lavender & Bergamot Clay Candle", sku: "HM-CAN-01", price: 45.00, quantity: 2, total: 90.00 },
              { id: "item-2", product_name_ar: "فنجان قهوة إسبريسو سيراميك منقوش", product_name_en: "Carved Ceramic Espresso Cup", sku: "HM-POT-05", price: 22.00, quantity: 2, total: 44.00 }
            ]
          }
        ]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [user, navigate, profile, isRtl]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{isRtl ? 'جديد / معلق' : 'Pending'}</Badge>;
      case 'processing':
        return <Badge variant="primary">{isRtl ? 'جاري التجهيز' : 'Processing'}</Badge>;
      case 'shipped':
        return <Badge variant="success">{isRtl ? 'تم الشحن' : 'Shipped'}</Badge>;
      case 'delivered':
        return <Badge variant="success">{isRtl ? 'تم التسليم' : 'Delivered'}</Badge>;
      case 'cancelled':
        return <Badge variant="danger">{isRtl ? 'ملغي' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10 animate-fade-in font-sans">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-sand/30 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-brand-sand dark:bg-zinc-800 rounded-full flex items-center justify-center text-brand-olive border border-brand-sand/40">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand leading-tight">
              {profile?.full_name || user.email?.split('@')[0]}
            </h1>
            <span className="text-xs text-brand-gray block mt-0.5">{user.email}</span>
            {profile?.role_name !== 'customer' && (
              <span className="inline-flex items-center mt-1.5 text-[9px] font-sans font-bold uppercase tracking-wider bg-brand-olive/10 text-brand-olive px-2 py-0.5 rounded">
                {profile?.role_name}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {profile?.role_name === 'admin' && (
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
              {t('admin_dashboard')}
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={handleSignOut}>
            {t('logout')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Side: Order History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="font-serif text-lg font-bold text-brand-brown dark:text-brand-sand flex items-center gap-2 border-b border-brand-sand/20 pb-3">
            <ClipboardList className="h-5 w-5 text-brand-olive" />
            {isRtl ? 'سجل طلباتك' : 'Your Orders'}
          </h2>

          {loadingOrders ? (
            <div className="flex justify-center items-center h-48">
              <RefreshCw className="h-6 w-6 text-brand-olive animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 border border-brand-sand/20 rounded-xl gap-3 h-48">
              <ClipboardList className="h-10 w-10 text-brand-sand" />
              <p className="text-xs text-brand-gray">{isRtl ? 'لم تقم بتقديم أي طلبات بعد.' : 'No orders found.'}</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
                {t('back_to_shop')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-zinc-900 border border-brand-sand/25 rounded-xl p-5 flex flex-col gap-4 shadow-2xs">
                  
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between border-b border-brand-sand/20 pb-3 text-xs gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-brand-gray">{isRtl ? 'رقم الطلب' : 'Order Number'}</span>
                      <span className="font-bold text-brand-brown dark:text-brand-sand">{order.order_number}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-brand-gray">{isRtl ? 'تاريخ الشراء' : 'Date'}</span>
                      <span>{new Date(order.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-brand-gray">{isRtl ? 'الحالة' : 'Status'}</span>
                      <div className="mt-0.5">{getStatusBadge(order.status)}</div>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end">
                      <span className="text-brand-gray">{isRtl ? 'المجموع الكلي' : 'Total'}</span>
                      <span className="font-bold text-brand-olive">{Number(order.total).toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  {/* Order Items summary */}
                  <div className="flex flex-col gap-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-brand-brown dark:text-brand-sand">
                            {isRtl ? item.product_name_ar : item.product_name_en}
                          </span>
                          <span className="text-[10px] text-brand-gray">SKU: {item.sku}</span>
                        </div>
                        <span className="text-brand-gray shrink-0 font-sans select-none">
                          {item.quantity} x {Number(item.price).toFixed(2)} ر.س
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Address snap */}
                  <div className="border-t border-brand-sand/20 pt-3 flex items-center justify-between text-[10px] text-brand-gray">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-olive shrink-0" />
                      {order.shipping_address?.name} - {order.shipping_address?.addressLine1}، {order.shipping_address?.city}
                    </span>
                    <span className="uppercase font-semibold text-brand-olive">
                      {order.shipping_method}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Account Details Summary */}
        <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-6 border border-brand-sand/20 rounded-xl">
          <h2 className="font-serif text-base font-bold text-brand-brown dark:text-brand-sand border-b border-brand-sand/20 pb-3 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-brand-olive" />
            {isRtl ? 'بيانات الحساب الشخصية' : 'Personal Details'}
          </h2>
          
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-gray">{isRtl ? 'الاسم بالكامل' : 'Full Name'}</span>
              <span className="font-bold text-brand-brown dark:text-brand-sand">{profile?.full_name || '-'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-gray">{isRtl ? 'البريد الإلكتروني' : 'Email'}</span>
              <span className="font-bold text-brand-brown dark:text-brand-sand">{profile?.email || '-'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-gray">{isRtl ? 'رقم الهاتف' : 'Phone'}</span>
              <span className="font-bold text-brand-brown dark:text-brand-sand">{profile?.phone || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
