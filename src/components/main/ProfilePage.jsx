import MainPage from './HomePage';
import Picture from '../common/Picture';
import AltAvatar from "../../assets/alt_avatar.png";
import InputField from '../common/InputField';
import Button from '../common/Button';
import Toast from "../common/Toast";
import SelectField from '../common/SelectField';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import userApi from "../../api/userApi";
import { useAuth } from "../../contexts/AuthProvider";

export default function ProfilePage({ avatar, name, mssv, email, dateOfBirth, address, gd }) {
  const { currentUser, updateCurrentUser } = useAuth(); // ✅ Lấy thêm hàm

  const formatDate = (date) =>
    date ? new Date(date).toISOString().split("T")[0] : "";
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || currentUser;

  const initialData = useMemo(
    () => ({
      avatar: user?.avatar || avatar || "",
      name: user?.name || name || "",
      mssv: user?.mssv || mssv || "",
      email: user?.email || email || "",
      dateOfBirth: formatDate(user?.dateOfBirth || dateOfBirth),
      address: user?.address || address || "",
      gender: user?.gender || gd || "nam", // mặc định "nam"
    }),
    [avatar, name, mssv, email, dateOfBirth, address, gd]
  );

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
        setToast({
          type: "success",
          message: "Cập nhật thông tin thành công",
        });

        const formattedResponse = {
          ...response,
          dateOfBirth: response.dateOfBirth
            ? new Date(response.dateOfBirth).toISOString().split("T")[0]
            : "",
        };
        setFormData(formattedResponse);
        // ✅ CẬP NHẬT USER TRONG CONTEXT TOÀN CỤC
        updateCurrentUser(formattedResponse);
      } else {
        setToast({
          type: "warning",
          message: "Cập nhật thông tin thất bại",
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Lưu thông tin thất bại";
      setToast({ type: "error", message });
    }
  };

  return (
    <>
      <MainPage>
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="bg-white/50 py-6 px-8 
                      flex flex-col items-center
                      space-y-5
                      rounded-xl 
                      border border-white 
                      w-full max-w-md"
          >
            <h1
              className="text-3xl text-black 
                        font-bold 
                        drop-shadow-lg text-center"
            >
              Thông tin cá nhân
            </h1>

            <Picture
              src={formData.avatar || AltAvatar}
              alt="avatar"
              size="lg"
              variant="circle"
              onClick={() => navigate("/list-member")}
              className="w-28 h-28 md:w-32 md:h-32 cursor-pointer"
            />

            {/* Input fields */}
            <InputField
              value={formData.name}
              placeholder="Nhập tên của bạn"
              className="w-full border border-gray-300"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <InputField
              value={formData.email}
              placeholder="Nhập email của bạn"
              className="w-full border border-gray-300"
              readOnly
            />
            <InputField
              value={formData.mssv}
              placeholder="Nhập MSSV của bạn"
              className="w-full border border-gray-300"
              readOnly
            />
            <InputField
              value={formData.dateOfBirth}
              placeholder="Nhập ngày sinh của bạn"
              className="w-full border border-gray-300"
              type="date"
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
            <InputField
              value={formData.address}
              placeholder="Nhập địa chỉ của bạn"
              className="w-full border border-gray-300"
              onChange={(e) => handleChange("address", e.target.value)}
            />

            <SelectField
              value={formData.gender || user?.gender || "nam"}
              fieldName="Giới tính"
              variant="rounded"
              className="w-full border border-gray-300"
              onChange={(e) => handleChange("gender", e.target.value)}
              options={[
                { value: "nam", label: "Nam" },
                { value: "nữ", label: "Nữ" },
                { value: "khác", label: "Khác" },
              ]}
            />

            {/* Buttons */}
            <div className="w-full flex flex-col gap-3">
              <Button
                text="Lưu thay đổi"
                variant="rounded"
                className="w-full border border-gray-300"
                onClick={handleSave}
                disabled={!isChanged}
              />
              <Button
                text="Đăng xuất"
                variant="rounded"
                className="w-full border border-gray-300"
              />
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
