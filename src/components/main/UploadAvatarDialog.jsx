import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../common/dialog";
import Button from "../common/Button"
import { useState } from "react"
import userApi from "../../api/userApi";

export default function UploadAvatarDialog({ open, onOpenChange, file, onCancel, onSave, user }) {
    const [feeling, setFeeling] = useState("");
    const previewUrl = file ? URL.createObjectURL(file) : null;

    const handleSave = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("images", file);
        formData.append("content", feeling);
        formData.append("userId", user.id);
        formData.append("isAvatar", true);

        // goi API
        const result = await userApi.postNew(formData);
        if (result && result.post) {
            console.log(result.post);
            const newAvatarUrl = result.post.user.avatarUrl || result.post.images?.[0];
            setFeeling("");
            onSave(newAvatarUrl);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Đặt ảnh đại diện</DialogTitle>
                    <DialogDescription>
                        Chia sẻ cảm xúc kèm theo ảnh của bạn!!!
                    </DialogDescription>
                </DialogHeader>

                {/* Preview ảnh */}
                <div className="flex flex-col items-center gap-4">
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-40 h-40 rounded-full object-cover border"
                        />
                    )}

                    {/* Nhập cảm xúc */}
                    <textarea
                        placeholder="Bạn đang nghĩ gì?"
                        value={feeling}
                        onChange={(e) => setFeeling(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm resize-none"
                        rows={3}
                    />
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => { setFeeling(""); onCancel(); }}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                    >
                        Lưu
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}