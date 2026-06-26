import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabaseClient';

export interface CartItem {
  id: string; // database cart_item uuid or local random id
  product_id: string;
  variant_id?: string;
  quantity: number;
  product: {
    name_ar: string;
    name_en: string;
    price: number;
    compare_at_price?: number;
    image_url: string;
    sku: string;
    handmade_time_days: number;
  };
  variant?: {
    title_ar: string;
    title_en: string;
    price_override?: number;
  };
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_purchase: number;
  max_discount?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  coupon: Coupon | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number, variantId?: string, productData?: any, variantData?: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  getTotals: () => {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbCartId, setDbCartId] = useState<string | null>(null);

  // Load cart initially
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        try {
          const supabase = getSupabase();
          // Find or create cart in Supabase
          let { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('profile_id', user.id)
            .maybeSingle();

          if (!cart) {
            const { data: newCart, error: createError } = await supabase
              .from('carts')
              .insert({ profile_id: user.id })
              .select('id')
              .single();
            
            if (createError) throw createError;
            cart = newCart;
          }

          if (cart) {
            setDbCartId(cart.id);
            // Fetch items
            const { data: items, error } = await supabase
              .from('cart_items')
              .select(`
                id,
                product_id,
                variant_id,
                quantity,
                products (
                  name_ar,
                  name_en,
                  price,
                  compare_at_price,
                  sku,
                  handmade_time_days,
                  product_images (image_url, is_primary)
                ),
                product_variants (
                  title_ar,
                  title_en,
                  price_override
                )
              `)
              .eq('cart_id', cart.id);

            if (error) throw error;

            if (items) {
              const formattedItems: CartItem[] = items.map((item: any) => {
                const primaryImageObj = item.products.product_images?.find((img: any) => img.is_primary) 
                  || item.products.product_images?.[0];
                return {
                  id: item.id,
                  product_id: item.product_id,
                  variant_id: item.variant_id || undefined,
                  quantity: item.quantity,
                  product: {
                    name_ar: item.products.name_ar,
                    name_en: item.products.name_en,
                    price: Number(item.products.price),
                    compare_at_price: item.products.compare_at_price ? Number(item.products.compare_at_price) : undefined,
                    image_url: primaryImageObj?.image_url || '/placeholder.jpg',
                    sku: item.products.sku,
                    handmade_time_days: item.products.handmade_time_days
                  },
                  variant: item.product_variants ? {
                    title_ar: item.product_variants.title_ar,
                    title_en: item.product_variants.title_en,
                    price_override: item.product_variants.price_override ? Number(item.product_variants.price_override) : undefined
                  } : undefined
                };
              });
              setCartItems(formattedItems);
            }
          }
        } catch (err) {
          console.error('Error loading DB cart:', err);
        }
      } else {
        // Load guest cart from local storage
        const localData = localStorage.getItem('guest_cart');
        if (localData) {
          try {
            setCartItems(JSON.parse(localData));
          } catch (e) {
            localStorage.removeItem('guest_cart');
          }
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Save guest cart to localStorage when it changes
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user, loading]);

