import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/protectedRoutes";
import { SkeletonTheme } from "react-loading-skeleton";
const GoogleCallback = React.lazy(() => import("./pages/GoogleCallback"));
const GoogleSuccess = React.lazy(() => import("./pages/success"));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { LoadingScreen } from "./components/ui/LoadingScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    },
  },
});

// Lazy load pages
const Login = React.lazy(() => import("./pages/login"));
const Register = React.lazy(() => import("./pages/register"));
const Dashboard = React.lazy(() => import("./pages/dashboard"));
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
const AdminZones = React.lazy(() => import("./pages/admin/Zones"));
const Reports = React.lazy(() => import("./pages/admin/Reports"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const MyShifts = React.lazy(() => import("./pages/MyShifts"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Reminders = React.lazy(() => import("./pages/Reminders"));

const Footer = React.lazy(() => import("./components/Footer").then(module => ({ default: module.Footer })));

function App({ pageProps, Component }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors closeButton style={{ zIndex: 99999 }} />
            <div className="flex flex-col min-h-screen font-sans antialiased">
              <div className="flex-grow flex flex-col">
                <Suspense fallback={<LoadingScreen text="Cargando..." />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute>
                          <AdminUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/zones"
                      element={
                        <ProtectedRoute>
                          <AdminZones />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-shifts"
                      element={
                        <ProtectedRoute>
                          <MyShifts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recordatorios"
                      element={
                        <ProtectedRoute>
                          <Reminders />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/success" element={<GoogleSuccess />} />
                    <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  </Routes>
                </Suspense>
              </div>
              <Suspense fallback={null}>
                <Footer />
              </Suspense>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </SkeletonTheme>
    </QueryClientProvider>
  );
}

export default App;
