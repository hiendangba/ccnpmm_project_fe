import { useState } from "react";
import Button from "../common/Button";
import Picture from '../common/Picture';
import AltAvatar from "../../assets/alt_avatar.png";
import { useNavigate } from "react-router-dom";

export default function HomePage({ children, avatar, name }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-green-200 relative">
      {!open && (
        <Button
          text="☰"
          variant="hamburger"
          onClick={() => setOpen(true)}
          className="w-[70px] h-[70px] absolute top-6 left-6 z-50"
        />
      )}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-30"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 
                    bg-white/70 backdrop-blur-lg
                    shadow-lg
                    border-r-4 border-transparent
                    transform transition-transform duration-300 z-40
                    ${open ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="flex flex-col justify-center items-center mt-8 space-y-3">
          <Picture 
            src={avatar || AltAvatar} 
            alt="avatar" 
            size="lg" 
            variant="circle" 
            className="w-24 h-24" 
            onClick={() => navigate("/profile")} 
          />
          <p className="text-xl font-semibold text-black drop-shadow-md">
            {name || "Người dùng"}
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-bold mb-8 text-black drop-shadow-md">
            Zalo UTE
          </h2>
          <ul className="space-y-6 text-[24px] text-black">
            <li className="cursor-pointer hover:text-blue-500 hover:translate-x-2 transition-transform duration-200">
              Trang chủ
            </li>
            <li className="cursor-pointer hover:text-blue-500 hover:translate-x-2 transition-transform duration-200" onClick={() => navigate("/personal-page")}>
              Trang cá nhân
            </li>
            <li className="cursor-pointer hover:text-blue-500 hover:translate-x-2 transition-transform duration-200" onClick={() => navigate("/list-member")}>
              Danh sách sinh viên
            </li>
            <li className="cursor-pointer hover:text-blue-500 hover:translate-x-2 transition-transform duration-200" onClick={() => navigate("/chat")}>
              Nhắn tin
            </li>
            <li className="cursor-pointer hover:text-blue-500 hover:translate-x-2 transition-transform duration-200">
              Cài đặt
            </li>
            <li className="cursor-pointer hover:text-blue-500 hover:translate-x-2 transition-transform duration-200">
              Đăng xuất
            </li>
          </ul>
        </div>
      </div>

      {children}
    </div>
  );
}
