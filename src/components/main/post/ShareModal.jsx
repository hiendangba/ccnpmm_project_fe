import { useState, useEffect } from "react";
import Button from "../../common/Button";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";
import { X, Send, Search } from "lucide-react";

export default function ShareModal({
    showShareModal,
    sharePost,
    handleCloseShareModal,
    user,
    onShare, // callback để gọi API share
}) {
    const [shareContent, setShareContent] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [friends, setFriends] = useState([]); // danh sách gợi ý bạn bè để gửi tin nhắn

    const handleSubmit = () => {
        
        // Tạo payload theo logic rootPostId & originalPostId
        const payload = {
            rootPostId: sharePost.rootPostId ? sharePost.rootPostId : sharePost.id,
            originalPostId: sharePost.id,
            content: shareContent,
        };

        onShare(payload);
        setShareContent("");
        handleCloseShareModal();
    };

    // Reset khi đóng modal
    useEffect(() => {
        if (!showShareModal) {
            setShareContent("");
            setSearchValue("");
        }
    }, [showShareModal]);

    if (!showShareModal || !sharePost) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCloseShareModal}
        >
            <div
                className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Chia sẻ</h2>
                    <button
                        onClick={handleCloseShareModal}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Ô nhập nội dung */}
                    <div className="flex gap-3 mb-4">
                        <Picture
                            src={user.avatarUrl ?? AltAvatar}
                            size="sm"
                            variant="circle"
                            className="w-10 h-10 flex-shrink-0"
                        />
                        <textarea
                            value={shareContent}
                            onChange={(e) => setShareContent(e.target.value)}
                            placeholder="Hãy nói gì đó về nội dung này..."
                            className="flex-1 p-3 bg-gray-100 rounded-xl resize-none focus:outline-none min-h-[4rem]"
                        />
                    </div>

                    {/* Gửi qua Messenger */}
                    <div className="border-t pt-4">
                        <p className="font-medium mb-2">Gửi bằng Messenger</p>

                        {/* Ô tìm kiếm bạn bè */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-2 mb-3">
                            <Search className="w-4 h-4 text-gray-400 mr-2" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Tìm kiếm bạn bè..."
                                className="flex-1 bg-transparent outline-none"
                            />
                        </div>

                        {/* Danh sách bạn bè (fake data) */}
                        <div className="flex gap-3 overflow-x-auto">
                            {friends.length > 0 ? (
                                friends.map((f) => (
                                    <div key={f.id} className="flex flex-col items-center">
                                        <Picture
                                            src={f.user.avatarUrl ?? AltAvatar}
                                            size="sm"
                                            variant="circle"
                                            className="w-12 h-12"
                                        />
                                        <span className="text-xs mt-1">{f.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">Không có bạn bè nào</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-end">
                    <Button
                        variant="rounded"
                        onClick={handleSubmit}
                        disabled={!shareContent.trim()}
                        className="px-4 border border-gray-300"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            <span>Chia sẻ ngay</span>
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
