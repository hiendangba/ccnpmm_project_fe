import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";
import authApi from "../../api/authApi";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mssv, setMssv] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [flowId, setFlowId] = useState("");
  const [toast, setToast] = useState(null);

  const handleRegisterClick = async () => {
    try {
      const res = await authApi.verifyOTP({ flowId, otp });
      if (res) {
        setToast({ type: "success", message: "Đăng ký tài khoản thành công" });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setToast({
        type: "error",
        message:
          "Lỗi đăng ký: " +
          (err.response?.data?.message || err.message),
      });
    }
  };

  const handleSendOTPClick = async () => {
    try {
      if (password !== confirmPassword) {
        setToast({
          type: "error",
          message: "Mật khẩu và xác nhận mật khẩu không khớp",
        });
        return;
      }
      const res = await authApi.register({ name, mssv, password, email });
      setFlowId(res.flowId);
      setToast({ type: "success", message: res.message });
    } catch (err) {
      setToast({
        type: "error",
        message:
          "Lỗi đăng ký: " +
          (err.response?.data?.message || err.message),
      });
    }
  };

  return (
    <>
      <AuthPage title="Đăng Ký">
        <InputField
          placeholder="Nhập tên"
          required
          variant="rounded"
          className="w-full max-w-md bg-white/50 border border-transparent"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputField
          placeholder="Nhập MSSV"
          required
          variant="rounded"
          className="w-full max-w-md bg-white/50 border border-transparent"
          value={mssv}
          onChange={(e) => setMssv(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Nhập mật khẩu"
          required
          variant="rounded"
          className="w-full max-w-md bg-white/50 border border-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Nhập lại mật khẩu"
          required
          variant="rounded"
          className="w-full max-w-md bg-white/50 border border-transparent"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <InputField
          type="email"
          placeholder="Nhập email"
          required
          variant="rounded"
          className="w-full max-w-md bg-white/50 border border-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex items-center justify-between w-full max-w-md gap-2">
          <InputField
            placeholder="Nhập OTP"
            required
            variant="rounded"
            className="flex-1 bg-white/50 border border-transparent"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button
            text="Gửi lại OTP"
            className="w-40 border border-transparent"
            onClick={handleSendOTPClick}
          />
        </div>

        <Button
          text="Đăng ký"
          className="w-full max-w-md border border-transparent"
          onClick={handleRegisterClick}
        />
        <TextWithLink
          text="Đã có tài khoản?"
          linkText="Đăng nhập"
          to="/login"
        />
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
