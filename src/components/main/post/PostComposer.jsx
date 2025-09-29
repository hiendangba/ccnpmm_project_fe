import { useRef, useState } from "react";
import Button from "../../common/Button";
import Picture from "../../common/Picture";
import AltAvatar from "../../../assets/alt_avatar.png";
import { Image as ImageIcon, Send } from "lucide-react";
export default function PostComposer({
    user, onPost, onOpenViewer
}) {
    const [content, setContent] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);
    const fileInputRef = useRef(null);

    const handleOpenPicker = () => fileInputRef.current?.click();

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files]);
    };

    const handleSubmit = () => {
        if (!content.trim() && selectedImages.length === 0) return;
        onPost(content, selectedImages);
        setContent("");
        setSelectedImages([]);
    };

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex gap-3">
                <Picture
                    src={user?.avatarUrl ?? AltAvatar}
                    size="sm"
                    variant="circle"
                    className="w-10 h-10"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bạn đang nghĩ gì?"
                    className="flex-1 p-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:bg-gray-50"
                    rows={3}
                />
            </div>

            {selectedImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {selectedImages.slice(0, 4).map((file, idx) => (
                        <div
                            key={idx}
                            className="relative overflow-hidden rounded-lg border cursor-pointer"
                            onClick={() =>
                                onOpenViewer(
                                    selectedImages.map((f) => URL.createObjectURL(f)),
                                    idx
                                )
                            }
                        >
                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                            <img
                                src={URL.createObjectURL(file)}
                                className="w-full h-36 object-cover"
                            />
                            {idx === 3 && selectedImages.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white text-xl font-semibold">
                                        +{selectedImages.length - 4}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFilesChange}
                />
                <Button
                    variant="outline"
                    className="px-3"
                    onClick={() => handleOpenPicker(fileInputRef)}
                >
                    <span className="inline-flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Ảnh/Video</span>
                    </span>
                </Button>
                <Button onClick={handleSubmit} className="px-4">
                    <span className="inline-flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>Đăng</span>
                    </span>
                </Button>
            </div>
        </div>
    );
}