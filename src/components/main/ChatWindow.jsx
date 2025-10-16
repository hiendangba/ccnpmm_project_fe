import { useState, useRef, useEffect } from "react";
import Picture from "../common/Picture";
import Button from "../common/Button";
import InputField from "../common/InputField";
import Toast from "../common/Toast";
import AltAvatar from "../../assets/alt_avatar.png";
import friendApi from "../../api/friendApi";
import messageApi from "../../api/messageApi";
import { useMessages } from "../../hooks/useMessages";
import { useAuth } from "../../contexts/AuthProvider";
import { useCallProvider } from "../../contexts/CallProvider";
import { formatMessageTime, shouldShowTime } from "../../utils/timeUtils";

export default function ChatWindow({ selectedConversation }) {
  const { currentUser } = useAuth();
  const [toast, setToast] = useState(null);
  const [activeReaderIndex, setActiveReaderIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [pastedImage, setPastedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const groupAvatarRef = useRef(null);

  const otherMember = selectedConversation?.members.find(m => m.id !== currentUser.id);
  const convName = selectedConversation
    ? (selectedConversation.isGroup ? selectedConversation.name : otherMember?.name || "Ai đó")
    : "";

  useEffect(() => {
    setIsCreatingGroup(false);
    setGroupMembers([]);
    setInputValue("");
    setSearchResults([]);
  }, [selectedConversation]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchFriends = async () => {
      const response = await friendApi.searchListFriend({ search: inputValue.trim() });
      if (response.success) {
        const existingMemberIds = [
          currentUser.id,
          ...groupMembers.map(m => m.id),
          ...(selectedConversation.isGroup ? selectedConversation.members.map(m => m.id) : [])
        ];
        const filtered = response.data.listFriend.filter(
          f => !existingMemberIds.includes(f.userId)
        );

        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    };

    fetchFriends();
  }, [inputValue, groupMembers, currentUser.id, selectedConversation]);

  const handleCreateGroupClick = () => {
    if (!selectedConversation.isGroup) {
      setGroupMembers([currentUser, otherMember]);
    }
    setIsCreatingGroup(!isCreatingGroup);
    setInputValue("");
    setSearchResults([]);
  };

  const handleConfirmCreateGroup = async () => {
    if (!groupMembers.length) return;

    if (selectedConversation.isGroup) {
      // API thêm thành viên vào nhóm hiện tại
      console.log("Add members to group:", groupMembers);
    }
    else {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("members", JSON.stringify(groupMembers.filter(m => m.id !== currentUser.id).map(m => m.id)));

      if (groupAvatar) {
        formData.append("avatarGroup", groupAvatar); // gửi file giống sendMessage
      }

      const response = await messageApi.createGroup(formData);
      console.log("Create new group with members:", groupMembers);
      console.log("Response:", response);
    }

    setIsCreatingGroup(false);
    setInputValue("");
    setSearchResults([]);
  };

  const { startCall } = useCallProvider();
  const { messages, messagesEndRef, containerRef, messageRefs, sendMessage } =
    useMessages(selectedConversation, currentUser);

  useEffect(() => {
    if (!pastedImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pastedImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pastedImage]);

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) setPastedImage(file);
        e.preventDefault();
        return;
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPastedImage(file);
  };

  const handleSendMessage = () => {
    if (pastedImage) {
      sendMessage("", pastedImage, null);
      setPastedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (messageInput.trim()) {
      sendMessage(messageInput, null, null);
      setMessageInput("");
    }
  };

  const handleStartCall = () => {
    if (!selectedConversation) return;
    try {
      sendMessage(null, null, "call");
      startCall(selectedConversation, currentUser);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  if (!selectedConversation)
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Chào mừng đến với Zalo UTE
          </h3>
          <p className="text-gray-600">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
        </div>
      </div>
    );

  return (
    <>
      {/* Header */}
      <div className="p-1 pr-6 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Picture
            src={
              selectedConversation.isGroup
                ? selectedConversation.avatar || AltAvatar
                : otherMember?.avatar || AltAvatar
            }
            alt={convName}
            size="md"
            variant="circle"
            className="w-10 h-10"
          />
          <h3 className="text-lg font-medium text-gray-900">{convName}</h3>
        </div>

        <div className="flex items-center space-x-2 mr-20">
          {isCreatingGroup && (
            <div className="relative flex-1">
              {groupMembers.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {groupMembers
                    // Lọc ra chỉ những member **chưa có trong selectedConversation.members** và không phải currentUser
                    .filter(
                      (member) =>
                        member.id !== currentUser.id &&
                        !selectedConversation.members.some((m) => m.id === member.id)
                    )
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        <img
                          src={member.avatar || AltAvatar}
                          alt={member.name}
                          className="w-5 h-5 rounded-full mr-1"
                        />
                        <span>{member.name}</span>
                        <button
                          className="ml-1 text-xs text-red-500"
                          onClick={() =>
                            setGroupMembers((prev) =>
                              prev.filter((m) => m.id !== member.id)
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              )}
              {!selectedConversation.isGroup && (
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Tên nhóm"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <div className="mt-2 flex items-center">
                    <img
                      src={groupAvatar ? URL.createObjectURL(groupAvatar) : AltAvatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full mr-2"
                    />
                    <button
                      onClick={() => groupAvatarRef.current?.click()}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      Chọn ảnh
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={groupAvatarRef}
                      className="hidden"
                      onChange={e => setGroupAvatar(e.target.files[0])}
                    />
                  </div>
                </div>
              )}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tên bạn bè..."
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />

              {searchResults.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow z-50 max-h-40 overflow-y-auto mt-1">
                  {searchResults.map(friend => (
                    <li
                      key={friend.id}
                      className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        // Thêm vào groupMembers
                        if (!groupMembers.find(m => m.id === friend.userId)) {
                          setGroupMembers(prev => [...prev, { id: friend.userId, name: friend.name, avatar: friend.avatar }]);
                        }
                        // Xóa khỏi searchResults
                        setSearchResults(prev => prev.filter(f => f.id !== friend.id));
                        setInputValue("");
                      }}
                    >
                      <img
                        src={friend.avatar || AltAvatar}
                        alt={friend.name}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                      <span className="text-sm">{friend.name}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded"
                onClick={handleConfirmCreateGroup}
              >
                {selectedConversation.isGroup ? "Thêm thành viên" : "Tạo nhóm"}
              </button>
            </div>
          )}
          <Button text="👥" variant="icon" onClick={handleCreateGroupClick} />
          <Button text="📞" variant="icon" onClick={handleStartCall} />
        </div>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, idx) => {
          const isMine = message.senderId === currentUser.id;
          const sender = selectedConversation.members.find(m => m.id === message.senderId);
          const isLastMessageMine = idx === messages.length - 1 && isMine;

          const readers = isLastMessageMine
            ? (message.readBy || [])
              .filter(uid => uid !== currentUser.id)
              .map(uid => selectedConversation.members.find(m => m.id === uid))
              .filter(Boolean)
            : [];

          return (
            <div
              key={message.id || message._id}
              data-message={message.id || message._id}
              ref={(el) => { messageRefs.current[message.id || message._id] = el; }}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMine ? "bg-blue-500 text-white" : "bg-white text-gray-900"
                  }`}
              >
                {!isMine && selectedConversation.isGroup && (
                  <p className="text-xs font-semibold">{sender?.name || "Ai đó"}</p>
                )}

                {message.type === "call" ? (
                  <p className="text-sm">
                    {message.callStatus === "ongoing" && "📞 Cuộc gọi đang diễn ra"}
                    {message.callStatus === "ended" &&
                      `📞 Cuộc gọi kết thúc${message.duration ? ` (${message.duration}s)` : ""}`}
                    {message.callStatus === "missed" && "📞 Cuộc gọi nhỡ"}
                    {message.callStatus === "canceled" && "📞 Cuộc gọi đã hủy"}
                    {message.callStatus === "rejected" && "📞 Cuộc gọi bị từ chối"}
                  </p>
                ) : message.attachments?.some(a => a != null) ? (
                  <img
                    src={message.attachments.find(a => a != null)?.url}
                    alt="Attachment"
                    className="rounded-lg max-w-full h-auto"
                  />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}

                {shouldShowTime(messages, idx) && (
                  <p className={`text-xs mt-1 ${isMine ? "text-blue-100" : "text-gray-500"}`}>
                    {formatMessageTime(message.createdAt)}
                  </p>
                )}
              </div>
              <div className="relative mt-1 h-5 w-20 flex items-center justify-end mr-1 overflow-visible">
                {readers.slice(0, 5).map((r, i) => {
                  const total = Math.min(readers.length, 5);
                  const tooltipAdjust =
                    i >= total - 2
                      ? "-translate-x-[80%]" // lệch phải → kéo vào trong
                      : i <= 1
                        ? "-translate-x-[20%]" // lệch trái → đẩy nhẹ vào
                        : "-translate-x-1/2"; // ở giữa → căn giữa
                  return (
                    <div key={i} className="relative -ml-1 first:ml-0">
                      <img
                        src={r.avatar || AltAvatar}
                        alt={r.name}
                        className="w-4 h-4 rounded-full border-2 border-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReaderIndex(activeReaderIndex === i ? null : i);
                        }}
                      />
                      {activeReaderIndex === i && (
                        <div
                          className={`absolute bottom-full mb-1 left-1/2 ${tooltipAdjust} 
                          text-[10px] bg-gray-800 text-white px-1 py-0.5 rounded shadow z-50 
                          whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis`}
                        >
                          {r.name}
                        </div>
                      )}
                    </div>
                  );
                })}

                {readers.length > 5 && (
                  <div className="relative -ml-1 w-4 h-4 rounded-full bg-gray-300 text-[10px] text-white flex items-center justify-center border-2 border-white">
                    +{readers.length - 5}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input + Preview */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <InputField
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Nhập tin nhắn tới ${convName}`}
            className="flex-1 border border-gray-300"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            onPaste={handlePaste}
          />

          <Button
            text="📎"
            variant="icon"
            className="w-10 h-10"
            onClick={() => fileInputRef.current?.click()}
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            text="📤"
            variant="rounded"
            className="border border-gray-300"
            onClick={handleSendMessage}
          />
        </div>

        {previewUrl && (
          <div className="mt-3 flex justify-center">
            <div className="bg-white p-2 rounded shadow inline-block">
              <img
                src={previewUrl}
                alt="preview"
                className="w-32 h-32 object-cover rounded"
              />
              <div className="flex justify-between mt-2">
                <button
                  className="text-xs text-red-500 mr-2"
                  onClick={() => {
                    setPastedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  ❌ Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </>
  );
}