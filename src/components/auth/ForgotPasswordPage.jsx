import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";

export default function ForgotPasswordPage() {
  // const [password, setPassword] = useState('');
  const handleForgotPasswordClick = () => {
      
  };

  // const [OTP, setOTP] = useState('');
  const handleSendOTPClick = () => {
      
  };

  const [toast, setToast] = useState(null);

  return (
    <>
      <AuthPage title="Quên Mật Khẩu">
        <InputField placeholder='Nhập mssv' required className='w-[482px]'/>
        <InputField type="password" placeholder='Nhập mật khẩu' required className='w-[482px]'/>
        <InputField type="password" placeholder='Nhập lại mật khẩu' required className='w-[482px]'/>
        <InputField type="email" placeholder='Nhập mail' required className='w-[482px]'/>
        <div className="flex items-center justify-between w-[482px]">
          <InputField placeholder='Nhập OTP' required className='w-[321px]'/>
          <Button variant="auth" text="Gửi lại OTP" className='w-[151px]' onClick={handleSendOTPClick}/>
        </div>
        <Button variant="auth" text="Quên mật khẩu" className='w-[482px]' onClick={handleForgotPasswordClick}/>
        <TextWithLink text="Đã nhớ mật khẩu?" linkText="Đăng nhập" to="/login"/>
        <TextWithLink text="Muốn tạo tài khoản mới?" linkText="Đăng ký" to="/register"/>
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