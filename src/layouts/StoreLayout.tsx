import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Search, Menu, X, Sun, Moon, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export const StoreLayout: React.FC<StoreLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, getTotals, removeFromCart, updateQuantity } = useCart();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totals = getTotals();
  const isRtl = i18n.language === 'ar';

  const handleLanguageChange = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-height-screen flex flex-col bg-brand-cream text-brand-charcoal dark:bg-brand-charcoal dark:text-brand-cream transition-colors duration-200">
      {/* Top Banner */}
      <div className="w-full bg-brand-brown text-brand-cream py-1.5 px-4 text-center text-xs tracking-wider uppercase">
        {isRtl ? 'شحن مجاني للطلبات بقيمة 200 ر.س أو أكثر' : 'Free shipping on orders over $200'}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-cream/80 backdrop-blur-md dark:bg-brand-charcoal/80 border-b border-brand-sand/30 dark:border-brand-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex flex-col select-none">
            <span className="font-serif text-2xl font-bold tracking-widest text-brand-brown dark:text-brand-sand">LUMA</span>
            <span className="text-[9px] tracking-[0.25em] text-brand-olive uppercase leading-none font-sans font-semibold">HANDMADE</span>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8 font-sans text-sm font-medium tracking-wide">
            <Link to="/" className="hover:text-brand-olive transition-colors">{t('home')}</Link>
            <Link to="/shop" className="hover:text-brand-olive transition-colors">{t('shop')}</Link>
            {profile?.role_name === 'admin' && (
              <Link to="/admin" className="text-brand-olive font-semibold flex items-center gap-1">
                {t('admin_dashboard')}
              </Link>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-1.5 text-xs bg-white/70 dark:bg-zinc-900 border border-brand-sand/50 rounded-full focus:border-brand-olive dark:border-zinc-800"
            />
            <button type="submit" className="absolute right-3 text-brand-brown/50 dark:text-brand-gray/50 hover:text-brand-olive cursor-pointer">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-brand-brown/70 dark:text-brand-sand/70 hover:text-brand-olive rounded-full cursor-pointer">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Language Toggle */}
            <button onClick={handleLanguageChange} className="p-2 text-xs font-bold text-brand-brown/70 dark:text-brand-sand/70 hover:text-brand-olive cursor-pointer uppercase">
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative group flex items-center gap-2">
                <Link to="/account" className="p-2 text-brand-brown/70 dark:text-brand-sand/70 hover:text-brand-olive rounded-full">
                  <User className="h-5 w-5" />
                </Link>
                <button onClick={signOut} className="hidden lg:block text-xs text-red-500 hover:underline cursor-pointer">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex items-center justify-center font-sans text-xs font-semibold uppercase tracking-wider text-brand-brown/80 dark:text-brand-sand hover:text-brand-olive px-3 py-1.5 border border-brand-brown/20 rounded-md">
                {t('login')}
              </Link>
            )}

            {/* Cart Button */}
            <button onClick={() => setCartDrawerOpen(true)} className="p-2 text-brand-brown/70 dark:text-brand-sand/70 hover:text-brand-olive relative cursor-pointer">
              <ShoppingBag className="h-5 w-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-olive text-brand-cream text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-sans font-bold">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-brand-brown/70 dark:text-brand-sand/70 hover:text-brand-olive cursor-pointer">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-sand dark:bg-zinc-950 text-brand-brown dark:text-brand-sand py-12 mt-12 border-t border-brand-sand/55 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <span className="font-serif text-xl font-bold tracking-widest">LUMA</span>
            <p className="text-xs text-brand-brown/75 dark:text-brand-gray/80 font-sans leading-relaxed max-w-xs">
              {t('brand_tagline')}
            </p>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wide uppercase mb-3">{t('shop')}</h4>
            <div className="flex flex-col gap-2 text-xs font-sans">
              <Link to="/shop?category=candles" className="hover:text-brand-olive">{isRtl ? 'شموع عطرية' : 'Scented Candles'}</Link>
              <Link to="/shop?category=ceramics" className="hover:text-brand-olive">{isRtl ? 'خزف وفخار' : 'Artisan Ceramics'}</Link>
              <Link to="/shop?category=textiles" className="hover:text-brand-olive">{isRtl ? 'منسوجات وتطريز' : 'Embroidery Textiles'}</Link>
              <Link to="/shop?category=woodwork" className="hover:text-brand-olive">{isRtl ? 'ديكورات خشبية' : 'Wooden Decor'}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wide uppercase mb-3">{t('about')}</h4>
            <div className="flex flex-col gap-2 text-xs font-sans">
              <Link to="/about" className="hover:text-brand-olive">{t('about')}</Link>
              <Link to="/contact" className="hover:text-brand-olive">{t('contact')}</Link>
              <Link to="/faq" className="hover:text-brand-olive">FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wide uppercase mb-3">{isRtl ? 'شروط وقوانين' : 'Policies'}</h4>
            <div className="flex flex-col gap-2 text-xs font-sans">
              <Link to="/privacy" className="hover:text-brand-olive">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
              <Link to="/terms" className="hover:text-brand-olive">{isRtl ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-brown/10 dark:border-zinc-800 mt-8 pt-6 text-center text-[10px] tracking-widest text-brand-brown/60 dark:text-brand-gray/60 uppercase">
          © {new Date().getFullYear()} LUMA HANDMADE. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Cart Drawer Overlay */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={() => setCartDrawerOpen(false)} />
          <div className={`absolute inset-y-0 ${isRtl ? 'left-0' : 'right-0'} max-w-md w-full bg-brand-cream dark:bg-brand-charcoal border-l border-brand-sand/30 shadow-2xl flex flex-col p-6 animate-slide-in-right`}>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-sand/30 pb-4">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-olive" />
                {t('cart')} ({totalCartCount})
              </h3>
              <button onClick={() => setCartDrawerOpen(false)} className="p-2 text-brand-brown/70 dark:text-brand-sand/70 hover:text-brand-olive cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto py-4 flex flex-col gap-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                  <ShoppingBag className="h-12 w-12 text-brand-sand/70" />
                  <p className="text-sm text-brand-gray">{isRtl ? 'سلة التسوق فارغة حالياً' : 'Your cart is empty.'}</p>
                  <Button variant="outline" size="sm" onClick={() => { setCartDrawerOpen(false); navigate('/shop'); }}>
                    {t('back_to_shop')}
                  </Button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-white dark:bg-zinc-900 border border-brand-sand/20 rounded-lg">
                    <img src={item.product.image_url} alt={isRtl ? item.product.name_ar : item.product.name_en} className="h-16 w-16 object-cover rounded-md" />
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-serif font-bold line-clamp-1">{isRtl ? item.product.name_ar : item.product.name_en}</h4>
                        {item.variant && (
                          <p className="text-[10px] text-brand-gray mt-0.5">{isRtl ? item.variant.title_ar : item.variant.title_en}</p>
                        )}
                        <p className="text-xs font-semibold text-brand-olive mt-1">
                          {(item.variant?.price_override ?? item.product.price)} ر.س
                        </p>
                      </div>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-brand-sand/50 rounded-md">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 text-xs hover:bg-brand-sand/20 cursor-pointer">-</button>
                          <span className="px-2 text-xs font-sans font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 text-xs hover:bg-brand-sand/20 cursor-pointer">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-[10px] text-red-500 hover:underline cursor-pointer">
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-brand-sand/30 pt-4 flex flex-col gap-3">
                <div className="flex justify-between text-xs">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold">{totals.subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{t('shipping')}</span>
                  <span className="font-semibold">{totals.shipping === 0 ? (isRtl ? 'مجاني' : 'Free') : `${totals.shipping.toFixed(2)}  ر.س`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-brand-sand/20 pt-2 text-brand-olive">
                  <span>{t('total')}</span>
                  <span>{totals.total.toFixed(2)} ر.س</span>
                </div>
                <Button className="w-full mt-2 font-sans font-bold uppercase tracking-wider text-xs" onClick={() => { setCartDrawerOpen(false); navigate('/checkout'); }}>
                  {t('checkout')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-brand-cream dark:bg-brand-charcoal border-l border-brand-sand/30 shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between border-b border-brand-sand/30 pb-4">
              <span className="font-serif text-lg font-bold">LUMA</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-brand-brown/70 dark:text-brand-sand/70 hover:text-brand-olive cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Links */}
            <div className="flex-grow flex flex-col gap-6 py-6 font-sans text-sm font-semibold uppercase tracking-wider">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-olive">{t('home')}</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-olive">{t('shop')}</Link>
              {profile?.role_name === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-brand-olive">{t('admin_dashboard')}</Link>
              )}
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-olive">{t('my_account')}</Link>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center relative mt-auto border-t border-brand-sand/30 pt-4">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-xs bg-white dark:bg-zinc-900 border border-brand-sand/50 rounded-full focus:border-brand-olive"
              />
              <button type="submit" className="absolute right-3 text-brand-brown/50 cursor-pointer">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
