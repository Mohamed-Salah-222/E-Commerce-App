import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "./LoadingSkeleton";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.admin !== true) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
