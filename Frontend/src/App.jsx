import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/protectedRoutes";
import { SkeletonTheme } from "react-loading-skeleton";
import GoogleCallback from "./pages/GoogleCallback";
import GoogleSuccess from "./pages/success";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

function App({ pageProps, Component }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/success" element={<GoogleSuccess />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </SkeletonTheme>
    </QueryClientProvider>
  );
}

export default App;
