import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../common/dialog";
import ImageCropper from "../common/ImageCropper";
import userApi from "../../api/userApi";

export default function UploadAvtProfile({ open, onOpenChange, file, onCancel, onSave, user }) {
    const previewUrl = file ? URL.createObjectURL(file) : null;

    const handleCrop = async (croppedBlob) => {
        if (!croppedBlob) return;
        const formData = new FormData();
        formData.append("avatar", croppedBlob);
        try {
            console.log("🚀 Uploading avatar...");
            // Gọi API upload avatar trực tiếp
            const result = await userApi.uploadAvatar(formData);
            console.log("✅ Upload result:", result);

            if (result && result.avatarUrl) {
                console.log("✅ Avatar URL from result.avatarUrl:", result.avatarUrl);
                onSave(result.avatarUrl);
            } else if (result && result.avatar) {
                console.log("✅ Avatar URL from result.avatar:", result.avatar);
                onSave(result.avatar);
            } else if (result && result.name) {
                // Nếu response trả về user object thay vì avatar field
                console.log("✅ Avatar URL from result (user object):", result.avatarUrl || result.avatar);
                onSave(result.avatarUrl || result.avatar);
            } else {
                console.error("❌ Unexpected response format:", result);
                console.log("🔍 Available fields in result:", Object.keys(result || {}));
            }
        } catch (error) {
            console.error("❌ Lỗi upload avatar:", error);
            console.error("📊 Error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Fallback: thử cách cũ nếu API mới chưa có
            try {
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
            } catch (fallbackError) {
                console.error("❌ Fallback upload failed:", fallbackError);
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
