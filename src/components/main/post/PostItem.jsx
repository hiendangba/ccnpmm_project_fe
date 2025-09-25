import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";

export default function PostItem({ post, onOpenViewer, handleToggleLike, handleOpenLikeModal, handleOpenCommentModal }) {
    return (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <Picture src={post.user.avatarUrl ?? AltAvatar} size="sm" variant="circle" className="w-10 h-10" />
                <div>
                    <p className="font-semibold">{post.user.name}</p>
                    <p className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>

            {/* Content */}
            <p className="text-[15px] leading-relaxed">{post.content}</p>

            {/* Images */}
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

            {/* Interactions */}
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


            {/* Action buttons */}
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
    );
}