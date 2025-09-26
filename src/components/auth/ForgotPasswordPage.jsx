import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";
import { useNavigate } from "react-router-dom";
import authApi from '../../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleForgotPasswordClick = async () => {
    if (!validateEmail(email)) {
      setToast({ message: "Email không hợp lệ", type: "error" });
      return;
    }
    try {
      const response = await authApi.forgotPassword({ email });

      localStorage.setItem("flowId", response.flowId);
      localStorage.setItem("tryTime", response.tryTime);

      setToast({ message: response.message, type: "success" });
      navigate("/verify-otpFP");

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Thất bại khi kết nối với máy chủ.";
      setToast({ message, type: "error" });
    }
  };

  return (
    <>
      <AuthPage title="Quên Mật Khẩu">
        <InputField
          type="email"
          placeholder="Nhập email"
          required
          className="w-full max-w-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          text="Gửi OTP"
          className="w-full max-w-md"
          onClick={handleForgotPasswordClick}
        />
        <TextWithLink
          text="Đã nhớ mật khẩu?"
          linkText="Đăng nhập"
          to="/login"
        />
        <TextWithLink
          text="Muốn tạo tài khoản mới?"
          linkText="Đăng ký"
          to="/register"
        />
      </AuthPage>

      {toast && (
        <Toast
          key={toast.message + toast.type}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
