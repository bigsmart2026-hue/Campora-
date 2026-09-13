import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import RouteErrorBoundary from '@/components/common/RouteErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AdminRoute from '@/components/common/AdminRoute';

// Layouts
import Layout from '@/components/layout/Layout';

// Eagerly loaded pages
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Lazy loaded pages
const ProductList = lazy(() => import('@/pages/products/ProductList'));
const ProductDetail = lazy(() => import('@/pages/products/ProductDetail'));
const CreateProduct = lazy(() => import('@/pages/products/CreateProduct'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/orders/OrderDetail'));
const SellerOrderManagement = lazy(
  () => import('@/pages/orders/SellerOrderManagement')
);
const Profile = lazy(() => import('@/pages/Profile'));
const SellerProfile = lazy(() => import('@/pages/sellers/SellerProfile'));
const SellerDashboard = lazy(() => import('@/pages/sellers/SellerDashboard'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const Verification = lazy(() => import('@/pages/Verification'));
const AdminVerifications = lazy(
  () => import('@/pages/admin/AdminVerifications')
);
const RunnerDashboard = lazy(() => import('@/pages/runners/RunnerDashboard'));
const RunnerRegistration = lazy(
  () => import('@/pages/runners/RunnerRegistration')
);
const ActiveDelivery = lazy(() => import('@/pages/runners/ActiveDelivery'));
const DeliveryTracking = lazy(() => import('@/pages/delivery/DeliveryTracking'));
const AdminDeliveryView = lazy(
  () => import('@/pages/admin/AdminDeliveryView')
);
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminDisputes = lazy(() => import('@/pages/admin/AdminDisputes'));
const FileDispute = lazy(() => import('@/pages/disputes/FileDispute'));
const Categories = lazy(() => import('@/pages/Categories'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const Safety = lazy(() => import('@/pages/Safety'));
const Help = lazy(() => import('@/pages/Help'));
const Disputes = lazy(() => import('@/pages/Disputes'));
const Contact = lazy(() => import('@/pages/Contact'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));

// Loading component for Suspense
function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route (redirect to home if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { getEffectiveTheme } = useThemeStore();

  useEffect(() => {
    const isDark = getEffectiveTheme() === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [getEffectiveTheme]);

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route
                path="login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route path="products" element={<ProductList />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="seller/:id" element={<SellerProfile />} />
              <Route path="categories" element={<Categories />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="safety" element={<Safety />} />
              <Route path="help" element={<Help />} />
              <Route path="disputes" element={<Disputes />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />

              {/* Protected Routes */}
              <Route
                path="sell"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Create Listing">
                      <CreateProduct />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="sell/dashboard"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Seller Dashboard">
                      <SellerDashboard />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="cart"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Cart">
                      <Cart />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Checkout">
                      <Checkout />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Orders">
                      <Orders />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Order Details">
                      <OrderDetail />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id/manage"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Order Management">
                      <SellerOrderManagement />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="wishlist"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Wishlist">
                      <Wishlist />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Profile">
                      <Profile />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="verification"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Verification">
                      <Verification />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="runner/register"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Runner Registration">
                      <RunnerRegistration />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="runner/dashboard"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Runner Dashboard">
                      <RunnerDashboard />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="runner/delivery/:id"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Active Delivery">
                      <ActiveDelivery />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="delivery/:id"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="Delivery Tracking">
                      <DeliveryTracking />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <RouteErrorBoundary pageName="Admin Dashboard">
                      <AdminDashboard />
                    </RouteErrorBoundary>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/verifications"
                element={
                  <AdminRoute>
                    <RouteErrorBoundary pageName="Admin Verifications">
                      <AdminVerifications />
                    </RouteErrorBoundary>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/deliveries"
                element={
                  <AdminRoute>
                    <RouteErrorBoundary pageName="Admin Deliveries">
                      <AdminDeliveryView />
                    </RouteErrorBoundary>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/disputes"
                element={
                  <AdminRoute>
                    <RouteErrorBoundary pageName="Admin Disputes">
                      <AdminDisputes />
                    </RouteErrorBoundary>
                  </AdminRoute>
                }
              />
              <Route
                path="orders/:orderId/dispute"
                element={
                  <ProtectedRoute>
                    <RouteErrorBoundary pageName="File Dispute">
                      <FileDispute />
                    </RouteErrorBoundary>
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                  <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                    404
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">Page not found</p>
                  <a href="/" className="btn-primary">
                    Go Home
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
