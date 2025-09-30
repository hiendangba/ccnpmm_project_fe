import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import Toast from "../common/Toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from '../../api/authApi';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tryTime, setTryTime] = useState(
    parseInt(localStorage.getItem("tryTime") || "0", 10)
  );

  const navigate = useNavigate();
  const flowId = localStorage.getItem("flowId");

  useEffect(() => {
    localStorage.setItem("tryTime", tryTime);
  }, [tryTime]);

  const handleVerifyClick = async () => {
    if (!otp) {
      setToast({ message: "Vui lòng nhập OTP", type: "error" });
      return;
    }
    if (!flowId) {
      setToast({ message: "Không tìm thấy flowId. Vui lòng thực hiện lại.", type: "error" });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await authApi.verifyOtpFP({ flowId, otp });

      if (response.tryTime !== undefined) {
        setTryTime(response.tryTime);
      }

      setToast({ message: response.message, type: "success" });
      setTimeout(() => {
        navigate("/reset-password");
      }, 1500);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Thất bại khi kết nối với máy chủ.";
      setToast({ message, type: "error" });

      setTryTime((prev) => Math.max(prev - 1, 0));
    } finally {
      setOtp(""); 
      setLoading(false);
    }
  };

  const handleResendClick = async () => {
    if (!flowId) {
      setToast({ message: "Không tìm thấy flowId. Vui lòng thực hiện lại.", type: "error" });
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const response = await authApi.resendOTP({ flowId });
      setToast({ message: response.message, type: "success" });

      if (response.tryTime !== undefined) {
        setTryTime(response.tryTime);
      } else {
        setTryTime(3); 
      }

      setOtp(""); 
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Thất bại khi kết nối với máy chủ.";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthPage title="Xác Thực OTP">
        <div className="flex items-center w-full max-w-md space-x-2">
          <InputField
            placeholder={`Nhập OTP - Bạn còn ${tryTime} lần thử`}
            required
            variant="rounded"
            className="flex-1 bg-white/50 border border-transparent"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button
            text={loading ? "..." : "Gửi lại OTP"}
            className="border border-transparent"
            onClick={handleResendClick}
            disabled={loading}
          />
        </div>

        <Button
          text={loading ? "Đang xử lý..." : "Kiểm tra OTP"}
          className="w-full max-w-md border border-transparent"
          onClick={handleVerifyClick}
          disabled={loading}
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
