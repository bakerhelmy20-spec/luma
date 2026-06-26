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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Store Routes */}
                <Route
                  path="/"
                  element={
                    <StoreLayout>
                      <Home />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <StoreLayout>
                      <Shop />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/product/:slug"
                  element={
                    <StoreLayout>
                      <ProductDetails />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <StoreLayout>
                      <Checkout />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <StoreLayout>
                      <Auth />
                    </StoreLayout>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <StoreLayout>
                      <Account />
                    </StoreLayout>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </AdminRouteGuard>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout>
                        <AdminProducts />
                      </AdminLayout>
                    </AdminRouteGuard>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout>
                        <AdminOrders />
                      </AdminLayout>
                    </AdminRouteGuard>
                  }
                />
                <Route
                  path="/admin/coupons"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout>
                        <AdminCoupons />
                      </AdminLayout>
                    </AdminRouteGuard>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRouteGuard>
                      <AdminLayout>
                        <AdminSettings />
                      </AdminLayout>
                    </AdminRouteGuard>
                  }
                />

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
