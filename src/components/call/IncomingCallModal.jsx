// src/components/IncomingCallModal.jsx
import React from "react";

export default function IncomingCallModal({
  fromUserId,
  selectedConversation,
  currentUser,
  onAccept,
  onDecline,
}) {
  if (!selectedConversation) return null;

  const isGroup = selectedConversation.isGroup;
  let title = "";
  let description = "";

  if (isGroup) {
    // tìm người gọi trong danh sách
    const caller = selectedConversation.members.find(m => m.id === fromUserId);
    title = `${caller?.name || "Ai đó"} đang gọi nhóm`;
    description = `Cuộc gọi trong nhóm: ${selectedConversation.name}`;
  } else {
    // chat 1-1
    const otherMember = selectedConversation.members.find(
      m => m.id !== currentUser.id
    );
    title = `${otherMember?.name || "Ai đó"} đang gọi bạn`;
    description = "Cuộc gọi riêng";
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>

        {isGroup && (
          <div className="mb-4">
            <p className="font-medium text-sm text-gray-500 mb-2">
              Thành viên trong nhóm:
            </p>
            <ul className="text-sm list-disc list-inside">
              {selectedConversation.members
                .filter(m => m.id !== currentUser.id)
                .map(m => (
                  <li key={m.id}>{m.name}</li>
                ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onDecline}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Từ chối
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
          >
            Chấp nhận
          </button>
        </div>
      </div>
    </div>
  );
}
