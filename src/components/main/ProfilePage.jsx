import MainPage from './HomePage';
import Picture from '../common/Picture';
import AltAvatar from "../../assets/alt_avatar.png";
import InputField from '../common/InputField';
import Button from '../common/Button';
import Toast from "../common/Toast";
import SelectField from '../common/SelectField';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import userApi from "../../api/userApi"
import { useAuth } from "../../contexts/AuthProvider";


export default function ProfilePage({ avatar, name, mssv, email, dateOfBirth, address, gd }) {
  const { currentUser } = useAuth();
  const formatDate = (date) => date ? new Date(date).toISOString().split("T")[0] : "";

  console.log(currentUser)
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || currentUser;
  const initialData = useMemo(() => ({
    avatar: user?.avatar || avatar || "",
    name: user?.name || name || "",
    mssv: user?.mssv || mssv || "",
    email: user?.email || email || "",
    dateOfBirth: formatDate(user?.dateOfBirth || dateOfBirth),
    address: user?.address || address || "",
    gender: user?.gender || gd || "nam"   // mặc định "nam"
  }), [avatar, name, mssv, email, dateOfBirth, address, gd]);

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

  const handleSave = async () => {
        try {
            const response = await userApi.updateProfile(formData);
            if (response.name) {
              setToast({ type: 'success', message: "Cập nhật thông tin thành công" });
              console.log(response)
              const formattedResponse = {
              ...response,
              dateOfBirth: response.dateOfBirth 
              ? new Date(response.dateOfBirth).toISOString().split("T")[0] 
               : ""
              };
              setFormData(formattedResponse);
            } else {
              setToast({ type: 'warning', message: "Cập nhật thông tin thất bại" });
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Lưu thông tin thất bại";
            setToast({ type: 'error', message });
        }
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
            <InputField value={formData.dateOfBirth} placeholder="Nhập ngày sinh của bạn" className='w-[482px]' type='date'
              onChange={(e) => handleChange("dateOfBirth", e.target.value)} />
            <InputField value={formData.address} placeholder="Nhập địa chỉ của bạn" className='w-[482px]'
              onChange={(e) => handleChange("address", e.target.value)} />

            <SelectField
              value={formData.gender || user?.gender || "nam"} // mặc định "nam"
              fieldName="Giới tính"
              className='w-[482px]'
              onChange={(e) => handleChange("gender", e.target.value)}
              options={[
                { value: "nam", label: "Nam" },
                { value: "nữ", label: "Nữ" },
                { value: "khác", label: "Khác" },
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