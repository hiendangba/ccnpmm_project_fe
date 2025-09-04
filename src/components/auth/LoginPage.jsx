import AuthPage from './AuthPage';
import InputField from '../common/InputField';
import Button from '../common/Button';
import CheckboxField from '../common/CheckboxField';
import TextWithLink from '../common/TextWithLink';
import { useState } from 'react';
import Toast from "../common/Toast";
import authApi from "../../api/authApi";
import userApi from "../../api/userApi";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    const [remember, setRemember] = useState(false);

    const handleRememberChange = (e) => {
        setRemember(e.target.checked); 
        console.log(remember);
    };

    const [mssv, setMssv] = useState('');
    const [password, setPassword] = useState('');
    const handleLoginClick = async () => {
        try {
            const response = await authApi.login({ mssv, password });
            localStorage.setItem("token",response.token); // lưu token
            const res = await userApi.getProfile()
            console.log(res)
            if(!res.age && !res.gender && !res.bio && !res.address){
                navigate("/update-profile", { state: { res } });
            }
            else{
                navigate("/home");
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Đăng nhập thất bại";
            setToast({ type: 'error', message });
        }
    };

    const [toast, setToast] = useState(null);

    return (
        <>
            <AuthPage title="Đăng Nhập">
                <InputField placeholder='Nhập MSSV' required className='w-[482px]' value = {mssv} onChange={(e) => setMssv(e.target.value)}/>
                <InputField type="password" placeholder='Nhập mật khẩu' required className='w-[482px]' value = {password} onChange={(e) => setPassword(e.target.value)}/>
                <Button text="Đăng nhập" className='w-[482px]' onClick={handleLoginClick}/>
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