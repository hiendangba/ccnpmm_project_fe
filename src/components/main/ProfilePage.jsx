import MainPage from './HomePage';
import Picture from '../common/Picture';
import AltAvatar from "../../assets/alt_avatar.png";
import InputField from '../common/InputField';
import Button from '../common/Button';
import Toast from "../common/Toast";
import SelectField from '../common/SelectField';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";

export default function ProfilePage({ avatar, name, mssv, email, dob, address, gd }) {
  const navigate = useNavigate();

  const initialData = useMemo(() => ({
    avatar,
    name,
    mssv,
    email,
    dob,
    address,
    gender: gd || ""
  }), [avatar, name, mssv, email, dob, address, gd]);

  const [formData, setFormData] = useState(initialData);
  const [isChanged, setIsChanged] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const changed = Object.keys(initialData).some(
      (key) => formData[key] !== initialData[key]
    );
    setIsChanged(changed);
  }, [formData, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setToast({ message: "Đã lưu thay đổi!", type: "success" });
  };

  return (
    <>
      <MainPage>
        <div className="flex-1 flex items-center justify-center">
          <div
            className="bg-white/50 
                        py-[30px] px-[40px] 
                        flex flex-col items-center
                        space-y-[20px]
                        rounded-4xl 
                        border-1 border-white">
            <h1
              className="text-[50px] text-black 
                        font-bold 
                        drop-shadow-lg">
              Thông tin cá nhân
            </h1>
            <Picture 
              src={formData.avatar || AltAvatar} 
              alt="avatar" 
              size="lg" 
              variant="circle" 
              onClick={() => navigate("/list-member")} 
              className="w-48 h-48" 
            />

            <InputField value={formData.name} placeholder="Nhập tên của bạn" className='w-[482px]'
              onChange={(e) => handleChange("name", e.target.value)} />
            <InputField value={formData.email} placeholder="Nhập email của bạn" className='w-[482px]' readOnly />
            <InputField value={formData.mssv} placeholder="Nhập MSSV của bạn" className='w-[482px]' readOnly />
            <InputField value={formData.dob} placeholder="Nhập ngày sinh của bạn" className='w-[482px]' type='date'
              onChange={(e) => handleChange("dob", e.target.value)} />
            <InputField value={formData.address} placeholder="Nhập địa chỉ của bạn" className='w-[482px]'
              onChange={(e) => handleChange("address", e.target.value)} />

            <SelectField
              value={formData.gender}
              fieldName="Giới tính"
              className='w-[482px]'
              onChange={(e) => handleChange("gender", e.target.value)}
              options={[
                { value: "male", label: "Nam" },
                { value: "female", label: "Nữ" },
                { value: "other", label: "Khác" },
              ]}
            />

            <div className='w-[482px] flex justify-between'>
              <Button text="Lưu thay đổi" className='w-[200px]' onClick={handleSave} disabled={!isChanged}/>
              <Button text="Đăng xuất" className='w-[200px]'/>
            </div>
          </div>
        </div>
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