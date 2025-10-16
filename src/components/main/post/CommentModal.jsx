import { useRef, useState, useEffect } from "react";
import Button from "../../common/Button";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";
import { Image as ImageIcon, Send, MessageCircle, X } from "lucide-react";
import CommentItem from "./CommentItem";

export default function CommentModel({
    showCommentModal,
    commentPost,
    handleCloseCommentModal,
    onOpenViewer,
    activeReplyId,
    setActiveReplyId,
    CommentSubmit,
    onPost,
    user,
    handleDeleteComment
}) {
    const [commentContent, setCommentContent] = useState("");
    const [commentImages, setCommentImages] = useState([]);
    const commentFileInputRef = useRef(null);

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

    const handleSubmit = () => {
        if (!commentContent.trim() && commentImages.length === 0) return;
        onPost(commentContent, commentImages);
        setCommentContent("");
        setCommentImages([]);
    };

    // trong CommentModel
    useEffect(() => {
        if (!showCommentModal) {
            setCommentContent("");
            setCommentImages([]);
        }
    }, [showCommentModal]);

    if (!showCommentModal || !commentPost) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCloseCommentModal}>
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
                                handleDeleteComment={handleDeleteComment}
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
                        <Button variant="rounded" className="border border-gray-300 hover:bg-gray-50" onClick={handleOpenCommentPicker}>
                            <span className="inline-flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                <span>Ảnh/Video</span>
                            </span>
                        </Button>
                        <Button
                            variant="rounded"
                            onClick={handleSubmit}
                            className="px-4 border border-gray-300"
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
    );
}