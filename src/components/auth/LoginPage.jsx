import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import CheckboxField from '../common/CheckboxField';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";

export default function LoginPage() {
    const [remember, setRemember] = useState(false);
    const handleRememberChange = (e) => {
        setRemember(e.target.checked); 
        console.log(remember);
    };

    // const [password, setPassword] = useState('');
    const handleLoginClick = () => {
        // const isSuccess = Math.random() > 0.5; 
        // if (isSuccess) {
        //     setToast({ message: "Đăng nhập thành công!", type: "success" });
        // } else {
        //     setToast({ message: "Sai tài khoản hoặc mật khẩu!", type: "error" });
        // }
    };

    const [toast, setToast] = useState(null);

    return (
        <>
            <AuthPage title="Đăng Nhập">
                <InputField placeholder='Nhập tài khoản' required className='w-[482px]'/>
                <InputField type="password" placeholder='Nhập mật khẩu' required className='w-[482px]'/>
                <Button variant="auth" text="Đăng nhập" className='w-[482px]' onClick={handleLoginClick}/>
                <div className="flex items-center justify-between w-[482px]">
                    <CheckboxField text="Nhớ mật khẩu" onChange={handleRememberChange}/>
                    <TextWithLink linkText="Quên mật khẩu" to="/forgot-password"/>
                </div>
                <TextWithLink text="Chưa có tài khoản?" linkText="Đăng ký" to="/register"/>
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