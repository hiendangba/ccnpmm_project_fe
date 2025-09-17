import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import VerifyOTPFPPage from './components/auth/VerifyOtpFP';
import ResetPasswordPage from './components/auth/ChangePasswordPage';
import ProfilePage from './components/main/ProfilePage';
import ListMemberPage from './components/main/ListMemberPage';
import HomePage from './components/main/HomePage';
import UserPage from './components/main/UserPage';
import ChatPage from './components/main/ChatPage';
import FriendPage from './components/main/FriendPage';

function App( { socket } ) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage socket={socket} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otpFP" element={<VerifyOTPFPPage />} />
        <Route path="/change-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/list-member" element={<ListMemberPage />} />
        <Route path="/update-profile" element={<ProfilePage />} />
        <Route path="/personal-page" element={<UserPage socket={socket} />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/friend" element={<FriendPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
