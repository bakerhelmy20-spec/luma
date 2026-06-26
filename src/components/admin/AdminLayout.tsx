import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, Package, ShoppingCart, Percent, Settings, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const isRtl = i18n.language === 'ar';

  const menuItems = [
    { path: '/admin', label: isRtl ? 'لوحة التحكم' : 'Dashboard', icon: BarChart3 },
    { path: '/admin/products', label: isRtl ? 'إدارة المنتجات' : 'Products Manager', icon: Package },
    { path: '/admin/orders', label: isRtl ? 'الطلبات والمبيعات' : 'Orders Manager', icon: ShoppingCart },
    { path: '/admin/coupons', label: isRtl ? 'كوبونات الخصم' : 'Coupons Editor', icon: Percent },
    { path: '/admin/settings', label: isRtl ? 'الإعدادات' : 'Site Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex bg-brand-sand/15 text-brand-charcoal dark:bg-zinc-950 dark:text-brand-cream font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-${isRtl ? 'l' : 'r'} border-brand-sand/30 shrink-0 p-6 gap-8`}>
        
        {/* Brand */}
        <div className="flex flex-col select-none border-b border-brand-sand/20 pb-4">
          <span className="font-serif text-2xl font-bold tracking-widest text-brand-brown dark:text-brand-sand">LUMA</span>
          <span className="text-[9px] tracking-[0.25em] text-brand-olive uppercase leading-none font-bold">ADMIN PANEL</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-brand-sand/20 dark:bg-zinc-950 border border-brand-sand/30 rounded-xl">
          <div className="h-10 w-10 bg-brand-olive/10 text-brand-olive rounded-full flex items-center justify-center font-bold">
            {profile?.full_name?.[0] || 'A'}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-brand-brown dark:text-brand-sand truncate">{profile?.full_name}</span>
            <span className="text-[9px] text-brand-gray truncate">{profile?.role_name}</span>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-grow flex flex-col gap-2 font-medium text-xs tracking-wider uppercase">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 ${isActive ? 'bg-brand-olive border-brand-olive text-brand-cream font-bold' : 'border-transparent hover:bg-brand-sand/20'}`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Return to Store */}
        <button
          onClick={() => navigate('/')}
          className="mt-auto flex items-center gap-2 text-xs font-bold text-brand-brown hover:text-brand-olive border-t border-brand-sand/20 pt-4 cursor-pointer uppercase tracking-wider"
        >
          <ArrowLeft className={`h-4.5 w-4.5 ${isRtl ? 'rotate-180' : ''}`} />
          {isRtl ? 'العودة للمتجر' : 'Return to Shop'}
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-brand-sand/30 px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-olive" />
            <h2 className="font-serif text-lg font-bold text-brand-brown dark:text-brand-sand">
              {isRtl ? 'لوحة الإدارة الفاخرة' : 'Premium Administration'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <span>{isRtl ? 'المنطقة الزمنية: الرياض' : 'Timezone: Riyadh'}</span>
            <button
              onClick={() => navigate('/')}
              className="md:hidden p-2 text-brand-brown/70 hover:text-brand-olive cursor-pointer"
            >
              <ArrowLeft className={`h-5 w-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </header>

        {/* Body content wrapper */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
