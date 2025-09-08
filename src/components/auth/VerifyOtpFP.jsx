import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import Toast from "../common/Toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from '../../api/authApi';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const flowId = localStorage.getItem("flowId");
  const tryTime = localStorage.getItem("tryTime");

  const handleVerifyClick = async () => {
    if (!otp) {
      setToast({ message: "Vui lòng nhập OTP", type: "error" });
      return;
    }

    try {
      const response = await authApi.verifyOtpFP({ flowId, otp });
      setToast({ message: response.message, type: "success" });

      navigate("/reset-password");

    } catch (error) {
      const message = error.response?.data?.message || error.message || "Thất bại khi kết nối với máy chủ.";
      setToast({ message: message, type: "error" });
    }
  };

  const handleResendClick = async () => {
    try {
      const response = await authApi.resendOTP( { flowId } );
      setToast({ message: response.message, type: "success" });

    } catch (error) {
      const message = error.response?.data?.message || error.message || "Thất bại khi kết nối với máy chủ.";
      setToast({ message: message, type: "error" });
    }
  };

  return (
    <>
      <AuthPage title="Xác Thực OTP">
        <p className="text-black mb-4">Bạn có {tryTime} lần thử OTP.</p>
        <InputField
          placeholder="Nhập OTP"
          required
          className="w-[482px]"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button
          text="Kiểm tra OTP"
          className="w-[482px]"
          onClick={handleVerifyClick}
        />
        <Button
          text="Gửi lại OTP"
          className="w-[482px] mt-2"
          onClick={handleResendClick}
        />
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
