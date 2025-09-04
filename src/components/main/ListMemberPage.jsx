import MainPage from './HomePage';
import Picture from '../common/Picture';
import AltAvatar from "../../assets/alt_avatar.png";
import InputField from '../common/InputField';
import Button from '../common/Button';
import Toast from "../common/Toast";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function ListMemberPage({Avatar, Name, MSSV, Email}) {
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  return (
    <>
      <MainPage title="Thông tin cá nhân">
        <Picture src={Avatar} alt={AltAvatar} size="lg" variant="circle" onClick={() => navigate("/list-member")} />
        <InputField value={Name} placeholder="Nhập tên của bạn" variant='auth'/>
        <InputField value={MSSV} placeholder="Nhập MSSV của bạn" variant='auth'/>
        <InputField value={Email} placeholder="Nhập email của bạn" variant='auth'/>
      </MainPage>

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