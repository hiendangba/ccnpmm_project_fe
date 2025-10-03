import { useState } from "react";
import { PlusCircle, Pencil } from "lucide-react";
import MainPage from "./HomePage";
import Button from "../common/Button";
import Picture from "../common/Picture";
import AltAvatar from "../../assets/alt_avatar.png";
import CoverPhoto from "../../assets/cover_photo.png";
import postsApi from "../../api/postsApi";
import Feed from "./Feed";
import ImageViewer from "./ImageViewer";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserPage({ socket }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const limit = 5;

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user) return null;

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    const openViewer = (images, startIndex = 0) => {
        if (!images || images.length === 0) return;
        setViewerImages(images);
        setViewerIndex(startIndex);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
        setTimeout(() => {
            setViewerImages([]);
            setViewerIndex(0);
        }, 0);
    };
    const showPrev = () => setViewerIndex((i) => (i - 1 + viewerImages.length) % viewerImages.length);
    const showNext = () => setViewerIndex((i) => (i + 1) % viewerImages.length);

    return (
        <MainPage avatar={user.avatarUrl ?? AltAvatar} name={user.name}>
            <div className="flex flex-col items-center w-full">
                {/* Header: Cover + Avatar + Actions (Facebook-like) */}
                <div className="w-full bg-white shadow-sm">
                    <div className="relative w-full h-72">
                        <img src={CoverPhoto} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute -bottom-16 left-8">
                            <Picture
                                src={user.avatarUrl ?? AltAvatar}
                                size="xl"
                                variant="circle"
                                className="w-36 h-36 border-4 border-white shadow-md"
                            />
                        </div>
                    </div>

                    <div className="mt-20 mx-auto w-[1100px] px-6 pb-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold leading-tight">{user.name}</h1>
                                <p className="text-gray-500 mt-1">{user.bio ?? "Chưa cập nhật"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                  variant="rounded"
                                  className="px-4 border border-gray-300"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Thêm vào tin</span>
                                    </span>
                                </Button>
                                <Button variant="rounded" className="border border-gray-300">
                                    <span className="inline-flex items-center gap-2">
                                        <Pencil className="w-4 h-4" />
                                        <span>Chỉnh sửa trang cá nhân</span>
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mt-4 border-t">
                            <ul className="flex gap-6 text-sm font-medium text-gray-600">
                                <li className="py-3 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 cursor-pointer">Bài viết</li>
                                <li className="py-3 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 cursor-pointer">Giới thiệu</li>
                                <li className="py-3 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 cursor-pointer">Bạn bè</li>
                                <li className="py-3 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 cursor-pointer">Ảnh</li>
                                <li className="py-3 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 cursor-pointer">Video</li>
                                <li className="py-3 border-b-2 border-transparent hover:border-blue-600 hover:text-blue-600 cursor-pointer">Xem thêm</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="mt-6 flex w-[1100px] gap-6">
                    {/* Sidebar */}
                    <div className="flex flex-col w-1/3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h2 className="font-semibold mb-3">Giới thiệu</h2>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p>👤 Họ và tên: {user.name}</p>
                                <p>🆔 Mã sinh viên: {user.mssv}</p>
                                <p>📧 Email: {user.email}</p>
                                <p>
                                    🎂 Ngày sinh:{" "}
                                    {user.dateOfBirth
                                        ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                                        : "Chưa cập nhật"}
                                </p>
                                <p>📝 Tiểu sử: {user.bio ?? "Chưa cập nhật"}</p>
                                <p>⚧ Giới tính: {user.gender ?? "Khác"}</p>
                                <p>🏠 Địa chỉ: {user.address ?? "Chưa cập nhật"}</p>
                            </div>
                        </div>
                    </div>
                    <Feed user={user} socket={socket} postsApi={postsApi} limit={limit} onOpenViewer={openViewer} isPersonal={true} />
                </div>

                <ImageViewer isOpen={viewerOpen} images={viewerImages} index={viewerIndex} onClose={closeViewer} onPrev={showPrev} onNext={showNext} />
            </div>
        </MainPage>
    );
}

