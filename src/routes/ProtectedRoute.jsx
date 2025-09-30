import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function ProtectedRoute({ children, requireRole }) {
  const { currentUser, token, loading } = useAuth();
  
  console.log("ProtectedRoute - currentUser:", currentUser);
  console.log("ProtectedRoute - token:", token);
  console.log("ProtectedRoute - loading:", loading);
  console.log("ProtectedRoute - requireRole:", requireRole);
  console.log("ProtectedRoute - currentUser.role:", currentUser?.role);
  
  if (loading) return <div>Đang tải...</div>; // chờ load user xong
  if (!currentUser || !token) return <Navigate to="/login" />;
  
  // Check role requirement
  if (requireRole && currentUser.role !== requireRole) {
    console.log("ProtectedRoute - Role check failed. Required:", requireRole, "Current:", currentUser.role);
    return <Navigate to="/home" />; // Redirect to home if not authorized
  }

  console.log("ProtectedRoute - Access granted");
  return children;
}
