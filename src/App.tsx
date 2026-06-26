import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import './lib/i18n'; // Import i18n initially to load languages

// Store layouts and pages
import { StoreLayout } from './layouts/StoreLayout';
import { Home } from './pages/store/Home';
import { Shop } from './pages/store/Shop';
import { ProductDetails } from './pages/store/ProductDetails';
import { Checkout } from './pages/store/Checkout';
import { Auth } from './pages/store/Auth';
import { Account } from './pages/store/Account';

// Admin layouts and pages
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Products as AdminProducts } from './pages/admin/Products';
import { Orders as AdminOrders } from './pages/admin/Orders';
import { Coupons as AdminCoupons } from './pages/admin/Coupons';
import { Settings as AdminSettings } from './pages/admin/Settings';

const queryClient = new QueryClient();

// Wrapper component for store routes
const StoreRoutes: React.FC = () => {
  return (
    <StoreLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </StoreLayout>
  );
};

// Route guard for Admin pages
const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-olive font-serif text-lg font-bold">
        LUMA...
      </div>
    );
  }

  // Allow if role is admin or editor (also allow default fallback in case DB is offline/profile not ready)
  const hasAccess = user && (profile?.role_name === 'admin' || profile?.role_name === 'editor');
  
  if (!hasAccess) {
    // If not admin, redirect to store main index
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Wrapper component for admin routes
const AdminRoutes: React.FC = () => {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/coupons" element={<AdminCoupons />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Store Routes - All wrapped in StoreLayout */}
                <Route path="/*" element={<StoreRoutes />} />

                {/* Admin Routes - All wrapped in AdminLayout */}
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
