import { useState } from 'react';
import Picture from '../common/Picture';
import Button from '../common/Button';
import InputField from '../common/InputField';

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

export default function ChatWindow({ selectedUser }) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      // Tạo tin nhắn mới
      const newMsg = {
        id: Date.now(), // ID tạm thời
        sender: "me",
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      // Cập nhật danh sách tin nhắn
      setMessages(prev => ({
        ...prev,
        [selectedUser.id]: [
          ...(prev[selectedUser.id] || []),
          newMsg
        ]
      }));

      // Xóa nội dung input
      setNewMessage('');
      
      console.log('Đã gửi tin nhắn:', newMsg.content, 'đến:', selectedUser.name);
    }
  };

  if (!selectedUser) {
    // Welcome Screen
    return (
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
    );
  }

  return (
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

        {messages[selectedUser.id]?.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'me'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900'
                }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
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
  );
}
