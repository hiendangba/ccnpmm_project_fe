import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";

export default function PostItem({ post, onOpenViewer, handleToggleLike, handleOpenLikeModal, handleOpenCommentModal, handleOpenShareModal, user}) {
    const navigate = useNavigate();
    const handleGoToProfile = async (userId) => {
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
        <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3 cursor-pointer"  onClick={() => handleGoToProfile(post.user.id)} >
                <Picture src={ post.user.avatarUrl ?? AltAvatar } size="sm" variant="circle" className="w-10 h-10" />
                <div>
                    <p className="font-semibold">{ post.user.name }</p>
                    <p className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>

            {/* Content */}
            <p className="text-[15px] leading-relaxed">{post.content}</p>

            {/* Nếu đây là bài share thì render thêm khung rootPost */}
            {post.rootPost && (
                <div className="mt-3 border rounded-lg bg-gray-50 p-3">
                    {/* Header root post */}
                    <div className="flex items-center gap-3 mb-2">
                        <Picture
                            src={post.rootPost.user.avatarUrl ?? AltAvatar}
                            size="sm"
                            variant="circle"
                            className="w-8 h-8"
                        />
                        <div>
                            <p className="font-semibold text-sm">{post.rootPost.user.name}</p>
                            <p className="text-gray-400 text-xs">
                                {new Date(post.rootPost.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Content root post */}
                    <p className="text-[14px] text-gray-700">{post.rootPost.content}</p>

                    {/* Images root post */}
                    {post.rootPost.images && post.rootPost.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {post.rootPost.images.slice(0, 2).map((src, idx) => (
                                <div
                                    key={idx}
                                    className="relative overflow-hidden rounded-lg border cursor-pointer"
                                    onClick={() => onOpenViewer(post.rootPost.images, idx)}
                                >
                                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                                    <img src={src} className="w-full h-40 object-cover" />
                                    {idx === 1 && post.rootPost.images.length > 2 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                +{post.rootPost.images.length - 2}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
                        <span className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleOpenLikeModal(post, "like")}>
                            <ThumbsUp className="w-4 h-4 fill-blue-600 text-blue-600" />
                            <span>{post.likeCount}</span>
                        </span>
                    )}
                    {post.commentCount > 0 && (
                        <span
                            onClick={() => handleOpenCommentModal(post)}
                            className="cursor-pointer hover:underline"
                        >
                            {post.commentCount} bình luận
                        </span>
                    )}
                </div>
                {post.shareCount > 0 && (
                    <span onClick={() => handleOpenLikeModal(post, "share")} >{post.shareCount} lượt chia sẻ</span>
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
                <button className="py-2 rounded hover:bg-gray-100" onClick={() => handleOpenShareModal(post)}>
                    <span className="inline-flex items-center gap-2 justify-center">
                        <Share2 className="w-4 h-4" />
                        <span>Chia sẻ</span>
                    </span>
                </button>
            </div>

        </div>
    );
}