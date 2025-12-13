import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/login";
import Register from "./pages/register";
import ProtectedRoute from "./components/protectedRoutes";
import Dashboard from "./pages/dashboard"; // asegúrate de tener esta página
import { SkeletonTheme } from "react-loading-skeleton";
import GoogleCallback from "./pages/GoogleCallback";
import GoogleSuccess from "./pages/success";



function App({pageProps,Component}) {
  return (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/success" element={<GoogleSuccess />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SkeletonTheme>
  );
}

export default App;
