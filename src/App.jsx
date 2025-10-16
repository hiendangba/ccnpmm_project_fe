import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import VerifyOTPFPPage from './components/auth/VerifyOtpFP';
import ProfilePage from './components/main/ProfilePage';
import ListMemberPage from './components/main/ListMemberPage';
import HomePage from './components/main/HomePage';
import UserPage from './components/main/UserPage';
import ChatPage from './components/main/ChatPage';
import FriendPage from './components/main/FriendPage';
import UserManagement from './components/management/UserManagement';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import { CallProvider } from './contexts/CallProvider';
import { FriendProvider } from './contexts/FriendContext';
import ProtectedRoute from './routes/ProtectedRoute';
import ChangePasswordPage from './components/auth/ChangePasswordPage';
import { MessageProvider } from "./contexts/MessageContext";

function AppWrapper({ socket }) {
  const { currentUser } = useAuth();

  return (
    <MessageProvider>
      <CallProvider currentUser={currentUser}>
        <FriendProvider>
          <Routes>
            <Route path="/home" element={<HomePage socket={socket} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/list-member" element={<ListMemberPage />} />
            <Route path="/personal-page" element={<UserPage socket={socket} />} />
            <Route path="/user-page" element={<UserPage socket={socket} />} />
            <Route path="/friend" element={<FriendPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Routes>
        </FriendProvider>
      </CallProvider>
    </MessageProvider>

  );
}

function App({ socket }) {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes socket={socket} />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes({ socket }) {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={currentUser ? "/home" : "/login"} replace />}
      />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otpFP" element={<VerifyOTPFPPage />} />

      {/* Admin routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireRole="admin">
            <HomePage socket={socket}>
              <UserManagement />
            </HomePage>
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppWrapper socket={socket} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
