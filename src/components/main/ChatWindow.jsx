import { useState, useEffect } from 'react';
import Picture from '../common/Picture';
import Button from '../common/Button';
import InputField from '../common/InputField';
import messageApi from "../../api/messageApi"
import Toast from "../common/Toast";
import { initSocket } from '../../socket/socket';

export default function ChatWindow({ selectedUser }) {
  const [newMessage, setNewMessage] = useState('');
  const [mockMessage,setMockMessage] = useState([]);
  const [toast, setToast] = useState(null);
  const [conversationId, setConversationId] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    initSocket(conversationId, 
      (message) => {
        if(message.senderId != user.id)
          setMockMessage(prev => [...prev, message]);
      }
    );
  }, [conversationId]);


  const fetchGetMessage = async () => {
    try {
      const res = await messageApi.getMessageOneToOne({
        receiverId: selectedUser.id,
      });
      setMockMessage(res.data.messages); // giả sử API trả về mảng sinh viên
      setConversationId(res.data.conversationId)
    } catch (err) {
      const message = err.response?.data?.message || err.message || "lấy thông tin users thất bại";
      setToast({ type: 'error', message });      
    }
  };


  useEffect(() => {
      fetchGetMessage();
    }, [selectedUser]
  );


  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedUser) {
      const res = await messageApi.sendMessage({conversationId: conversationId, content: newMessage})
      console.log(res);

      // Ở đây sẽ thêm logic gửi tin nhắn
      setMockMessage((prev) => [...prev, {
        _id: Date.now(), // tạm id
        content: newMessage,
        senderId: user.id,

      }]);

      setNewMessage('')
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

        {mockMessage.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === user.id 
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900'
                }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${message.senderId === user.id  ? 'text-blue-100' : 'text-gray-500'
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
