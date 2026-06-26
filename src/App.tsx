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

// Store Wrapper
const StoreRoute: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => (
  <StoreLayout>
    <Component />
  </StoreLayout>
);

// Admin Wrapper
const AdminRoute: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => (
  <AdminRouteGuard>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </AdminRouteGuard>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Store Routes */}
                <Route path="/" element={<StoreRoute component={Home} />} />
                <Route path="/shop" element={<StoreRoute component={Shop} />} />
                <Route path="/product/:slug" element={<StoreRoute component={ProductDetails} />} />
                <Route path="/checkout" element={<StoreRoute component={Checkout} />} />
                <Route path="/auth" element={<StoreRoute component={Auth} />} />
                <Route path="/account" element={<StoreRoute component={Account} />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute component={AdminDashboard} />} />
                <Route path="/admin/products" element={<AdminRoute component={AdminProducts} />} />
                <Route path="/admin/orders" element={<AdminRoute component={AdminOrders} />} />
                <Route path="/admin/coupons" element={<AdminRoute component={AdminCoupons} />} />
                <Route path="/admin/settings" element={<AdminRoute component={AdminSettings} />} />

                {/* Catch-all Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
