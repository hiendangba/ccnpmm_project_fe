import { useRef, useState } from "react";
import Button from "../../common/Button";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";
import { Image as ImageIcon, Send } from "lucide-react";

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
                            className="text-xs text-blue-500 hover:underline cursor-pointer"
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
                                    variant="rounded"
                                    className="border border-gray-300 hover:bg-gray-50 px-3"
                                    onClick={handleOpenReplyCommentPicker}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Ảnh/Video</span>
                                    </span>
                                </Button>
                                <Button
                                    variant="rounded"
                                    onClick={handleReplySubmit}
                                    className="px-4 border border-gray-300"
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

export default CommentItem;