import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import Toast from "../common/Toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from '../../api/authApi';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleResetPasswordClick = async () => {
    if (!password || !confirmPassword) {
      setToast({ message: "Vui lòng nhập đầy đủ thông tin", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ message: "Mật khẩu nhập lại không khớp", type: "error" });
      return;
    }

    try {
      const response = await authApi.resetPassword ({ newPassword: password });
      setToast({ message: response.message, type: "success" });

      localStorage.removeItem("flowId");
      localStorage.removeItem("tryTime");
      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      const message = error.response?.data?.message || error.message || "Thất bại khi kết nối với máy chủ.";
      setToast({ message: message, type: "error" });
    }
  };

  return (
    <>
      <AuthPage title="Đặt Lại Mật Khẩu">
        <InputField
          type="password"
          placeholder="Nhập mật khẩu mới"
          required
          className="w-[482px]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          required
          className="w-[482px] mt-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button
          text="Cập nhật"
          className="w-[482px] mt-4"
          onClick={handleResetPasswordClick}
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
