// OutgoingCallModal.jsx
import Button from "../common/Button";
import AltAvatar from "../../assets/alt_avatar.png";
import Picture from "../common/Picture";

export default function OutgoingCallModal({ conversation, currentUser, onCancel }) {
  if (!conversation) return null;

  const otherMember = !conversation.isGroup
    ? conversation.members.find(m => m.id !== currentUser.id)
    : null;

  const displayName = conversation.isGroup
    ? conversation.name
    : otherMember?.name || "Ai đó";

  const displayAvatar = conversation.isGroup
    ? AltAvatar
    : otherMember?.avatar || AltAvatar;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
        <Picture
          src={displayAvatar}
          alt={displayName}
          size="lg"
          variant="circle"
          className="w-20 h-20 mx-auto mb-3"
        />
        <p className="text-lg font-medium mb-4">
          Đang gọi tới <span className="font-semibold">{displayName}</span>...
        </p>
        <Button
          text="❌ Huỷ cuộc gọi"
          variant="rounded"
          className="border border-gray-300"
          onClick={() => onCancel(conversation.conversationId)} // phải bọc arrow function
        />
      </div>
    </div>
  );
}
