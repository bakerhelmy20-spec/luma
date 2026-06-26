import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Percent, Plus, Trash2, X, RefreshCw } from 'lucide-react';
import { getSupabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

export const Coupons: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    value: 10,
    min_purchase: 50,
    usage_limit: 100
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setCoupons(data);
      } else {
        setCoupons([
          { id: 'c1', code: 'LUMA10', discount_type: 'percentage', value: 10, min_purchase: 50, usage_limit: 100, usage_count: 5, is_active: true, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'c2', code: 'WELCOME15', discount_type: 'fixed', value: 15, min_purchase: 100, usage_limit: 50, usage_count: 12, is_active: true, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
        ]);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setCoupons([
        { id: 'c1', code: 'LUMA10', discount_type: 'percentage', value: 10, min_purchase: 50, usage_limit: 100, usage_count: 5, is_active: true, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'c2', code: 'WELCOME15', discount_type: 'fixed', value: 15, min_purchase: 100, usage_limit: 50, usage_count: 12, is_active: true, expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days expiry

    const newCoupon = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      value: formData.value,
      min_purchase: formData.min_purchase,
      usage_limit: formData.usage_limit,
      usage_count: 0,
      is_active: true,
      start_date: now.toISOString(),
      expiry_date: expiry.toISOString()
    };

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('coupons')
        .insert(newCoupon)
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setCoupons(prev => [data, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error creating coupon:', err);
      // Local fallback
      setCoupons(prev => [{ id: `c-${Date.now()}`, ...newCoupon }, ...prev]);
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm(isRtl ? 'هل أنت متأكد من حذف هذا الكوبون؟' : 'Are you sure to delete this coupon?')) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
        setCoupons(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Error deleting coupon:', err);
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-sand/30 pb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand">
            {isRtl ? 'إدارة الكوبونات والخصومات' : 'Coupons & Discounts Manager'}
          </h1>
          <p className="text-xs text-brand-gray mt-0.5">
            {isRtl ? 'إنشاء أكواد خصم جديدة للعملاء لزيادة مبيعات المتجر.' : 'Create, activate, or deactivate discount vouchers.'}
          </p>
        </div>

        <Button size="sm" className="gap-1.5 cursor-pointer" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          {isRtl ? 'إضافة كوبون' : 'Add Coupon'}
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-brand-sand/30 rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5 animate-scale-up text-xs">
            
            <div className="flex items-center justify-between border-b border-brand-sand/20 pb-3">
              <h3 className="font-serif text-sm font-bold text-brand-brown dark:text-brand-sand flex items-center gap-1.5">
                <Percent className="h-4.5 w-4.5 text-brand-olive" />
                {isRtl ? 'إنشاء كوبون خصم جديد' : 'New Discount Coupon'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:text-brand-olive cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <Input
                label="كود الخصم (رمز الكوبون)"
                required
                placeholder="LUMA15"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
              <Select
                label="نوع الخصم"
                options={[
                  { value: 'percentage', label: isRtl ? 'نسبة مئوية (%)' : 'Percentage (%)' },
                  { value: 'fixed', label: isRtl ? 'مبلغ ثابت (ر.س)' : 'Fixed Amount (SAR)' }
                ]}
                value={formData.discount_type}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
              />
              <Input
                label="قيمة الخصم"
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
              />
              <Input
                label="الحد الأدنى لقيمة السلة لتفعيل الكوبون (ر.س)"
                type="number"
                value={formData.min_purchase}
                onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: Number(e.target.value) }))}
              />
              <Input
                label="الحد الأقصى لمرات استخدام الكوبون"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: Number(e.target.value) }))}
              />

              <div className="flex gap-4 mt-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  {t('save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
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
                  <th className="p-4">{isRtl ? 'الكود' : 'Coupon Code'}</th>
                  <th className="p-4">{isRtl ? 'نوع القيمة' : 'Type & Value'}</th>
                  <th className="p-4">{isRtl ? 'الحد الأدنى' : 'Min Purchase'}</th>
                  <th className="p-4">{isRtl ? 'الاستخدام' : 'Usage Counter'}</th>
                  <th className="p-4">{isRtl ? 'حالة الكوبون' : 'Status'}</th>
                  <th className="p-4 text-center">{isRtl ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/10">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-sand/5">
                    <td className="p-4 font-mono font-bold text-brand-brown dark:text-brand-sand uppercase">{c.code}</td>
                    <td className="p-4 font-semibold">
                      {c.discount_type === 'percentage' ? `${c.value}%` : `${c.value} ر.س`}
                    </td>
                    <td className="p-4">{c.min_purchase} ر.س</td>
                    <td className="p-4 font-sans font-medium text-brand-gray">
                      {c.usage_count} / {c.usage_limit || '∞'}
                    </td>
                    <td className="p-4">
                      <Badge variant={c.is_active ? 'success' : 'danger'}>
                        {c.is_active ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-3">
                      <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
