import { useState } from "react";
import userApi from "../../api/userApi";
import PostComposer from "./post/PostComposer";
import CommentModel from "./post/CommentModal";
import LikeModal from "./post/LikeModal";
import PostItem from "./post/PostItem";
import ShareModal from "./post/ShareModal";
import Toast from "../common/Toast"; // thêm import Toast

import usePostsFeed from "../../hooks/usePostsFeed";
import useSocketFeed from "../../hooks/useSocketFeed";

export default function Feed({ user, socket, postsApi, limit = 5, onOpenViewer, isPersonal }) {
    const [toast, setToast] = useState(null);

    // modal Like
    const [showLikeModal, setShowLikeModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // modal Comment
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentPost, setCommentPost] = useState(null);
    const [activeReplyId, setActiveReplyId] = useState(null);

    // modal Share 
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharePost, setSharePost] = useState(null);

    const [modalType, setModalType] = useState("like");

    // ----- dùng hook quản lý posts -----
    const { posts, setPosts, isLoading, hasMore, sentinelRef } = usePostsFeed({
        postsApi,
        user,
        isPersonal,
        limit,
    });

    // ----- dùng hook socket -----
    const { addCommentToTree } = useSocketFeed({
        socket,
        user,
        isPersonal,
        setPosts,
        commentPost,
        setCommentPost,
    });

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
            if (savedPost) {
                setPosts((prev) => [savedPost, ...prev]);
                setToast({ message: result.message, type: "success" });
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            await postsApi.likePost({ postId });
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId ? { ...p, liked: !p.liked } : p
                )
            );
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        }
    };

    const handleOpenLikeModal = (post,type) => {
        setSelectedPost(post);
        setModalType(type);
        setShowLikeModal(true);
    };

    const handleCloseLikeModal = () => {
        setShowLikeModal(false);
        setSelectedPost(null);
    };

    const handleOpenShareModal = (post) => {
        setSharePost(post);
        setShowShareModal(true);
    };

    const handleCloseShareModal = () => {
        setShowShareModal(false);
        setSharePost(null);
    };

    const handleOpenCommentModal = (post) => {
        setCommentPost(post);
        setShowCommentModal(true);

        // Auto scroll xuống form bình luận khi mở modal
        setTimeout(() => {
            const commentForm = document.querySelector(".comment-form-container");
            if (commentForm) {
                commentForm.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        }, 300);
    };

    const handleCloseCommentModal = () => {
        setShowCommentModal(false);
        setCommentPost(null);
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
                    prev.map((p) =>
                        p.id === savedComment.postId
                            ? {
                                  ...p,
                                  commentCount: p.commentCount + 1,
                                  commentUsers: addCommentToTree(
                                      p.commentUsers ?? [],
                                      savedComment
                                  ),
                              }
                            : p
                    )
                );

                // Update model đang mở
                setCommentPost((prev) =>
                    prev
                        ? {
                              ...prev,
                              commentCount: prev.commentCount + 1,
                              commentUsers: addCommentToTree(
                                  prev.commentUsers ?? [],
                                  savedComment
                              ),
                          }
                        : prev
                );

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

    const handleCommentSubmit = async (commentContent, commentImages) => {
        await CommentSubmit(commentContent, commentImages);
    };

    const handleShareSubmit = async ( payload ) => {
         try {
            const result = await postsApi.sharePost( payload );
            console.log(result.sharePostResponseDTO);
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Thất bại khi kết nối với máy chủ.";
            setToast({ message, type: "error" });
        }
    }
    

    return (
        <div className="flex flex-col w-full max-w-xl mx-auto gap-4 relative">
            <PostComposer user={user} onPost={handlePost} onOpenViewer={onOpenViewer} />

            {posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    onOpenViewer={onOpenViewer}
                    handleToggleLike={handleToggleLike}
                    handleOpenLikeModal={handleOpenLikeModal}
                    handleOpenCommentModal={handleOpenCommentModal}
                    handleOpenShareModal={handleOpenShareModal}
                />
            ))}

            <div ref={sentinelRef} className="h-1"></div>
            {isLoading && (
                <div className="text-center text-sm text-gray-500 py-3">Đang tải...</div>
            )}
            {!hasMore && posts.length > 0 && (
                <div className="text-center text-sm text-gray-400 py-3">
                    Đã hiển thị tất cả bài viết
                </div>
            )}

            <LikeModal show={showLikeModal} selectedPost={selectedPost} handleClose={handleCloseLikeModal} type={modalType} />
            <LikeModal
                showLikeModal={showLikeModal}
                selectedPost={selectedPost}
                handleCloseLikeModal={handleCloseLikeModal}
            />

            <CommentModel
                showCommentModal={showCommentModal}
                commentPost={commentPost}
                handleCloseCommentModal={handleCloseCommentModal}
                onOpenViewer={onOpenViewer}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                CommentSubmit={CommentSubmit}
                onPost={handleCommentSubmit}
                user={user}
            />

            <ShareModal showShareModal={showShareModal} sharePost={sharePost} handleCloseShareModal={handleCloseShareModal} user={user} onShare={handleShareSubmit} />

            {toast && (
                <Toast
                    key={toast.message + toast.type}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
