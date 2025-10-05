import { useRef, useState } from "react";
import { PlusCircle, Pencil } from "lucide-react";
import MainPage from "./HomePage";
import Button from "../common/Button";
import Picture from "../common/Picture";
import AltAvatar from "../../assets/alt_avatar.png";
import CoverPhoto from "../../assets/cover_photo.png";
import postsApi from "../../api/postsApi";
import Feed from "./Feed";
import ImageViewer from "./ImageViewer";
import { Eye, Image as ImageIcon } from "lucide-react"

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../common/popover";
import UploadAvatarDialog from "./UploadAvatarDialog";
import friendApi from "../../api/friendApi";
import userApi from "../../api/userApi";


export default function UserPage({ socket }) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.user) {
            setUser(location.state.user);
        }
    }, [location.state]);

    // user có thể cập nhật (avatar, info...)
    const [user, setUser] = useState(location.state?.user ?? null);

    // guest chỉ để hiển thị, không cần state
    const guest = location.state?.guest ?? null;

    // điều hướng khi không có user
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user && !guest) return null;

    const displayUser = guest && user ? guest : user;
    const avatarSrc = displayUser?.avatarUrl ?? AltAvatar;


    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [openPopover, setOpenPopover] = useState(false);
    const [openUploadAvt, setOpenUploadAvt] = useState(false);
    const [selectedFileAvt, setSelectedFileAvt] = useState(null);
    const fileAvtInputRef = useRef(null);
    const limit = 5;
    const [friends, setFriends] = useState([]);



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

    const loadFriends = async () => {
        try {
            const result = await friendApi.getFriend(displayUser.id);
            if (result?.data?.listFriend) {
                setFriends(result.data.listFriend);
            }
        }
        catch (err) {
            console.error("Lỗi khi tải danh sách bạn bè:", err);
        }
    }

    // 👉 gọi API khi vừa vào trang
    useEffect(() => {
        if (displayUser?.id){
            loadFriends();
        }
    }, [displayUser?.id]);

    const viewUserPage =  async (userId)=> {
        // lấy thông tin của user hiện tại
        const result = await userApi.getUserPage( userId );
        if (result?.user){
            if (result.user.id === user.id){
                navigate("/user-page", { state : { user: user }});
            }
            else{
                navigate("/user-page", { state: { guest: result.user, user: user } });
            }
        }
    }

    return (
        <MainPage avatar={avatarSrc} name={displayUser?.name}>
            <div className="flex flex-col items-center w-full">
                {/* Header: Cover + Avatar + Actions (Facebook-like) */}
                <div className="w-full bg-white shadow-sm">
                    <div className="relative w-full h-72">
                        <img src={CoverPhoto} alt="Cover" className="w-full h-full object-cover rounded-lg" />

                        {/* Avatar + Popover */}
                        <div className="absolute -bottom-16 left-8">
                            <Popover open={openPopover} onOpenChange={setOpenPopover} >
                                <PopoverTrigger asChild>
                                    <div className="cursor-pointer">
                                        <Picture
                                            src={avatarSrc}
                                            size="xl"
                                            variant="circle"
                                            className="w-36 h-36 border-4 border-white shadow-md"
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2">
                                    <button className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded" onClick={() => { openViewer([avatarSrc], 0); setOpenPopover(false); }}>
                                        <Eye className="h-4 w-4" /> Xem ảnh đại diện
                                    </button>
                                    {/* Nếu là user (không có guest) thì mới hiện các lựa chọn */}
                                    {!guest && (
                                        <>
                                            <button
                                                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                                                onClick={() => fileAvtInputRef.current?.click()}
                                            >
                                                <ImageIcon className="h-4 w-4" /> Chọn ảnh đại diện
                                            </button>

                                            {/* hidden file input */}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileAvtInputRef}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setOpenPopover(false);
                                                        setSelectedFileAvt(file);
                                                        setOpenUploadAvt(true);
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    {/* Info + Actions */}
                    <div className="mt-20 mx-auto w-[1100px] px-6 pb-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold leading-tight">{displayUser?.name}</h1>
                                <p className="text-gray-500 mt-1">{displayUser?.bio ?? "Chưa cập nhật"}</p>
                            </div>
                            {/* Nếu không có guest (chính chủ) thì mới hiện nút */}
                            {!guest && (
                              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                <Button 
                                  variant="rounded"
                                  className="px-4 border border-gray-300"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Thêm vào tin</span>
                                  </span>
                                </Button>
                                <Button 
                                  variant="rounded"
                                  className="border border-gray-300"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <Pencil className="w-4 h-4" />
                                    <span>Chỉnh sửa trang cá nhân</span>
                                  </span>
                                </Button>
                              </div>
                            )}
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
                    <div className="flex flex-col w-1/3 gap-4 sticky top-24 overflow-y-auto max-h-[calc(100vh-150px)]">
                        {/* Giới thiệu */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h2 className="font-semibold mb-3">Giới thiệu</h2>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p>👤 Họ và tên: {displayUser?.name}</p>
                                <p>🆔 Mã sinh viên: {displayUser?.mssv}</p>
                                <p>📧 Email: {displayUser?.email}</p>
                                <p>
                                    🎂 Ngày sinh:{" "}
                                    {displayUser?.dateOfBirth
                                        ? new Date(displayUser?.dateOfBirth).toLocaleDateString("vi-VN")
                                        : "Chưa cập nhật"}
                                </p>
                                <p>📝 Tiểu sử: {displayUser?.bio ?? "Chưa cập nhật"}</p>
                                <p>⚧ Giới tính: {displayUser?.gender ?? "Khác"}</p>
                                <p>🏠 Địa chỉ: {displayUser?.address ?? "Chưa cập nhật"}</p>
                            </div>
                        </div>
                        {/* Danh sách bạn bè */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h2 className="font-semibold mb-3">Bạn bè</h2>
                            {friends && friends.length > 0 ? (
                                friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="flex items-center gap-3 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                                        onClick={()=> viewUserPage(friend.userId)}
                                    >
                                        <img
                                            src={friend.avatar || AltAvatar}
                                            alt={friend.name}
                                            className="w-10 h-10 rounded-full object-cover border"
                                        />
                                        <span className="text-sm font-medium text-gray-800">{friend.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Chưa có bạn bè nào</p>
                            )}
                        </div>

                    </div>
                    <Feed key={displayUser?.id} user={user} displayUser={displayUser} guest={guest} socket={socket} postsApi={postsApi} limit={limit} onOpenViewer={openViewer} isPersonal={true} />
                </div>

                <ImageViewer isOpen={viewerOpen} images={viewerImages} index={viewerIndex} onClose={closeViewer} onPrev={showPrev} onNext={showNext} />
            </div>
            <UploadAvatarDialog
                open={openUploadAvt}
                onOpenChange={setOpenUploadAvt}
                file={selectedFileAvt}
                onCancel={() => setOpenUploadAvt(false)}
                onSave={async (newAvatarUrl) => {
                    const updatedUser = { ...user, avatarUrl: newAvatarUrl };
                    setUser(updatedUser);

                    localStorage.setItem("user", JSON.stringify(updatedUser));

                    setOpenUploadAvt(false);
                    setSelectedFileAvt(null);
                }}
                user={user}
            />
        </MainPage>
    );
}

