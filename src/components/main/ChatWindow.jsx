import { useState, useRef, useEffect } from "react";
import Picture from "../common/Picture";
import Button from "../common/Button";
import InputField from "../common/InputField";
import Toast from "../common/Toast";
import AltAvatar from "../../assets/alt_avatar.png";
import { useMessages } from "../../hooks/useMessages";
import { useAuth } from "../../contexts/AuthProvider"; 
import { useCallProvider } from "../../contexts/CallProvider";

import { formatMessageTime, shouldShowTime } from "../../utils/timeUtils";
import IncomingCallModal from "../call/IncomingCallModal";
import OutgoingCallModal from "../call/OutgoingCallModal";
import CallScreen from "../call/CallScreen"

export default function ChatWindow({ selectedConversation }) {
  const { currentUser } = useAuth();
  const [toast, setToast] = useState(null);
  const [activeReaderIndex, setActiveReaderIndex] = useState(null);
  const tooltipRefs = useRef([]);
  const fileInputRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [pastedImage, setPastedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- Sử dụng CallProvider ---
  const { 
    startCall,
    acceptCall,
    declineCall,
    cancelCall,
    incomingCall,
    outgoingCall,
    localStream,
    remoteStreams,
    isCalling,
    activeCall
  } = useCallProvider();

  const { messages, messagesEndRef, containerRef, messageRefs, fetchMessages, sendMessage } =
    useMessages(selectedConversation, currentUser);

  /* tạo/revoke object URL khi pastedImage thay đổi */
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
      sendMessage("", pastedImage);
      setPastedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (messageInput.trim()) {
      sendMessage(messageInput, null);
      setMessageInput("");
    }
  };

  if (!selectedConversation) return (
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

  const otherMember = selectedConversation.members.find(m => m.id !== currentUser.id);
  const convName = selectedConversation.isGroup ? selectedConversation.name : otherMember?.name || "Ai đó";

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Picture
            src={selectedConversation.isGroup ? AltAvatar : (otherMember?.avatar || AltAvatar)}
            alt={convName}
            size="md"
            variant="circle"
            className="w-10 h-10"
          />
          <h3 className="text-lg font-medium text-gray-900">{convName}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            text="📞"
            variant="icon"
            onClick={() => startCall("video",selectedConversation)}
          />
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
            <div key={message.id} data-message={message.id}
              ref={(el) => { messageRefs.current[message.id] = el; }}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMine ? "bg-blue-500 text-white" : "bg-white text-gray-900"}`}>
                {!isMine && selectedConversation.isGroup && <p className="text-xs font-semibold">{sender?.name || "Ai đó"}</p>}

                {message.attachments?.some(a => a != null) ? (
                  <img
                    src={message.attachments.find(a => a != null)?.url}
                    alt="Attachment"
                    className="rounded-lg max-w-full h-auto"
                  />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}

                {shouldShowTime(messages, idx) && <p className={`text-xs mt-1 ${isMine ? "text-blue-100" : "text-gray-500"}`}>{formatMessageTime(message.createdAt)}</p>}
              </div>

              <div className="flex items-center space-x-2 mt-1 relative">
                {readers.map((r, i) => (
                  <div key={i} className="relative">
                    <Picture
                      src={r.avatar ? r.avatar : AltAvatar}
                      alt={r.name}
                      size="xs"
                      variant="circle"
                      className="w-5 h-5 border-2 border-white cursor-pointer"
                      onClick={() =>
                        setActiveReaderIndex(activeReaderIndex === i ? null : i)
                      }
                    />
                    {activeReaderIndex === i && (
                      <div
                        ref={el => (tooltipRefs.current[i] = el)}
                        className="absolute -bottom-5 whitespace-nowrap text-[10px] 
                                        bg-gray-800 text-white px-1 py-0.5 rounded shadow z-50"
                      >
                        {r.name}
                      </div>
                    )}
                  </div>
                ))}
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
            className="flex-1"
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
            variant="primary"
            className="px-4"
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