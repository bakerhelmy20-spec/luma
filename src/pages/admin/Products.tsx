import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../constants/mockData';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Products: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form toggles
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: 0,
    compare_at_price: 0,
    sku: '',
    stock: 10,
    handmade_time_days: 2,
    dimensions_ar: 'ارتفاع 10 سم، قطر 8 سم',
    dimensions_en: '10cm Height, 8cm Diameter',
    weight_kg: 0.500,
    materials: 'شمع الصוيا, وعاء فخاري',
    image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800'
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_inventory (stock),
          product_images (image_url, is_primary)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map((p) => {
          const invObj = p.product_inventory?.[0] || p.product_inventory;
          const imgObj = p.product_images?.find((img: any) => img.is_primary) || p.product_images?.[0];
          return {
            id: p.id,
            name_ar: p.name_ar,
            name_en: p.name_en,
            description_ar: p.description_ar,
            description_en: p.description_en,
            price: Number(p.price),
            compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : undefined,
            sku: p.sku,
            stock: invObj?.stock ?? 10,
            handmade_time_days: p.handmade_time_days,
            materials: p.materials || [],
            dimensions_ar: p.dimensions_ar,
            dimensions_en: p.dimensions_en,
            weight_kg: Number(p.weight_kg),
            image_url: imgObj?.image_url || 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800',
            slug: p.slug
          };
        });
        setProducts(formatted);
      } else {
        // Fallback to mock products if DB is empty
        setProducts(MOCK_PRODUCTS);
      }
    } catch (err) {
      console.error('Error fetching Supabase products:', err);
      setProducts(MOCK_PRODUCTS); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name_ar: p.name_ar,
      name_en: p.name_en,
      description_ar: p.description_ar,
      description_en: p.description_en,
      price: p.price,
      compare_at_price: p.compare_at_price || 0,
      sku: p.sku,
      stock: p.stock,
      handmade_time_days: p.handmade_time_days,
      dimensions_ar: p.dimensions_ar || '',
      dimensions_en: p.dimensions_en || '',
      weight_kg: p.weight_kg || 0,
      materials: p.materials.join(', '),
      image_url: p.image_url
    });
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setFormData({
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price: 0,
      compare_at_price: 0,
      sku: `HM-${Math.floor(100 + Math.random() * 900)}`,
      stock: 10,
      handmade_time_days: 2,
      dimensions_ar: 'ارتفاع 10 سم، قطر 8 سم',
      dimensions_en: '10cm Height, 8cm Diameter',
      weight_kg: 0.5,
      materials: 'شمع الصويا، زيوت عطرية',
      image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800'
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug = formData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const matArray = formData.materials.split(',').map(m => m.trim());

    const itemData = {
      name_ar: formData.name_ar,
      name_en: formData.name_en,
      description_ar: formData.description_ar,
      description_en: formData.description_en,
      price: formData.price,
      compare_at_price: formData.compare_at_price > 0 ? formData.compare_at_price : null,
      sku: formData.sku,
      handmade_time_days: formData.handmade_time_days,
      dimensions_ar: formData.dimensions_ar,
      dimensions_en: formData.dimensions_en,
      weight_kg: formData.weight_kg,
      materials: matArray,
      slug
    };

    try {
      if (editingId) {
        // UPDATE (Supabase)
        const { error } = await supabase
          .from('products')
          .update(itemData)
          .eq('id', editingId);

        if (error) throw error;

        // Update inventory
        await supabase
          .from('product_inventory')
          .upsert({ product_id: editingId, stock: formData.stock }, { onConflict: 'product_id' });

        setProducts(prev => prev.map(p => 
          p.id === editingId ? { ...p, ...itemData, stock: formData.stock, materials: matArray, image_url: formData.image_url } : p
        ));
      } else {
        // INSERT (Supabase)
        const { data: newProd, error } = await supabase
          .from('products')
          .insert(itemData)
          .select('id')
          .single();

        if (error) throw error;

        if (newProd) {
          // Add inventory stock
          await supabase.from('product_inventory').insert({
            product_id: newProd.id,
            stock: formData.stock
          });

          // Add image
          await supabase.from('product_images').insert({
            product_id: newProd.id,
            image_url: formData.image_url,
            is_primary: true
          });

          setProducts(prev => [
            {
              id: newProd.id,
              ...itemData,
              stock: formData.stock,
              materials: matArray,
              image_url: formData.image_url
            },
            ...prev
          ]);
        }
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      // Fallback for mock local CRUD state
      if (editingId) {
        setProducts(prev => prev.map(p => 
          p.id === editingId ? { ...p, ...itemData, stock: formData.stock, materials: matArray, image_url: formData.image_url } : p
        ));
      } else {
        const mockNewId = `prod-${Date.now()}`;
        setProducts(prev => [
          {
            id: mockNewId,
            ...itemData,
            stock: formData.stock,
            materials: matArray,
            image_url: formData.image_url,
            rating: 5.0
          },
          ...prev
        ]);
      }
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(isRtl ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure to delete this product?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('Error deleting product from Supabase:', err);
        setProducts(prev => prev.filter(p => p.id !== id)); // Local fallback delete
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-sand/30 pb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-brown dark:text-brand-sand">
            {isRtl ? 'إدارة المنتجات المخزونة' : 'Products & Catalog Manager'}
          </h1>
          <p className="text-xs text-brand-gray mt-0.5">
            {isRtl ? 'إضافة منتجات يدوية جديدة، تعديل تفاصيل الحياكة والوزن، أو مراقبة المخزون.' : 'Add new items, modify dimensions, or update stock limits.'}
          </p>
        </div>

        <Button size="sm" className="gap-1.5 cursor-pointer" onClick={handleCreateClick}>
          <Plus className="h-4 w-4" />
          {t('add_product')}
        </Button>
      </div>

      {/* CRUD Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-zinc-900 border border-brand-sand/30 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto flex flex-col gap-6 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-brand-sand/20 pb-3">
              <h3 className="font-serif text-base font-bold text-brand-brown dark:text-brand-sand">
                {editingId ? t('edit_product') : t('add_product')}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:text-brand-olive cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <Input
                label="الاسم بالعربية"
                required
                value={formData.name_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
              />
              <Input
                label="Name (English)"
                required
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              />
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-semibold text-brand-brown/70 tracking-wide uppercase">الوصف بالعربية</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  className="w-full text-xs"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-semibold text-brand-brown/70 tracking-wide uppercase">Description (English)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  className="w-full text-xs"
                />
              </div>
              <Input
                label="السعر (ر.س)"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
              <Input
                label="السعر المقارن للخصم (ر.س)"
                type="number"
                step="0.01"
                value={formData.compare_at_price}
                onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: Number(e.target.value) }))}
              />
              <Input
                label="الرمز SKU"
                required
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              />
              <Input
                label="الكمية المتوفرة بالمخزون"
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
              />
              <Input
                label="مدة العمل اليدوي (أيام)"
                type="number"
                required
                value={formData.handmade_time_days}
                onChange={(e) => setFormData(prev => ({ ...prev, handmade_time_days: Number(e.target.value) }))}
              />
              <Input
                label="الخامات المستخدمة (مفصولة بفاصلة)"
                placeholder="مثال: شمع، زيوت، خشب"
                value={formData.materials}
                onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
              />
              <Input
                label="رابط صورة المنتج"
                required
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
              <Input
                label="الوزن (كجم)"
                type="number"
                step="0.001"
                value={formData.weight_kg}
                onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: Number(e.target.value) }))}
              />

              <div className="sm:col-span-2 flex gap-4 mt-4 justify-end">
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

      {/* Table List of Products */}
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
                  <th className="p-4">{isRtl ? 'صورة المنتج' : 'Photo'}</th>
                  <th className="p-4">{isRtl ? 'الاسم بالكامل' : 'Product Name'}</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">{isRtl ? 'السعر' : 'Price'}</th>
                  <th className="p-4">{isRtl ? 'المخزون' : 'Stock'}</th>
                  <th className="p-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/10">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-sand/5">
                    <td className="p-4">
                      <img src={p.image_url} alt={p.name_en} className="h-10 w-10 object-cover rounded" />
                    </td>
                    <td className="p-4">
                      <span className="font-serif font-bold text-brand-brown dark:text-brand-sand block">
                        {isRtl ? p.name_ar : p.name_en}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{p.sku}</td>
                    <td className="p-4 font-semibold text-brand-olive">{p.price.toFixed(2)} ر.س</td>
                    <td className="p-4">
                      <span className={`font-sans font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-brand-charcoal'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-3">
                      <button onClick={() => handleEditClick(p)} className="p-1.5 text-brand-brown/70 hover:text-brand-olive hover:bg-brand-sand/20 rounded cursor-pointer">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer">
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
