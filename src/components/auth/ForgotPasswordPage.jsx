import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Regex check email hợp lệ
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleForgotPasswordClick = async () => {
    if (!validateEmail(email)) {
      setToast({ message: "Email không hợp lệ", type: "error" });
      return;
    }
    try {
      // 2. Gọi API POST tới backend
      const response = await fetch("http://localhost:3000/api/auth/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // gửi email lên backend
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Gửi OTP thất bại");
      }

      // 3. Thành công
      // ✅ Lấy dữ liệu từ server (ForgotPasswordResponseDTO)
      const data = await response.json();
      localStorage.setItem("flowId", data.flowId);
      localStorage.setItem("tryTime", data.tryTime);

      setToast({ message: data.message , type: "success" });

      // chuyển sang trang verify OTP
      navigate("/verify-otpFP"); 

    } catch (error) {
      // 4. Lỗi
      setToast({ message: error.message, type: "error" });
    }
  };

  return (
    <>
      <AuthPage title="Quên Mật Khẩu">
        <InputField type="email" placeholder='Nhập mail' required className='w-[482px]' value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button variant="auth" text="Gửi OTP" className='w-[482px]' onClick={handleForgotPasswordClick} />
        <TextWithLink text="Đã nhớ mật khẩu?" linkText="Đăng nhập" to="/login" />
        <TextWithLink text="Muốn tạo tài khoản mới?" linkText="Đăng ký" to="/register" />
      </AuthPage>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}