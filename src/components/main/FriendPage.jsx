import { useState } from "react";
import MainPage from "./HomePage";
import Picture from "../common/Picture";
import InputField from "../common/InputField";
import Button from "../common/Button";
import AltAvatar from "../../assets/alt_avatar.png";
import Toast from "../common/Toast";

export default function FriendPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([
    { id: 1, name: "Nguyễn Văn A", avatar: AltAvatar, status: "friend" },
    { id: 2, name: "Trần Thị B", avatar: AltAvatar, status: "friend" },
    { id: 3, name: "Lê Văn C", avatar: AltAvatar, status: "friend" },
    { id: 10, name: "Hoàng Minh", avatar: AltAvatar, status: "stranger" },
    { id: 11, name: "Phạm Thanh", avatar: AltAvatar, status: "stranger" },
    { id: 101, name: "Ngô Thị D", avatar: AltAvatar, status: "requested", message: "Kết bạn nhé" },
    { id: 102, name: "Phan Văn E", avatar: AltAvatar, status: "requested", message: "Kết bạn nhé" },
  ]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddFriend = (user) => {
    setSelectedUser(user);
    setMessage("");
  };

  const handleSendFriendRequest = () => {
    setToast({
      type: "success",
      message: `Đã gửi lời mời kết bạn đến ${selectedUser.name} với lời nhắn: "${message || "Xin chào!"}"`,
    });

    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id ? { ...u, status: "requested", message } : u
      )
    );

    setSelectedUser(null);
  };

  const handleAccept = (req) => {
    setToast({ type: "success", message: `Đã chấp nhận ${req.name}` });

    setUsers(prev =>
      prev.map(u =>
        u.id === req.id ? { ...u, status: "friend", message: undefined } : u
      )
    );
  };

  const handleReject = (req) => {
    setToast({ type: "info", message: `Đã từ chối ${req.name}` });

    setUsers(prev =>
      prev.map(u =>
        u.id === req.id ? { ...u, status: "stranger", message: undefined } : u
      )
    );
  };

  return (
    <MainPage>
      <div className="flex flex-col h-screen bg-white">
        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b border-gray-200">
          <InputField
            placeholder="🔎︎ Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {searchTerm === "" ? (
            <>
              {/* Danh sách bạn bè */}
              <h3 className="text-[24px] font-medium mb-2">Danh sách bạn bè</h3>
              {users.filter(u => u.status === "friend").length === 0 ? (
                <p className="text-gray-500 text-[20px]">Chưa có bạn bè nào</p>
              ) : (
                users
                  .filter(u => u.status === "friend")
                  .map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-3 p-3 border-b border-gray-100 hover:bg-gray-50"
                    >
                      <Picture src={friend.avatar} className="w-20 h-20" />
                      <p className="text-[20px] font-medium text-gray-900">{friend.name}</p>
                    </div>
                  ))
              )}

              {/* Lời mời kết bạn */}
              <h3 className="text-[24px] font-medium mt-4 mb-2">Lời mời kết bạn</h3>
              {users.filter(u => u.status === "requested").length === 0 ? (
                <p className="text-gray-500 text-[20px]">Không có lời mời nào</p>
              ) : (
                users
                  .filter(u => u.status === "requested")
                  .map(req => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Picture src={req.avatar} className="w-20 h-20" />
                        <div>
                          <p className="text-[20px] font-medium text-gray-900">{req.name}</p>
                          <p className="text-[18px] text-gray-500">{req.message}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button text="Chấp nhận" onClick={() => handleAccept(req)} variant="rounded" />
                        <Button text="Từ chối" onClick={() => handleReject(req)} variant="rounded" />
                      </div>
                    </div>
                  ))
              )}
            </>
          ) : (
            <>
              <h3 className="text-[24px] font-medium mb-2">Kết quả tìm kiếm</h3>
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-[20px]">Không tìm thấy kết quả</p>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Picture src={u.avatar} className="w-20 h-20" />
                      <div className="flex-1">
                        <p className="text-[20px] font-medium text-gray-900">{u.name}</p>
                        <p className="text-[18px] text-gray-500">
                          {u.status === "friend"
                            ? "Đã là bạn bè"
                            : u.status === "requested"
                            ? "Đang chờ phản hồi"
                            : "Người lạ"}
                        </p>
                      </div>
                    </div>
                    {u.status === "stranger" && (
                      <Button
                        text="Kết bạn"
                        onClick={() => handleOpenAddFriend(u)}
                        variant="rounded"
                      />
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Modal nhập lời nhắn */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
              <h3 className="text-[24px] font-semibold text-gray-800 mb-2">
                Gửi lời mời kết bạn
              </h3>
              <p className="text-[20px] text-gray-600 mb-3">
                Đến: <span className="font-medium">{selectedUser.name}</span>
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập lời nhắn (tuỳ chọn)"
                className="w-full border border-gray-300 rounded-lg p-2 text-[20px] focus:outline-none focus:ring"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <Button text="Hủy" variant="rounded" onClick={() => setSelectedUser(null)} />
                <Button text="Gửi" onClick={handleSendFriendRequest} />
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </MainPage>
  );
}
