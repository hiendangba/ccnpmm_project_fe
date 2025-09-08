import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import VerifyOTPFPPage from './components/auth/VerifyOtpFP';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProfilePage from './components/main/ProfilePage';
import ListMemberPage from './components/main/ListMemberPage';
import HomePage from './components/main/HomePage';
import UserPage from './components/main/UserPage';
import ChatPage from './components/main/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otpFP" element={<VerifyOTPFPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/list-member" element={<ListMemberPage />} />
        <Route path="/update-profile" element={<ProfilePage />} />
        <Route path="/personal-page" element={<UserPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
