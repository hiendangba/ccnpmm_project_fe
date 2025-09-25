import Button from "../../common/Button";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";
import { Image as ThumbsUp, X, UserPlus } from "lucide-react";


export default function LikeModel({ showLikeModal, selectedPost, handleCloseLikeModal }) {
    if (!showLikeModal || !selectedPost) return null;

    return (
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
    );
}
