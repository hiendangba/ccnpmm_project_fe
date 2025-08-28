import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";

export default function RegisterPage() {
  // const [password, setPassword] = useState('');
  const handleRegisterClick = () => {
      
  };

  // const [OTP, setOTP] = useState('');
  const handleSendOTPClick = () => {
      
  };

  const [toast, setToast] = useState(null);

  return (
    <>
      <AuthPage title="Đăng Ký">
        <InputField placeholder='Nhập mssv' required className='w-[482px]'/>
        <InputField type="password" placeholder='Nhập mật khẩu' required className='w-[482px]'/>
        <InputField type="password" placeholder='Nhập lại mật khẩu' required className='w-[482px]'/>
        <InputField type="email" placeholder='Nhập mail' required className='w-[482px]'/>
        <div className="flex items-center justify-between w-[482px]">
          <InputField placeholder='Nhập OTP' required className='w-[321px]'/>
          <Button variant="auth" text="Gửi lại OTP" className='w-[151px]' onClick={handleSendOTPClick}/>
        </div>
        <Button variant="auth" text="Đăng ký" className='w-[482px]' onClick={handleRegisterClick}/>
        <TextWithLink text="Đã có tài khoản?" linkText="Đăng nhập" to="/login"/>
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