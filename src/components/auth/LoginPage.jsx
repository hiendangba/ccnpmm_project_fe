import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import CheckboxField from '../common/CheckboxField';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [remember, setRemember] = useState(false);
  const [mssv, setMssv] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);

  const handleRememberChange = (e) => {
    setRemember(e.target.checked);
  };

  const handleLoginClick = async () => {
    try {
      const user = await login({ mssv, password, remember });
      if (!user.age && !user.gender && !user.bio && !user.address) {
        navigate("/profile", { state: { user } });
      } else {
        navigate("/home");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Đăng nhập thất bại";
      setToast({ type: 'error', message });
    }
  };

  return (
    <>
      <AuthPage title="Đăng Nhập">
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
        <Button
          text="Đăng nhập"
          className="w-full max-w-md border border-transparent"
          onClick={handleLoginClick}
        />
        <div className="flex items-center justify-between w-full max-w-md">
          <CheckboxField text="Nhớ mật khẩu" onChange={handleRememberChange} />
          <TextWithLink linkText="Quên mật khẩu" to="/forgot-password" />
        </div>
        <TextWithLink
          text="Chưa có tài khoản?"
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
