import { useState } from 'react';
import MainPage from './HomePage';
import Picture from '../common/Picture';
import AltAvatar from "../../assets/alt_avatar.png";
import Button from '../common/Button';
import InputField from '../common/InputField';

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

// Dữ liệu ảo cho tin nhắn
const mockMessages = {
  1: [
    { id: 1, sender: "other", content: "Chào bạn!", timestamp: "14:30" },
    { id: 2, sender: "me", content: "Chào bạn, hôm nay thế nào?", timestamp: "14:32" },
    { id: 3, sender: "other", content: "Tôi khỏe, cảm ơn bạn", timestamp: "14:35" }
  ],
  2: [
    { id: 1, sender: "other", content: "Cảm ơn bạn đã giúp đỡ", timestamp: "12:00" },
    { id: 2, sender: "me", content: "Không có gì, bạn cần gì thêm không?", timestamp: "12:05" }
  ],
  3: [
    { id: 1, sender: "other", content: "Tôi sẽ gửi file cho bạn", timestamp: "10:00" },
    { id: 2, sender: "me", content: "Cảm ơn bạn", timestamp: "10:02" }
  ],
  4: [
    { id: 1, sender: "other", content: "Hẹn gặp lại bạn nhé", timestamp: "08:00" },
    { id: 2, sender: "me", content: "Chắc chắn rồi!", timestamp: "08:01" }
  ],
  5: [
    { id: 1, sender: "other", content: "Bài tập này khó quá", timestamp: "16:00" },
    { id: 2, sender: "me", content: "Tôi có thể giúp bạn", timestamp: "16:02" },
    { id: 3, sender: "other", content: "Thật không? Cảm ơn bạn nhiều!", timestamp: "16:05" }
  ]
};

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      // Ở đây sẽ thêm logic gửi tin nhắn
      console.log('Gửi tin nhắn:', newMessage, 'đến:', selectedUser.name);
      setNewMessage('');
    }
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
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Picture
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      size="md"
                      variant="circle"
                      className="w-10 h-10"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedUser.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedUser.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      text="📞"
                      variant="icon"
                      className="w-10 h-10"
                    />
                    <Button
                      text="📹"
                      variant="icon"
                      className="w-10 h-10"
                    />
                    <Button
                      text="⋯"
                      variant="icon"
                      className="w-10 h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                <div className="text-center">
                  <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                    Hôm nay
                  </span>
                </div>
                
                {mockMessages[selectedUser.id]?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <InputField
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Nhập tin nhắn tới ${selectedUser.name}`}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    text="😊"
                    variant="icon"
                    className="w-10 h-10"
                  />
                  <Button
                    text="📎"
                    variant="icon"
                    className="w-10 h-10"
                  />
                  <Button
                    text="📤"
                    variant="primary"
                    onClick={handleSendMessage}
                    className="px-4"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Chào mừng đến với Zalo UTE
                </h3>
                <p className="text-gray-600">
                  Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainPage>
  );
}
