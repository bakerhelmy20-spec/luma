import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      brand: "LUMA Handmade",
      brand_tagline: "Authentic creations, crafted with soul and time.",
      home: "Home",
      shop: "Shop",
      about: "About Us",
      contact: "Contact",
      cart: "Cart",
      login: "Login",
      register: "Register",
      logout: "Logout",
      dashboard: "Dashboard",
      my_account: "My Account",
      search_placeholder: "Search for masterfully crafted items...",
      categories: "Categories",
      featured_products: "Featured Masterpieces",
      handmade_time: "Crafting Time",
      days: "days",
      materials: "Materials",
      dimensions: "Dimensions",
      weight: "Weight",
      add_to_cart: "Add to Cart",
      out_of_stock: "Out of Stock",
      price: "Price",
      subtotal: "Subtotal",
      shipping: "Shipping",
      discount: "Discount",
      total: "Total",
      coupon_code: "Coupon Code",
      apply: "Apply",
      checkout: "Checkout",
      cod: "Cash on Delivery",
      pay_now: "Pay Now",
      order_success: "Order Placed Successfully",
      order_number: "Order Number",
      estimated_delivery: "Estimated Delivery",
      back_to_shop: "Back to Shop",
      name: "Name",
      email: "Email",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State",
      country: "Country",
      postal_code: "Postal Code",
      place_order: "Confirm Order",
      admin_dashboard: "Admin Dashboard",
      orders: "Orders",
      products: "Products",
      coupons: "Coupons",
      customers: "Customers",
      settings: "Settings",
      sales_revenue: "Sales Revenue",
      recent_activity: "Recent Activity",
      stock_status: "Stock Level",
      low_stock: "Low Stock Alert",
      variant: "Variant",
      sku: "SKU",
      actions: "Actions",
      add_product: "Add Product",
      edit_product: "Edit Product",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      language: "Language",
      theme: "Theme"
    }
  },
  ar: {
    translation: {
      brand: "لوما للمنتجات اليدوية",
      brand_tagline: "إبداعات أصيلة، صُنعت بشغف ووقت كافٍ.",
      home: "الرئيسية",
      shop: "المتجر",
      about: "من نحن",
      contact: "اتصل بنا",
      cart: "السلة",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
      my_account: "حسابي",
      search_placeholder: "ابحث عن قطع فنية صنعت يدوياً...",
      categories: "الأقسام",
      featured_products: "قطع مميزة ومختارة",
      handmade_time: "وقت العمل اليدوي",
      days: "أيام",
      materials: "المواد المستخدمة",
      dimensions: "الأبعاد",
      weight: "الوزن",
      add_to_cart: "إضافة إلى السلة",
      out_of_stock: "نفذت الكمية",
      price: "السعر",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      discount: "الخصم",
      total: "المجموع الكلي",
      coupon_code: "كوبون الخصم",
      apply: "تطبيق",
      checkout: "إتمام الطلب",
      cod: "الدفع عند الاستلام",
      pay_now: "الدفع الآن",
      order_success: "تم تقديم الطلب بنجاح",
      order_number: "رقم الطلب",
      estimated_delivery: "التسليم المتوقع",
      back_to_shop: "العودة للمتجر",
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      address: "العنوان",
      city: "المدينة",
      state: "المحافظة / الولاية",
      country: "الدولة",
      postal_code: "الرمز البريدي",
      place_order: "تأكيد الطلب",
      admin_dashboard: "لوحة الإدارة",
      orders: "الطلبات",
      products: "المنتجات",
      coupons: "الكوبونات",
      customers: "العملاء",
      settings: "الإعدادات",
      sales_revenue: "إيرادات المبيعات",
      recent_activity: "النشاط الأخير",
      stock_status: "مستوى المخزون",
      low_stock: "تنبيه نقص المخزون",
      variant: "النوع / المقاس",
      sku: "رمز SKU",
      actions: "الإجراءات",
      add_product: "إضافة منتج",
      edit_product: "تعديل المنتج",
      delete: "حذف",
      save: "حفظ",
      cancel: "إلغاء",
      language: "اللغة",
      theme: "المظهر"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Update page direction on language change
const updatePageDir = (lng: string) => {
  const root = document.documentElement;
  root.setAttribute('lang', lng);
  if (lng === 'ar') {
    root.setAttribute('dir', 'rtl');
  } else {
    root.setAttribute('dir', 'ltr');
  }
};

i18n.on('languageChanged', (lng) => {
  updatePageDir(lng);
});

// Run initially
updatePageDir(i18n.language || 'ar');

export default i18n;
