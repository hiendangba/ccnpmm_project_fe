import { useEffect, useRef, useState, useCallback } from "react";
import Button from "../common/Button";
import Picture from "../common/Picture";
import AltAvatar from "../../assets/alt_avatar.png";
import { Image as ImageIcon, Send, ThumbsUp, MessageCircle, Share2, X, UserPlus, FolderMinus } from "lucide-react";
import userApi from "../../api/userApi";
import PostComposer from "./post/PostComposer";

const CommentItem = ({ comment, onOpenViewer, depth = 0, activeReplyId, setActiveReplyId, CommentSubmit }) => {
    const isNested = depth > 0;
    const [replyContent, setReplyContent] = useState(""); // nội dung của comment reply
    const [replyImages, setReplyImages] = useState([]);  // hình ảnh của comment reply
    const replyFileInputRef = useRef(null);

    const isReplying = activeReplyId === comment.id;

    const handleReplyClick = () => {
        // Nếu đang mở thì tắt đi, nếu không thì mở form mới
        setActiveReplyId(isReplying ? null : comment.id);
        if (isReplying) {
            setActiveReplyId(null);
            setReplyContent("");
        } else {
            setActiveReplyId(comment.id);
            setReplyContent(`@${comment.user?.name} `);
        }
    };

    const handleOpenReplyCommentPicker = () => replyFileInputRef.current?.click();

    const handleReplyCommentFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setReplyImages((prev) => [...prev, ...files]);
        // Clear file input để có thể chọn cùng file lần nữa
        e.target.value = '';

        // Auto scroll xuống form bình luận khi có ảnh mới
        setTimeout(() => {
            const commentForm = document.querySelector('.comment-form-container');
            if (commentForm) {
                commentForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        }, 100);
    };

    const handleReplySubmit = async () => {

        await CommentSubmit(replyContent, replyImages, comment.id);

        // Reset form
        setReplyContent("");
        setReplyImages([]);
        setActiveReplyId(null);
    };


    return (
        <div className={`mb-4 ${isNested ? 'ml-4' : ''}`}>
            {/* Comment chính */}
            <div className="flex gap-3">
                <Picture
                    src={comment.user?.avatarUrl ?? AltAvatar}
                    size="sm"
                    variant="circle"
                    className="w-10 h-10 flex-shrink-0"
                />
                <div className="flex-1">
                    <div className={`rounded-lg p-3 ${isNested ? 'bg-gray-50 border-l-2 border-blue-200' : 'bg-gray-100'}`}>
                        <p className="font-medium text-sm">{comment.user?.name}</p>
                        <p className="text-sm mt-1">{comment.content}</p>

                        {/* Hiển thị ảnh trong comment */}
                        {comment.images && comment.images.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {comment.images.slice(0, 4).map((src, idx) => (
                                    <div key={idx} className="relative overflow-hidden rounded-lg border cursor-pointer" onClick={() => onOpenViewer(comment.images, idx)}>
                                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                        <img src={src} className="w-full h-24 object-cover" />
                                        {idx === 3 && comment.images.length > 4 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">+{comment.images.length - 4}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>


                    {/* Nút trả lời + thời gian */}
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                        </p>
                        <button
                            onClick={handleReplyClick}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            Trả lời
                        </button>
                    </div>
                    {/* Form trả lời */}
                    {isReplying && (
                        <div className="mt-3 border-t pt-3">
                            <div className="flex gap-3 mb-3">
                                <Picture
                                    src={comment.user?.avatarUrl ?? AltAvatar}
                                    size="sm"
                                    variant="circle"
                                    className="w-10 h-10 flex-shrink-0"
                                />
                                {/* input nhập content  */}
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => {
                                        setReplyContent(e.target.value);
                                        e.target.style.height = "auto";
                                        e.target.style.height =
                                            e.target.scrollHeight + "px";
                                    }}
                                    placeholder="Viết phản hồi..."
                                    className="flex-1 p-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:bg-gray-50 min-h-[2.5rem] max-h-32"
                                    rows={2}
                                />
                            </div>

                            {/* Hiển thị ảnh reply */}
                            {replyImages.length > 0 && (
                                <div className="mb-3 grid grid-cols-2 gap-2">
                                    {replyImages.slice(0, 4).map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="relative overflow-hidden rounded-lg border cursor-pointer"
                                            onClick={() =>
                                                onOpenViewer(
                                                    replyImages.map((f) =>
                                                        URL.createObjectURL(f)
                                                    ),
                                                    idx
                                                )
                                            }
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt=""
                                                className="w-full h-28 object-cover"
                                            />
                                            {/* Xóa ảnh */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReplyImages((prev) =>
                                                        prev.filter(
                                                            (_, i) => i !== idx
                                                        )
                                                    );
                                                }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Nút chọn file + gửi */}
                            <div className="flex items-center justify-between">
                                <input
                                    ref={replyFileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleReplyCommentFilesChange}
                                />
                                <Button
                                    variant="outline"
                                    className="px-3"
                                    onClick={handleOpenReplyCommentPicker}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Ảnh/Video</span>
                                    </span>
                                </Button>
                                <Button
                                    onClick={handleReplySubmit}
                                    className="px-4"
                                    disabled={
                                        !replyContent.trim() &&
                                        replyImages.length === 0
                                    }
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        <span>Gửi</span>
                                    </span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hiển thị comment con */}
            {comment.childs && comment.childs.length > 0 && (
                <div className="mt-3 space-y-3">
                    {comment.childs.map((childComment) => (
                        <CommentItem
                            key={childComment.id}
                            comment={childComment}
                            onOpenViewer={onOpenViewer}
                            depth={depth + 1}
                            activeReplyId={activeReplyId}
                            setActiveReplyId={setActiveReplyId}
                            CommentSubmit={CommentSubmit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Feed({ user, socket, postsApi, limit = 5, onOpenViewer, isPersonal }) {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showLikeModal, setShowLikeModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);


    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentPost, setCommentPost] = useState(null);
    const [commentContent, setCommentContent] = useState("");
    const [commentImages, setCommentImages] = useState([]);
    const [activeReplyId, setActiveReplyId] = useState(null);
    const commentPostRef = useRef(null);

    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const sentinelRef = useRef(null);
    const fileInputRef = useRef(null);
    const commentFileInputRef = useRef(null);


    const fetchNext = useCallback(async () => {
        // Nếu đang load hoặc hết dữ liệu thì thôi
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setIsLoading(true);
        const page = pageRef.current;

        try {
            const result = await postsApi.getAllPost({
                page,
                limit,
                userId: isPersonal ? user.id : ""
            });

            const list = result.listResult || [];

            console.log(list);

            setPosts((prev) => {
                const existing = new Set(prev.map((p) => p.id));
                const unique = list.filter((p) => !existing.has(p.id));
                return [...prev, ...unique];
            });

            // tăng page nếu có dữ liệu
            if (list.length > 0) {
                pageRef.current = pageRef.current + 1;
            }

            // cập nhật flag hasMore
            hasMoreRef.current = (list.length === limit);
            setHasMore(list.length === limit);


        } catch (err) {
            const message = err.response?.data?.message || err.message || "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
    }, [postsApi, limit, isPersonal, user?.id]);

    useEffect(() => {
        commentPostRef.current = commentPost;
    }, [commentPost]);

    useEffect(() => {
        if (!socket) return;
        // Khi có bài viết mới
        socket.on("USER_UPLOAD_POST", (post) => {
            console.log(post);
            if (post.user.id !== user.id) {
                setPosts((prev) => [...prev, post]); // thêm bài viết mới vào state của Feed
            }
        });

        // Khi có like/unlike
        socket.on("USER_LIKE", (likeResponseDTO) => {
            console.log(likeResponseDTO);
            setPosts((prev) =>
                prev.map((p) => {
                    if (p.id === likeResponseDTO.postId) {
                        let updatedLikes;
                        if (likeResponseDTO.liked) {
                            // nếu như đó là like  + thêm user vào list
                            const exists = p.likes.some((like) =>
                                String(like.user.id) === String(likeResponseDTO.likeUser.id)
                            );
                            updatedLikes = exists ? p.likes : [...p.likes, { id: likeResponseDTO.id, createdAt: likeResponseDTO.createdAt, user: likeResponseDTO.likeUser }];
                        }
                        else {
                            // nếu như nó là unlike thì xóa ra
                            updatedLikes = p.likes.filter(
                                (like) => String(like.user.id) !== String(likeResponseDTO.likeUser.id)
                            );
                        }
                        return {
                            ...p,
                            likeCount: likeResponseDTO.liked ? p.likeCount + 1 : p.likeCount - 1,
                            likes: updatedLikes,
                        }
                    }
                    return p;
                })
            );
        });

        // Khi có bình luận mới
        socket.on("USER_COMMENT", (commentResponseDTO) => {
            console.log(commentResponseDTO);
            const savedComment = commentResponseDTO;
            if (commentResponseDTO.user.id !== user.id) {
                // Update lại post bên ngoài
                setPosts((prev) =>
                    prev.map((p) => {
                        if (p.id === savedComment.postId) {
                            return {
                                ...p,
                                commentCount: p.commentCount + 1,
                                commentUsers: addCommentToTree(
                                    p.commentUsers ?? [],
                                    savedComment
                                ),
                            };
                        }
                        return p;
                    })
                );

                if (commentPostRef.current && commentPostRef.current.id === savedComment.postId) {
                    // Update model đang mở 
                    setCommentPost((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            commentCount: prev.commentCount + 1,
                            commentUsers: addCommentToTree(
                                prev.commentUsers ?? [],
                                savedComment
                            ),
                        };
                    });
                }
            }

        });

        return () => {
            socket.off("USER_UPLOAD_POST");
            socket.off("USER_LIKE");
            socket.off("USER_COMMENT");
        };
    }, [socket]);

    useEffect(() => {
        fetchNext();
    }, [fetchNext]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;

        const obs = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    fetchNext();
                }
            },
            { root: null, rootMargin: "300px 0px", threshold: 0 }
        );
        obs.observe(node);
        return () => obs.disconnect();
    }, [fetchNext]);

    const handleOpenPicker = () => fileInputRef.current?.click();
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files]);
    };

    const handlePost = async (content, selectedImages) => {
        if (!content.trim() && selectedImages.length === 0) return;
        const formData = new FormData();
        formData.append("content", content);
        formData.append("originalPostId", "");
        formData.append("rootPostId", "");
        selectedImages.forEach((file) => formData.append("images", file));
        try {
            const result = await userApi.postNew(formData);
            const savedPost = result.post;
            console.log(savedPost);
            if (savedPost) {
                setPosts((prev) => {
                    return [savedPost, ...prev];
                });
                setToast({ message: result.message, type: "success" });
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            await postsApi.likePost({ postId });
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId ? {
                        ...p,
                        liked: !p.liked,
                    } : p
                )
            );
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        }
    };

    const handleOpenLikeModal = (post) => {
        setSelectedPost(post);
        setShowLikeModal(true);
    };

    const handleCloseLikeModal = () => {
        setShowLikeModal(false);
        setSelectedPost(null);
    };

    const handleOpenCommentModal = (post) => {
        setCommentPost(post);
        setShowCommentModal(true);

        // Auto scroll xuống form bình luận khi mở modal
        setTimeout(() => {
            const commentForm = document.querySelector('.comment-form-container');
            if (commentForm) {
                commentForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        }, 300);
    };

    const handleCloseCommentModal = () => {
        setShowCommentModal(false);
        setCommentPost(null);
        setCommentContent("");
        setCommentImages([]);
    };

    const handleOpenCommentPicker = () => commentFileInputRef.current?.click();

    const handleCommentFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setCommentImages((prev) => [...prev, ...files]);
        // Clear file input để có thể chọn cùng file lần nữa
        e.target.value = '';

        // Auto scroll xuống form bình luận khi có ảnh mới
        setTimeout(() => {
            const commentForm = document.querySelector('.comment-form-container');
            if (commentForm) {
                commentForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }
        }, 100);
    };

    const addCommentToTree = (comments, newComment) => {
        if (!newComment.parentCommentId) {
            // comment cấp cao
            return [...comments, newComment];
        }

        // comment reply -> tìm cha
        const addReply = (list) => {
            return list.map(c => {
                if (c.id === newComment.parentCommentId) {
                    return { ...c, childs: [...(c.childs ?? []), newComment] };
                }
                if (c.childs?.length) {
                    return { ...c, childs: addReply(c.childs) };
                }
                return c;
            });
        };

        return addReply(comments);
    };

    const CommentSubmit = async (content, images, parentCommentId = null) => {
        if (!content.trim() && images.length === 0) return;

        const formData = new FormData();
        formData.append("content", content);
        formData.append("postId", commentPost.id);
        if (parentCommentId) {
            formData.append("parentCommentId", parentCommentId);
        }
        images.forEach((file) => formData.append("images", file));

        try {
            const result = await postsApi.commentPost(formData);

            if (result && result.commentResponseDTO) {
                const savedComment = result.commentResponseDTO;

                // Update lại post bên ngoài
                setPosts((prev) =>
                    prev.map((p) => {
                        if (p.id === savedComment.postId) {
                            return {
                                ...p,
                                commentCount: p.commentCount + 1,
                                commentUsers: addCommentToTree(
                                    p.commentUsers ?? [],
                                    savedComment
                                ),
                            };
                        }
                        return p;
                    })
                );

                // Update model đang mở 
                setCommentPost((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        commentCount: prev.commentCount + 1,
                        commentUsers: addCommentToTree(
                            prev.commentUsers ?? [],
                            savedComment
                        ),
                    };
                });

                setToast({
                    message: result.message || "Bình luận thành công",
                    type: "success",
                });
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Thất bại khi gửi bình luận.";
            setToast({ message, type: "error" });
        }
    };

    const handleCommentSubmit = async () => {
        await CommentSubmit(commentContent, commentImages);
        setCommentContent("");
        setCommentImages([]);
    };

    return (
        <div className="flex flex-col w-2/3 gap-4">

            <PostComposer user={user} onPost={handlePost} onOpenViewer={onOpenViewer} />

            {posts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-3 mb-3">
                        <Picture src={user.avatarUrl ?? AltAvatar} size="sm" variant="circle" className="w-10 h-10" />
                        <div>
                            <p className="font-semibold">{post.user.name}</p>
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

                    {/* Hiển thị số lượng tương tác */}
                    <div className="mt-3 pt-3 flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            {post.likeCount > 0 && (
                                <span className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleOpenLikeModal(post)}>
                                    <ThumbsUp className="w-4 h-4 fill-blue-600 text-blue-600" />
                                    <span>{post.likeCount}</span>
                                </span>
                            )}
                            {post.commentCount > 0 && (
                                <span onClick={() => handleOpenCommentModal(post)} >{post.commentCount} bình luận</span>
                            )}
                        </div>
                        {post.shareCount > 0 && (
                            <span>{post.shareCount} lượt chia sẻ</span>
                        )}
                    </div>

                    {/* Các nút hành động */}
                    <div className="border-t pt-3 grid grid-cols-3 text-center text-sm text-gray-600">
                        <button className={`py-2 rounded hover:bg-gray-100 inline-flex items-center gap-2 justify-center 
                            ${post.liked ? "text-blue-600 font-semibold" : "text-gray-700"}`}
                            onClick={() => handleToggleLike(post.id)}
                        >
                            <span className="inline-flex items-center gap-2 justify-center">
                                <ThumbsUp className={`w-4 h-4 ${post.liked ? "fill-blue-600" : ""}`} />
                                <span>Thích</span>
                            </span>
                        </button>
                        <button className="py-2 rounded hover:bg-gray-100" onClick={() => handleOpenCommentModal(post)}>
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

            {/* Modal hiển thị danh sách like users */}
            {showLikeModal && selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseLikeModal}>
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Tất cả</h2>
                            <button onClick={handleCloseLikeModal} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-96 overflow-y-auto">
                            {selectedPost.likes && selectedPost.likes.length > 0 ? (
                                selectedPost.likes.map((like) => (
                                    <div key={like.user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Picture
                                                    src={like.user.avatarUrl ?? AltAvatar}
                                                    size="sm"
                                                    variant="circle"
                                                    className="w-12 h-12"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <ThumbsUp className="w-3 h-3 text-white fill-white" />
                                                </div>
                                            </div>
                                            <span className="font-medium">{like.user.name}</span>
                                        </div>
                                        <Button variant="outline" className="px-3 py-1 text-sm">
                                            <UserPlus className="w-4 h-4 mr-1" />
                                            Thêm bạn bè
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <ThumbsUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Chưa có ai thích bài viết này</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hiển thị danh sách bình luận */}
            {showCommentModal && commentPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseCommentModal}>
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Bình luận</h2>
                            <button onClick={handleCloseCommentModal} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[60vh] overflow-y-auto p-4">
                            {commentPost.commentUsers && commentPost.commentUsers.length > 0 ? (
                                commentPost.commentUsers.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        onOpenViewer={onOpenViewer}
                                        depth={0}
                                        activeReplyId={activeReplyId}
                                        setActiveReplyId={setActiveReplyId}
                                        CommentSubmit={CommentSubmit}
                                    />
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Chưa có bình luận nào</p>
                                </div>
                            )}
                        </div>

                        {/* Form nhập bình luận */}
                        <div className="border-t p-4 comment-form-container">
                            <div className="flex gap-3 mb-3">
                                <Picture src={user.avatarUrl ?? AltAvatar} size="sm" variant="circle" className="w-10 h-10 flex-shrink-0" />
                                <textarea
                                    value={commentContent}
                                    onChange={(e) => {
                                        setCommentContent(e.target.value);
                                        // Auto resize textarea
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    onFocus={() => {
                                        // Auto scroll khi focus vào textarea
                                        setTimeout(() => {
                                            const commentForm = document.querySelector('.comment-form-container');
                                            if (commentForm) {
                                                commentForm.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'end'
                                                });
                                            }
                                        }, 100);
                                    }}
                                    placeholder="Viết bình luận..."
                                    className="flex-1 p-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:bg-gray-50 min-h-[2.5rem] max-h-32"
                                    rows={2}
                                />
                            </div>

                            {commentImages.length > 0 && (
                                <div className="mb-3 grid grid-cols-2 gap-2">
                                    {commentImages.slice(0, 4).map((file, idx) => (
                                        <div key={idx} className="relative overflow-hidden rounded-lg border cursor-pointer" onClick={() => onOpenViewer(commentImages.map(f => URL.createObjectURL(f)), idx)}>
                                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                            <img src={URL.createObjectURL(file)} className="w-full h-28 object-cover" />
                                            {/* Nút xóa ảnh */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCommentImages(prev => prev.filter((_, i) => i !== idx));
                                                }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                            {idx === 3 && commentImages.length > 4 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold">+{commentImages.length - 4}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <input
                                    ref={commentFileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleCommentFilesChange}
                                />
                                <Button variant="outline" className="px-3" onClick={handleOpenCommentPicker}>
                                    <span className="inline-flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Ảnh/Video</span>
                                    </span>
                                </Button>
                                <Button
                                    onClick={handleCommentSubmit}
                                    className="px-4"
                                    disabled={!commentContent.trim() && commentImages.length === 0}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <Send className="w-4 h-4" />
                                        <span>Bình luận</span>
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


