import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShoppingCart, DollarSign, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../constants/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // Sales data mock
  const salesHistory = [
    { name: isRtl ? 'السبت' : 'Sat', sales: 1200, orders: 12 },
    { name: isRtl ? 'الأحد' : 'Sun', sales: 1900, orders: 18 },
    { name: isRtl ? 'الاثنين' : 'Mon', sales: 1500, orders: 14 },
    { name: isRtl ? 'الثلاثاء' : 'Tue', sales: 2400, orders: 22 },
    { name: isRtl ? 'الأربعاء' : 'Wed', sales: 2200, orders: 20 },
    { name: isRtl ? 'الخميس' : 'Thu', sales: 3100, orders: 28 },
    { name: isRtl ? 'الجمعة' : 'Fri', sales: 4500, orders: 42 }
  ];

  const lowStockProducts = MOCK_PRODUCTS.filter((p) => p.stock <= 5);

  const stats = [
    { label: isRtl ? 'إجمالي المبيعات' : 'Sales Revenue', value: '16,800 ر.س', change: '+18.5%', icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: isRtl ? 'عدد الطلبات اليوم' : 'Total Orders', value: '156 طلب', change: '+12.4%', icon: ShoppingCart, color: 'text-brand-olive bg-brand-olive/10' },
    { label: isRtl ? 'زوار المتجر' : 'Active Visitors', value: '1,420 زائر', change: '+8.2%', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: isRtl ? 'مخزون منخفض' : 'Low Stock Alert', value: `${lowStockProducts.length} قطع`, change: isRtl ? 'تنبيه عاجل' : 'Needs Restock', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand">
          {isRtl ? 'لوحة إحصائيات المبيعات والأداء' : 'Shopify-Style Analytics Overview'}
        </h1>
        <p className="text-xs text-brand-gray mt-1">
          {isRtl ? 'متابعة حية للمبيعات اليومية، أداء المنتجات وتنبيهات المخزون.' : 'Monitor revenue spikes, visitor counters, and restock actions.'}
        </p>
      </div>

      {/* Grid Stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} hoverEffect>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-brand-brown/75 dark:text-brand-sand uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-full shrink-0 ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <span className="text-xl font-bold text-brand-brown dark:text-brand-sand font-sans">
                  {stat.value}
                </span>
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-brand-brown">{isRtl ? 'إيرادات المبيعات الأسبوعية' : 'Weekly Sales Volume'}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                <XAxis dataKey="name" stroke="#9E9E9E" fontSize={11} />
                <YAxis stroke="#9E9E9E" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#556B2F" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Count Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-brand-brown">{isRtl ? 'تعداد الطلبات اليومي' : 'Daily Orders Counter'}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE6" />
                <XAxis dataKey="name" stroke="#9E9E9E" fontSize={11} />
                <YAxis stroke="#9E9E9E" fontSize={11} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3B4D28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Warnings & Alerts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Low Stock Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-brand-brown">{isRtl ? 'تنبيهات انخفاض مخزون المنتجات' : 'Low Inventory Stock Alerts'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-brand-gray">{isRtl ? 'كل المنتجات بمستويات مخزون آمنة.' : 'All stock levels healthy.'}</p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b border-brand-sand/15 pb-2 text-xs">
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-brand-brown">{isRtl ? p.name_ar : p.name_en}</span>
                    <span className="text-[10px] text-brand-gray">SKU: {p.sku}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={p.stock === 0 ? 'danger' : 'warning'}>
                      {p.stock === 0 ? (isRtl ? 'نفذ المخزون' : 'Out of Stock') : (isRtl ? `${p.stock} متبقية` : `${p.stock} left`)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick settings status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-brand-brown">{isRtl ? 'نشاط المتجر السريع' : 'Store Audit Timeline'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs font-sans">
            <div className="border-l-2 border-brand-olive pl-3 flex flex-col gap-0.5">
              <span className="font-semibold text-brand-brown">{isRtl ? 'إنشاء كوبون خصم جديد' : 'New Coupon Added'}</span>
              <span className="text-[10px] text-brand-gray">LUMA15 - 15% discount</span>
            </div>
            <div className="border-l-2 border-brand-olive pl-3 flex flex-col gap-0.5">
              <span className="font-semibold text-brand-brown">{isRtl ? 'طلب جديد رقم ORD-928172' : 'New Order Created'}</span>
              <span className="text-[10px] text-brand-gray">ORD-928172 - value 155.00 ر.س</span>
            </div>
            <div className="border-l-2 border-brand-gray pl-3 flex flex-col gap-0.5">
              <span className="font-semibold text-brand-gray">{isRtl ? 'تحديث إعدادات الشحن' : 'Shipping Rule Updated'}</span>
              <span className="text-[10px] text-brand-gray">Free threshold set to 200 ر.س</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
