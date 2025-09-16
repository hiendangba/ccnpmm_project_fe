import { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import Picture from "../common/Picture";
import AltAvatar from "../../assets/alt_avatar.png";
import { Image as ImageIcon, Send, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import userApi from "../../api/userApi";
import InputField from "../common/InputField";

export default function Feed({ user, socket, postsApi, limit = 2, onOpenViewer, userId }) {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const sentinelRef = useRef(null);
    const fileInputRef = useRef(null);
    const loadingPageRef = useRef(null);

    const fetchPosts = async (page = currentPage) => {
        try {
            if (isLoading || !hasMore) return;
            if (loadingPageRef.current === page) return;
            loadingPageRef.current = page;
            setIsLoading(true);

            const result = await postsApi.getAllPost({
                page,
                limit,
                userId: userId !== undefined ? userId : user.id,
            });

            const list = result.listResult || [];
            setPosts((prev) => {
                const existing = new Set(prev.map((p) => p.id));
                const unique = list.filter((p) => !existing.has(p.id));
                return [...prev, ...unique];
            });
            setCurrentPage(page + 1);
            setHasMore(list.length === limit);
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        } finally {
            setIsLoading(false);
            loadingPageRef.current = null;
        }
    };
    useEffect(() => {
        if (!socket) return;
        socket.on("USER_UPLOAD_POST", (post) => {
            setPosts((prev) => [...prev, post]); // thêm bài viết mới vào state của Feed
        });

        return () => socket.off("USER_UPLOAD_POST");
    }, [socket]);

    useEffect(() => {
        fetchPosts(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hasMore) return;
        const node = sentinelRef.current;
        if (!node) return;
        const obs = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !isLoading) {
                    fetchPosts(currentPage);
                }
            },
            { root: null, rootMargin: "300px 0px", threshold: 0 }
        );
        obs.observe(node);
        return () => obs.disconnect();
    }, [hasMore, isLoading, currentPage]);

    const handleOpenPicker = () => fileInputRef.current?.click();
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files]);
    };

    const handlePost = async () => {
        if (!content.trim() && selectedImages.length === 0) return;
        const formData = new FormData();
        formData.append("content", content);
        formData.append("originalPostId", "");
        formData.append("rootPostId", "");
        selectedImages.forEach((file) => formData.append("images", file));
        try {
            const result = await userApi.postNew(formData);
            const savedPost = result.post;
            if (savedPost && savedPost.id) {
                setPosts((prev) => [savedPost, ...prev]);
                setContent("");
                setSelectedImages([]);
                setToast({ message: result.message, type: "success" });
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        }
    };

    return (
        <div className="flex flex-col max-w-[700px] w-full mx-auto gap-4">
            {/* Composer */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex gap-3">
                    <Picture src={user.avatarUrl ?? AltAvatar} variant="circle" className="w-20 h-20" />
                    <InputField
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Bạn đang nghĩ gì?"
                        variant="ghost"
                        className="h-[100px] text-[20px]"
                        rows={3}
                    />
                    
                </div>
                {selectedImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {selectedImages.slice(0, 4).map((file, idx) => (
                            <div key={idx} className="relative overflow-hidden rounded-lg border cursor-pointer" onClick={() => onOpenViewer(selectedImages.map(f => URL.createObjectURL(f)), idx)}>
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
                    {post.images && post.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {post.images.slice(0, 4).map((src, idx) => (
                                <div key={idx} className="relative overflow-hidden rounded-lg border cursor-pointer" onClick={() => onOpenViewer(post.images, idx)}>
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

            <div ref={sentinelRef} className="h-1"></div>
            {isLoading && (
                <div className="text-center text-sm text-gray-500 py-3">Đang tải...</div>
            )}
            {!hasMore && posts.length > 0 && (
                <div className="text-center text-sm text-gray-400 py-3">Đã hiển thị tất cả bài viết</div>
            )}
        </div>
    );
}


