import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../common/dialog";
import Button from "../common/Button"
import ImageCropper from "../common/ImageCropper";
import userApi from "../../api/userApi";

export default function UploadAvatarDialog({ open, onOpenChange, file, onCancel, onSave, user }) {
    const previewUrl = file ? URL.createObjectURL(file) : null;

    const handleCrop = async (croppedBlob) => {
        if (!croppedBlob) return;

        const formData = new FormData();
        formData.append("avatar", croppedBlob);

        try {
            // Gọi API upload avatar trực tiếp
            const result = await userApi.uploadAvatar(formData);
            if (result && result.avatar) {
                onSave(result.avatar);
            }
        } catch (error) {
            console.error("Lỗi upload avatar:", error);
            // Fallback: thử cách cũ nếu API mới chưa có
            const fallbackFormData = new FormData();
            fallbackFormData.append("images", croppedBlob);
            fallbackFormData.append("content", "");
            fallbackFormData.append("userId", user.id);
            fallbackFormData.append("isAvatar", true);
            
            const result = await userApi.postNew(fallbackFormData);
            if (result && result.post) {
                const newAvatarUrl = result.post.user.avatarUrl || result.post.images?.[0];
                onSave(newAvatarUrl);
            }
        }
    }

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            // Khi đóng dialog (bấm X hoặc click outside), gọi onCancel
            onCancel();
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa ảnh đại diện</DialogTitle>
                    <DialogDescription>
                        Kéo để di chuyển ảnh và sử dụng zoom để chọn vùng ảnh phù hợp
                    </DialogDescription>
                </DialogHeader>

                {/* Image Cropper */}
                <div className="flex flex-col items-center gap-4">
                    {previewUrl && (
                        <ImageCropper
                            imageUrl={previewUrl}
                            onCrop={handleCrop}
                            onCancel={onCancel}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
