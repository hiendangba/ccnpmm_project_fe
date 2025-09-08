import { useState, useRef } from "react";
import { PlusCircle, Pencil, Image as ImageIcon, CalendarDays, Send, ThumbsUp, MessageCircle, Share2, X, ChevronLeft, ChevronRight } from "lucide-react";
import MainPage from "./HomePage";
import Button from "../common/Button";
import Toast from "../common/Toast";
import Picture from "../common/Picture";
import AltAvatar from "../../assets/alt_avatar.png";
import CoverPhoto from "../../assets/cover_photo.png";
import userApi from "../../api/userApi";
import axiosClient from "../../api/axiosClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    // Lấy từ localStorage nếu có, nếu không có thì chuyển sang trang đăng nhập

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user) return null;

    const [posts, setPosts] = useState([]);

    const [content, setContent] = useState(""); // phá vỡ cấu trúc mãng , useState là 1 đối tượng chứa giá trị ban đầu và 1 hàm set lại giá trị
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [selectedImages, setSelectedImages] = useState([]);
    const fileInputRef = useRef(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    const handlePost = async () => {
        if (!content.trim() && selectedImages.length === 0) return;

        const formData = new FormData();
        formData.append("content", content);
        formData.append("originalPostId", "");
        formData.append("rootPostId", "");

        selectedImages.forEach((file) => {
            formData.append("images", file); // "images" khớp với Multer
        });

        try {
            const result = await axiosClient.post("/user/postNew", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // ghi đè header chỉ cho request này
                },
            });

            console.log("Response from server:", result); // Debug response (đã được interceptor xử lý)
            
            // Vì interceptor đã trả về response.data, nên result chính là data từ server
            const savedPost = result.post;
            console.log("Saved post:", savedPost); // Debug log
            
            if (savedPost && savedPost.id) {
                setPosts([savedPost, ...posts]);
                setContent("");
                setSelectedImages([]);
                setToast({ show: true, message: result?.message || "Đăng bài thành công!", type: "success" });
            } else {
                console.error("No valid post data received from server");
                console.error("Received data:", result);
                setToast({ show: true, message: "Không nhận được dữ liệu bài viết hợp lệ từ server", type: "error" });
            }

        } catch (err) {
            console.log(err.response);
            const message =
                err.response?.data?.message ||
                JSON.stringify(err.response?.data) ||
                err.message ||
                "Thất bại khi kết nối với máy chủ.";
            setToast({show: true,  message, type: "error" });
        }
    };

    const handleOpenPicker = () => fileInputRef.current?.click(); // mở hộp thoại bằng một bút bên ngoài

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files]);
    };

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
                                <Button className="px-4">
                                    <span className="inline-flex items-center gap-2">
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Thêm vào tin</span>
                                    </span>
                                </Button>
                                <Button variant="outline" className="px-4">
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
                                <p>🎂 Ngày sinh: {user.dateOfBirth ? user.dateOfBirth.toLocaleDateString() : "Chưa cập nhật"}</p>
                                <p>📝 Tiểu sử: {user.bio ?? "Chưa cập nhật"}</p>
                                <p>⚧ Giới tính: {user.gender ?? "Khác"}</p>
                                <p>🏠 Địa chỉ: {user.address ?? "Chưa cập nhật"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="flex flex-col w-2/3 gap-4">
                        {/* Composer */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex gap-3">
                                <Picture src={user.avatarUrl ?? AltAvatar} size="sm" variant="circle" className="w-10 h-10" />
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Bạn đang nghĩ gì?"
                                    className="flex-1 p-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:bg-gray-50"
                                    rows={3}
                                />
                            </div>
                            {/* Previews */}
                            {selectedImages.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {selectedImages.slice(0, 4).map((file, idx) => (
                                        <div key={idx} className="relative overflow-hidden rounded-lg border cursor-pointer" onClick={() => openViewer(selectedImages.map(f => URL.createObjectURL(f)), idx)}>
                                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                            <img src={URL.createObjectURL(file)} className="w-full h-36 object-cover" />
                                            {idx === 3 && selectedImages.length > 4 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white text-xl font-semibold">+{selectedImages.length - 4}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 mt-3">
                                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFilesChange} />
                                <Button variant="outline" className="px-3" onClick={handleOpenPicker}>
                                    <span className="inline-flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Ảnh/Video</span>
                                    </span>
                                </Button>
                                <Button onClick={handlePost} className="px-4">
                                    <span className="inline-flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        <span>Đăng</span>
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {posts.map((post) => (
                            <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-center gap-3 mb-3">
                                    <Picture src={user.avatarUrl ?? AltAvatar} size="sm" variant="circle" className="w-10 h-10" />
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className="text-[15px] leading-relaxed">{post.content}</p>
                                {/* Post images */}
                                {post.images && post.images.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {post.images.slice(0, 4).map((src, idx) => (
                                            <div key={idx} className="relative overflow-hidden rounded-lg border cursor-pointer" onClick={() => openViewer(post.images, idx)}>
                                                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                                <img src={src} className="w-full h-60 object-cover" />
                                                {idx === 3 && post.images.length > 4 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <span className="text-white text-2xl font-semibold">+{post.images.length - 4}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-3 border-t pt-3 grid grid-cols-3 text-center text-sm text-gray-600">
                                    <button className="py-2 rounded hover:bg-gray-100">
                                        <span className="inline-flex items-center gap-2 justify-center">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>Thích</span>
                                        </span>
                                    </button>
                                    <button className="py-2 rounded hover:bg-gray-100">
                                        <span className="inline-flex items-center gap-2 justify-center">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>Bình luận</span>
                                        </span>
                                    </button>
                                    <button className="py-2 rounded hover:bg-gray-100">
                                        <span className="inline-flex items-center gap-2 justify-center">
                                            <Share2 className="w-4 h-4" />
                                            <span>Chia sẻ</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {toast.show && <Toast message={toast.message} type={toast.type} />}

                {/* Image viewer (lightbox) */}
                {viewerOpen && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={closeViewer}>
                        <button className="absolute top-4 left-4 text-white z-10" onClick={(e) => { e.stopPropagation(); closeViewer(); }}>
                            <X className="w-7 h-7" />
                        </button>
                        <button className="absolute left-14 text-white z-10" onClick={(e) => { e.stopPropagation(); showPrev(); }}>
                            <ChevronLeft className="w-10 h-10" />
                        </button>
                        <div onClick={(e) => e.stopPropagation()} className="z-0">
                            <img src={viewerImages[viewerIndex]} alt="preview" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl object-contain" />
                        </div>
                        <button className="absolute right-4 text-white z-10" onClick={(e) => { e.stopPropagation(); showNext(); }}>
                            <ChevronRight className="w-10 h-10" />
                        </button>
                        <div className="absolute bottom-6 text-white text-sm">
                            {viewerIndex + 1} / {viewerImages.length}
                        </div>
                    </div>
                )}
            </div>
        </MainPage>
    );
}

