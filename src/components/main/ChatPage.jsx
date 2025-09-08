import { useState } from 'react';
import MainPage from './HomePage';
import Picture from '../common/Picture';
import AltAvatar from "../../assets/alt_avatar.png";
import InputField from '../common/InputField';
import ChatWindow from './ChatWindow';

// Dữ liệu ảo cho danh sách người dùng
const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: AltAvatar,
    lastMessage: "Chào bạn, hôm nay thế nào?",
    timestamp: "5 giờ",
    unreadCount: 2,
    isOnline: true
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: AltAvatar,
    lastMessage: "Cảm ơn bạn đã giúp đỡ",
    timestamp: "6 giờ",
    unreadCount: 0,
    isOnline: false
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: AltAvatar,
    lastMessage: "Tôi sẽ gửi file cho bạn",
    timestamp: "9 giờ",
    unreadCount: 1,
    isOnline: true
  },
  {
    id: 4,
    name: "Phạm Thị D",
    avatar: AltAvatar,
    lastMessage: "Hẹn gặp lại bạn nhé",
    timestamp: "13 giờ",
    unreadCount: 0,
    isOnline: false
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    avatar: AltAvatar,
    lastMessage: "Bài tập này khó quá",
    timestamp: "15 giờ",
    unreadCount: 3,
    isOnline: true
  }
];


export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <MainPage>
      <div className="flex h-screen bg-white">
        {/* Left Sidebar - Chat List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Tin nhắn</h2>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <InputField
              placeholder="Tìm kiếm cuộc trò chuyện"
              className="w-full"
            />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser?.id === user.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Picture
                      src={user.avatar}
                      alt={user.name}
                      size="md"
                      variant="circle"
                      className="w-12 h-12"
                    />
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {user.timestamp}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {user.lastMessage}
                      </p>
                      {user.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow selectedUser={selectedUser} />
        </div>
      </div>
    </MainPage>
  );
}
