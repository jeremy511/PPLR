import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "./ui/LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Verificando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
