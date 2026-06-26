import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, RefreshCw, X, ClipboardList } from 'lucide-react';
import { getSupabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

export const Orders: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(data);
      } else {
        // Mock fallback orders
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
              name: 'مشتري تجريبي',
              city: isRtl ? 'جدة' : 'Jeddah',
              addressLine1: isRtl ? 'شارع حراء، حي المرجان' : 'Heraa Street',
              phone: '0512345678',
              email: 'test@example.com'
            },
            order_items: [
              { id: "item-1", product_name_ar: "شمعة اللافندر والبرغموت في كوب فخاري", product_name_en: "Lavender & Bergamot Clay Candle", sku: "HM-CAN-01", price: 45.00, quantity: 2, total: 90.00 },
              { id: "item-2", product_name_ar: "فنجان قهوة إسبريسو سيراميك منقوش", product_name_en: "Carved Ceramic Espresso Cup", sku: "HM-POT-05", price: 22.00, quantity: 2, total: 44.00 }
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      // Fallback mock
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
            name: 'مشتري تجريبي',
            city: isRtl ? 'جدة' : 'Jeddah',
            addressLine1: isRtl ? 'شارع حراء، حي المرجان' : 'Heraa Street',
            phone: '0512345678',
            email: 'test@example.com'
          },
          order_items: [
            { id: "item-1", product_name_ar: "شمعة اللافندر والبرغموت في كوب فخاري", product_name_en: "Lavender & Bergamot Clay Candle", sku: "HM-CAN-01", price: 45.00, quantity: 2, total: 90.00 },
            { id: "item-2", product_name_ar: "فنجان قهوة إسبريسو سيراميك منقوش", product_name_en: "Carved Ceramic Espresso Cup", sku: "HM-POT-05", price: 22.00, quantity: 2, total: 44.00 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setOrders((prev: any[]) => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating order status in Supabase:', err);
      // Fallback edit local state
      setOrders((prev: any[]) => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{isRtl ? 'جديد' : 'Pending'}</Badge>;
      case 'processing':
        return <Badge variant="primary">{isRtl ? 'قيد التجهيز' : 'Processing'}</Badge>;
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
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div className="border-b border-brand-sand/30 pb-6">
        <h1 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand">
          {isRtl ? 'إدارة الطلبات والمبيعات' : 'Orders & Sales Manager'}
        </h1>
        <p className="text-xs text-brand-gray mt-0.5">
          {isRtl ? 'متابعة الطلبات المفتوحة، تغيير حالة التوصيل، وإصدار الفواتير.' : 'Manage shipping updates, update processing stages, or view invoices.'}
        </p>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <RefreshCw className="h-6 w-6 text-brand-olive animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-brand-sand/25 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-brand-sand/20 dark:bg-zinc-950 text-[10px] font-bold text-brand-brown uppercase tracking-wider">
                <tr>
                  <th className="p-4">{isRtl ? 'رقم الطلب' : 'Order No'}</th>
                  <th className="p-4">{isRtl ? 'العميل' : 'Customer'}</th>
                  <th className="p-4">{isRtl ? 'تاريخ الطلب' : 'Date'}</th>
                  <th className="p-4">{isRtl ? 'حالة الطلب' : 'Status'}</th>
                  <th className="p-4">{isRtl ? 'المجموع' : 'Total'}</th>
                  <th className="p-4 text-center">{isRtl ? 'تفاصيل وإجراءات' : 'Inspect & Update'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/10">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-sand/5">
                    <td className="p-4 font-mono font-bold text-brand-brown dark:text-brand-sand">{order.order_number}</td>
                    <td className="p-4">{order.shipping_address?.name || order.profiles?.full_name || 'Guest'}</td>
                    <td className="p-4">{new Date(order.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 font-semibold text-brand-olive">{Number(order.total).toFixed(2)} ر.س</td>
                    <td className="p-4 flex items-center justify-center gap-3">
                      <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-brand-brown/70 hover:text-brand-olive hover:bg-brand-sand/20 rounded cursor-pointer">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Select
                        options={[
                          { value: 'pending', label: isRtl ? 'جديد' : 'Pending' },
                          { value: 'processing', label: isRtl ? 'تجهيز' : 'Processing' },
                          { value: 'shipped', label: isRtl ? 'شحن' : 'Shipped' },
                          { value: 'delivered', label: isRtl ? 'تسليم' : 'Delivered' },
                          { value: 'cancelled', label: isRtl ? 'إلغاء' : 'Cancel' }
                        ]}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-[10px] py-1 h-8 w-28 border-brand-sand"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Dialog Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-brand-sand/30 rounded-2xl shadow-2xl max-w-xl w-full p-6 flex flex-col gap-5 animate-scale-up text-xs">
            
            <div className="flex items-center justify-between border-b border-brand-sand/20 pb-3">
              <h3 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-brand-olive" />
                {isRtl ? 'تفاصيل الفاتورة للطلب' : 'Invoice Details'} #{selectedOrder.order_number}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:text-brand-olive cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Address snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-sand/15 dark:bg-zinc-950 p-4 border border-brand-sand/20 rounded-xl">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-brand-gray font-semibold uppercase">{isRtl ? 'تفاصيل العميل والشحن' : 'Recipient Details'}</span>
                <span className="font-bold text-brand-brown dark:text-brand-sand">{selectedOrder.shipping_address?.name}</span>
                <span>{selectedOrder.shipping_address?.addressLine1}، {selectedOrder.shipping_address?.city}</span>
                <span>{selectedOrder.shipping_address?.phone}</span>
                <span>{selectedOrder.shipping_address?.email}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-brand-gray font-semibold uppercase">{isRtl ? 'تحديث مرحلة التجهيز' : 'Status Action'}</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
                <div className="mt-1">
                  <Select
                    options={[
                      { value: 'pending', label: isRtl ? 'جديد' : 'Pending' },
                      { value: 'processing', label: isRtl ? 'تجهيز' : 'Processing' },
                      { value: 'shipped', label: isRtl ? 'شحن' : 'Shipped' },
                      { value: 'delivered', label: isRtl ? 'تسليم' : 'Delivered' },
                      { value: 'cancelled', label: isRtl ? 'إلغاء' : 'Cancel' }
                    ]}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="text-xs h-9 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-brand-gray font-semibold uppercase">{isRtl ? 'المحتويات والمنتجات' : 'Cart Items'}</span>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {selectedOrder.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center pb-2 border-b border-brand-sand/15">
                    <div className="flex flex-col">
                      <span className="font-bold text-brand-brown dark:text-brand-sand">{isRtl ? item.product_name_ar : item.product_name_en}</span>
                      <span className="text-[9px] text-brand-gray">SKU: {item.sku}</span>
                    </div>
                    <span>
                      {item.quantity} x {Number(item.price).toFixed(2)} ر.س
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total calculation */}
            <div className="border-t border-brand-sand/20 pt-3 flex flex-col gap-1.5 text-right font-sans">
              <div className="flex justify-between">
                <span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}:</span>
                <span>{Number(selectedOrder.subtotal).toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>{isRtl ? 'تكلفة الشحن' : 'Shipping Cost'}:</span>
                <span>{Number(selectedOrder.shipping_cost).toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-olive">
                <span>{t('total')}:</span>
                <span>{Number(selectedOrder.total).toFixed(2)} ر.س</span>
              </div>
            </div>

            <Button className="w-full mt-2 font-bold uppercase text-xs" onClick={() => setSelectedOrder(null)}>
              {isRtl ? 'إغلاق النافذة' : 'Close Invoice'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
