import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { currentUser, token, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>; // chờ load user xong
  if (!currentUser || !token) return <Navigate to="/login" />;

  return children;
}