  const addToCart = async (productId: string, quantity: number, variantId?: string, productData?: any, variantData?: any) => {
    if (user && dbCartId) {
      try {
        const supabase = getSupabase();
        // Check if item already exists in DB
        const query = supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', dbCartId)
          .eq('product_id', productId);
        
        if (variantId) {
          query.eq('variant_id', variantId);
        } else {
          query.is('variant_id', null);
        }

        const { data: existing } = await query.maybeSingle();

        if (existing) {
          const newQty = existing.quantity + quantity;
          await supabase
            .from('cart_items')
            .update({ quantity: newQty })
            .eq('id', existing.id);
          
          setCartItems(prev => prev.map(item => 
            item.id === existing.id ? { ...item, quantity: newQty } : item
          ));
        } else {
          const insertData: any = {
            cart_id: dbCartId,
            product_id: productId,
            quantity
          };
          if (variantId) insertData.variant_id = variantId;

          const { data: inserted, error } = await supabase
            .from('cart_items')
            .insert(insertData)
            .select()
            .single();
          
          if (error) throw error;

          // Fetch fresh details for product and variant
          const { data: pDetails } = await supabase
            .from('products')
            .select('name_ar, name_en, price, compare_at_price, sku, handmade_time_days, product_images(image_url, is_primary)')
            .eq('id', productId)
            .single();

          let vDetails = null;
          if (variantId) {
            const { data: v } = await supabase
              .from('product_variants')
              .select('title_ar, title_en, price_override')
              .eq('id', variantId)
              .single();
            vDetails = v;
          }

          if (pDetails && inserted) {
            const primaryImageObj = pDetails.product_images?.find((img: any) => img.is_primary) 
              || pDetails.product_images?.[0];
            
            const newItem: CartItem = {
              id: inserted.id,
              product_id: productId,
              variant_id: variantId,
              quantity,
              product: {
                name_ar: pDetails.name_ar,
                name_en: pDetails.name_en,
                price: Number(pDetails.price),
                compare_at_price: pDetails.compare_at_price ? Number(pDetails.compare_at_price) : undefined,
                image_url: primaryImageObj?.image_url || '/placeholder.jpg',
                sku: pDetails.sku,
                handmade_time_days: pDetails.handmade_time_days
              },
              variant: vDetails ? {
                title_ar: vDetails.title_ar,
                title_en: vDetails.title_en,
                price_override: vDetails.price_override ? Number(vDetails.price_override) : undefined
              } : undefined
            };

            setCartItems(prev => [...prev, newItem]);
          }
        }
      } catch (err) {
        console.error('Error adding to DB cart:', err);
      }
    } else {
      // Local storage cart update (Guest)
      const existingIndex = cartItems.findIndex(item => 
        item.product_id === productId && item.variant_id === variantId
      );

      if (existingIndex > -1) {
        setCartItems(prev => {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        });
      } else if (productData) {
        const newItem: CartItem = {
          id: Math.random().toString(36).substr(2, 9),
          product_id: productId,
          variant_id: variantId,
          quantity,
          product: {
            name_ar: productData.name_ar,
            name_en: productData.name_en,
            price: Number(productData.price),
            compare_at_price: productData.compare_at_price ? Number(productData.compare_at_price) : undefined,
            image_url: productData.image_url || '/placeholder.jpg',
            sku: productData.sku,
            handmade_time_days: productData.handmade_time_days || 1
          },
          variant: variantData ? {
            title_ar: variantData.title_ar,
            title_en: variantData.title_en,
            price_override: variantData.price_override ? Number(variantData.price_override) : undefined
          } : undefined
        };
        setCartItems(prev => [...prev, newItem]);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (user) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
        if (error) throw error;
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      } catch (err) {
        console.error('Error removing from DB cart:', err);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    if (user) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        if (error) throw error;
        setCartItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        ));
      } catch (err) {
        console.error('Error updating DB cart quantity:', err);
      }
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = async () => {
    if (user && dbCartId) {
      try {
        const supabase = getSupabase();
        await supabase.from('cart_items').delete().eq('cart_id', dbCartId);
      } catch (err) {
        console.error('Error clearing DB cart:', err);
      }
    }
    setCartItems([]);
    localStorage.removeItem('guest_cart');
  };

  const applyCoupon = async (code: string) => {
    try {
      const supabase = getSupabase();
      const { data: cop, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !cop) {
        return { success: false, message: 'كوبون الخصم غير صالح أو منتهي الصلاحية.' };
      }

      const now = new Date();
      if (new Date(cop.expiry_date) < now || new Date(cop.start_date) > now) {
        return { success: false, message: 'كوبون الخصم منتهي الصلاحية أو غير نشط حالياً.' };
      }

      if (cop.usage_limit && cop.usage_count >= cop.usage_limit) {
        return { success: false, message: 'لقد تم استخدام هذا الكوبون إلى الحد الأقصى.' };
      }

      setCoupon({
        id: cop.id,
        code: cop.code,
        discount_type: cop.discount_type,
        value: Number(cop.value),
        min_purchase: Number(cop.min_purchase),
        max_discount: cop.max_discount ? Number(cop.max_discount) : undefined
      });

      return { success: true, message: 'تم تطبيق الكوبون بنجاح.' };
    } catch (err) {
      return { success: false, message: 'حدث خطأ أثناء تطبيق الكوبون.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getTotals = () => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item.variant?.price_override ?? item.product.price;
      return acc + (price * item.quantity);
    }, 0);

    let discount = 0;
    if (coupon) {
      if (subtotal >= coupon.min_purchase) {
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
          }
        } else {
          discount = coupon.value;
        }
      }
    }

    // Free shipping for orders above 200, else 15 shipping cost
    const shipping = subtotal > 0 && subtotal >= 200 ? 0 : subtotal > 0 ? 15 : 0;
    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal,
      discount,
      shipping,
      total
    };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getTotals
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
