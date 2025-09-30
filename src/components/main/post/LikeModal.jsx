import Button from "../../common/Button";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";
import {  ThumbsUp, X, UserPlus, Share2 } from "lucide-react";


export default function LikeModel({ show, selectedPost, handleClose, type }) {
    if (!show || !selectedPost) return null;

    // xac dinh data theo type
    const items = type === "like" ? selectedPost.likes : selectedPost.shareUsers;
    const emptyText = type === "like" ? "Chưa có ai thích bài viết này" : "Chưa có ai share bài viết này";
    const title = type === "like" ? "Người đã thích" : "Người đã chia sẻ";
    const icon =
        type === "like" ? (
            <ThumbsUp className="w-3 h-3 text-white fill-white" />
        ) : (
            <Share2 className="w-3 h-3 text-white" />
        );

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                    {items && items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Picture
                                            src={item.user.avatarUrl ?? AltAvatar}
                                            size="sm"
                                            variant="circle"
                                            className="w-12 h-12"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                            <ThumbsUp className="w-3 h-3 text-white fill-white" />
                                        </div>
                                    </div>
                                    <span className="font-medium">{item.user.name}</span>
                                </div>
                                <Button variant="rounded" className="flex items-center px-3 py-1 text-sm border border-gray-300 hover:bg-gray-50">
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Thêm bạn bè
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            {type === "like" ? (
                                <ThumbsUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            ) : (
                                <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            )}
                            <p>{emptyText}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
