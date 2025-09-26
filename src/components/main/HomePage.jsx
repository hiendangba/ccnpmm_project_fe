import { useState } from "react";
import Button from "../common/Button";
import Picture from "../common/Picture";
import AltAvatar from "../../assets/alt_avatar.png";
import { useNavigate } from "react-router-dom";
import Feed from "./Feed";
import ImageViewer from "./ImageViewer";
import postsApi from "../../api/postsApi";

export default function HomePage({ children, avatar, name, socket }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (images, startIndex = 0) => {
    if (!images || images.length === 0) return;
    setViewerImages(images);
    setViewerIndex(startIndex);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);
  const showPrev = () =>
    setViewerIndex((i) => (i - 1 + viewerImages.length) % viewerImages.length);
  const showNext = () =>
    setViewerIndex((i) => (i + 1) % viewerImages.length);

  return (
    <div className="min-h-screen flex flex-col bg-green-200 relative">
      {!open && (
        <Button
          text="☰"
          variant="hamburger"
          onClick={() => setOpen(true)}
          className="w-12 h-12 absolute top-4 right-4 z-50 opacity-30 hover:opacity-80 transition"
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
        className={`fixed top-0 right-0 h-full w-64
                    bg-white/70 backdrop-blur-lg
                    shadow-lg border-l border-gray-200
                    transform transition-transform duration-300 z-40
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col justify-center items-center mt-6 space-y-2">
          <Picture
            src={avatar || AltAvatar}
            alt="avatar"
            size="lg"
            variant="circle"
            className="w-20 h-20 cursor-pointer"
            onClick={() => navigate("/profile")}
          />
          <p className="text-lg font-semibold text-black drop-shadow-md">
            {name || "Người dùng"}
          </p>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-black drop-shadow-md">
            Zalo UTE
          </h2>
          <ul className="space-y-4 text-lg text-black">
            <li
              className="cursor-pointer hover:text-blue-500 transition-colors duration-200"
              onClick={() => navigate("/home")}
            >
              Trang chủ
            </li>
            <li
              className="cursor-pointer hover:text-blue-500 transition-colors duration-200"
              onClick={() => navigate("/personal-page")}
            >
              Trang cá nhân
            </li>
            <li
              className="cursor-pointer hover:text-blue-500 transition-colors duration-200"
              onClick={() => navigate("/list-member")}
            >
              Danh sách sinh viên
            </li>
            <li
              className="cursor-pointer hover:text-blue-500 transition-colors duration-200"
              onClick={() => navigate("/friend")}
            >
              Bạn bè
            </li>
            <li
              className="cursor-pointer hover:text-blue-500 transition-colors duration-200"
              onClick={() => navigate("/chat")}
            >
              Nhắn tin
            </li>
            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-200">
              Cài đặt
            </li>
            <li
              className="cursor-pointer hover:text-blue-500 transition-colors duration-200"
              onClick={() => navigate("/change-password")}
            >
              Đổi mật khẩu
            </li>
            <li className="cursor-pointer hover:text-blue-500 transition-colors duration-200">
              Đăng xuất
            </li>
          </ul>
        </div>
      </div>

      {children || (
        <div className="mt-6 flex w-full justify-center">
          <div className="w-full max-w-4xl px-4">
            <Feed
              user={user}
              socket={socket}
              postsApi={postsApi}
              limit={5}
              onOpenViewer={openViewer}
              isPersonal={false}
            />
          </div>
        </div>
      )}

      <ImageViewer
        isOpen={viewerOpen}
        images={viewerImages}
        index={viewerIndex}
        onClose={closeViewer}
        onPrev={showPrev}
        onNext={showNext}
      />
    </div>
  );
}
