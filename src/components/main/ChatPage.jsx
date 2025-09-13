import { useState, useEffect } from "react";
import MainPage from './HomePage';
import Picture from '../common/Picture';
import InputField from '../common/InputField';
import ChatWindow from './ChatWindow';
import messageApi from "../../api/messageApi";
import AltAvatar from "../../assets/alt_avatar.png"; // ảnh mặc định
import Toast from "../common/Toast";
import { initSocket, joinRoom, leaveRoom, onEvent, offAllEvents } from "../../socket/socket";


export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [toast, setToast] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser.id;
  useEffect(() => {
    let mountedConversations = [];

    const fetchAndInit = async () => {
      try {
        const res = await messageApi.getConversation();
        if (res.success) {
          setConversations(res.data);
          mountedConversations = res.data; // lưu lại
          const socket = initSocket();

          res.data.forEach(conv => joinRoom(conv.conversationId));
          onEvent("receiveMessageChatPage", (message) => {
            setConversations(prev => {
              const updated = prev.map(c =>
                c.conversationId === message.conversationId
                  ? { ...c, lastMessage: message }
                  : c
              );
              return updated.sort((a, b) => {
                const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                return bTime - aTime;
              });
            });
          });

          onEvent("messageReadChatPage", (message) => {
            setConversations(prev => {
              const updated = prev.map(c =>
                c.conversationId === message.conversationId
                  ? { ...c, lastMessage: message }
                  : c
              );
              return updated.sort((a, b) => {
                const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
                const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
                return bTime - aTime;
              });
            });
          }, false);
        }
      } catch(err) {
        const message = err.response?.data?.message || err.message || "Lấy danh sách cuộc trò chuyện thất bại";
        setToast({ type: 'error', message });
      }
    };

    fetchAndInit();

    return () => {
      mountedConversations.forEach(conv => leaveRoom(conv.conversationId));
    };
  }, []);

  const handleConversationSelect = (conv) => {
    setSelectedConversation(conv);
  };

  return (
    <MainPage>
      <div className="flex h-screen bg-white">
        {/* Sidebar danh sách chat */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Tin nhắn</h2>
          </div>

          <div className="p-4 border-b border-gray-200">
            <InputField placeholder="Tìm kiếm cuộc trò chuyện" className="w-full" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const lastMessage = conv.lastMessage;
              const isUnread = lastMessage && lastMessage.senderId !== currentUserId && !lastMessage.readBy?.includes(currentUserId);

              // Tên conversation
              const convName = conv.isGroup
                ? conv.name
                : conv.members.find((m) => m.id !== currentUserId)?.name || "Ai đó";

              let lastMessageText = "Chưa có tin nhắn";
              if (lastMessage) {
                if (lastMessage.attachments?.some(a => a != null)) {
                  // Nếu là ảnh/file
                  if (lastMessage.senderId === currentUserId) {
                    lastMessageText = "Bạn: Đã gửi 1 hình ảnh";
                  } else {
                    const sender = conv.members.find(m => m.id === lastMessage.senderId);
                    lastMessageText = `${sender?.name || "Ai đó"}: Đã gửi 1 hình ảnh`;
                  }
                } else if (lastMessage.content) {
                  // Nếu là text
                  if (lastMessage.senderId === currentUserId) {
                    lastMessageText = `Bạn: ${lastMessage.content}`;
                  } else {
                    const sender = conv.members.find(m => m.id === lastMessage.senderId);
                    lastMessageText = `${sender?.name || "Ai đó"}: ${lastMessage.content}`;
                  }
                }
              }
              return (
                <div
                  key={conv.conversationId}
                  onClick={() => handleConversationSelect(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.conversationId === conv.conversationId
                      ? "bg-blue-50 border-r-4 border-r-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 relative flex items-center">
                        {conv.isGroup
                          ? (
                            <>
                              {conv.members.slice(0,3).map((m,index) => (
                                <img
                                  key={index}
                                  src={m.avatar || AltAvatar}
                                  alt="avatar"
                                  className={`w-6 h-6 rounded-full border-2 border-white
                                    ${index === 0 ? 'z-10' : '-ml-2 z-20'}`}
                                />
                              ))}
                              {conv.members.length > 3 && (
                                <div className="-ml-2 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold border-2 border-white z-30">
                                  +{conv.members.length - 3}
                                </div>
                              )}
                            </>
                          )
                          : (
                            <img
                              src={conv.members[0]?.avatar || AltAvatar}
                              alt={convName}
                              className="w-12 h-12 rounded-full"
                            />
                          )
                        }
                      </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{convName}</h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {lastMessage
                            ? new Date(lastMessage.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                        <p className={`text-sm truncate 
                          ${lastMessage?.senderId === currentUserId ? 'text-gray-900' : 'text-gray-600'} 
                          ${isUnread ? 'font-bold text-black' : ''}`}>
                          {lastMessageText}
                        </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Khung chat */}
        <div className="flex-1 flex flex-col">
          <ChatWindow selectedConversation={selectedConversation} />
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </MainPage>
  );
}
