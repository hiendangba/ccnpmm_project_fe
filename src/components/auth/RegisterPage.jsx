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
  const [flowId, setFlowId] = useState("")

  const handleRegisterClick = async () => {
     try {
      
      const res = await authApi.verifyOTP({ flowId: flowId, otp });
      if(res){
        setToast({ type: 'success', message: "Đăng ký tài khoản thành công" });
        setTimeout(() => {
        navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setToast({ type: 'error', message: "Lỗi đăng ký: " + (err.response?.data?.message || err.message) });
    }
  };

const handleSendOTPClick = async () => {
    try {
      if (password !== confirmPassword) {
        setToast({ type: 'error', message: "Mật khẩu và xác nhận mật khẩu không khớp" });
        return;
      }
      const res = await authApi.register({ name, mssv, password, email });
      setFlowId(res.flowId)
      setToast({ type: 'success', message: res.message });
    } catch (err) {
      setToast({ type: 'error', message: "Lỗi đăng ký: " + (err.response?.data?.message || err.message) });
    }
};

  const [toast, setToast] = useState(null);

  return (
    <>
      <AuthPage title="Đăng Ký">
        <InputField placeholder='Nhập tên' required className='w-[482px]' value={name} onChange={(e) => setName(e.target.value)}/>
        <InputField placeholder='Nhập MSSV' required className='w-[482px]' value={mssv} onChange={(e) => setMssv(e.target.value)}/>
        <InputField type="password" placeholder='Nhập mật khẩu' required className='w-[482px]' value={password} onChange={(e) => setPassword(e.target.value)}/>
        <InputField type="password" placeholder='Nhập lại mật khẩu' required className='w-[482px]' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
        <InputField type="email" placeholder='Nhập mail' required className='w-[482px]' value={email} onChange={(e) => setEmail(e.target.value)}/>
        <div className="flex items-center justify-between w-[482px]">
          <InputField placeholder='Nhập OTP' required className='w-[321px]' value={otp} onChange={(e) => setOtp(e.target.value)}/>
          <Button text="Gửi lại OTP" className='w-[151px]' onClick={handleSendOTPClick}/>
        </div>
        <Button text="Đăng ký" className='w-[482px]' onClick={handleRegisterClick}/>
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