import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import CheckboxField from '../common/CheckboxField';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";  // hook lấy login, currentUser từ AuthProvider

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();   // lấy hàm login toàn cục từ AuthProvider

  const [remember, setRemember] = useState(false);
  const [mssv, setMssv] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);

  const handleRememberChange = (e) => {
    setRemember(e.target.checked);
  };

  const handleLoginClick = async () => {
    try {
      const user = await login({ mssv, password, remember }); // gọi login toàn cục
      // Sau khi login thành công, điều hướng theo thông tin user
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
          className="w-[482px]"
          value={mssv}
          onChange={(e) => setMssv(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Nhập mật khẩu"
          required
          className="w-[482px]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          text="Đăng nhập"
          className="w-[482px]"
          onClick={handleLoginClick}
        />
        <div className="flex items-center justify-between w-[482px]">
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
          key={Date.now()}   
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
