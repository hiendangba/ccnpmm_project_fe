import { useState, useContext, useEffect } from "react";
import MainPage from "./HomePage";
import Picture from "../common/Picture";
import InputField from "../common/InputField";
import Button from "../common/Button";
import AltAvatar from "../../assets/alt_avatar.png";
import Toast from "../common/Toast";
import { FriendContext } from "../../contexts/FriendContext";

export default function FriendPage() {
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    users,
    searchResults,
    loading,
    sendRequest,
    debouncedFetch,
    acceptFriend,
    rejectFriend,
    cancelFriend,
    removeFriend
  } = useContext(FriendContext);

  // Tìm kiếm khi người dùng nhập
  useEffect(() => {
    if (searchTerm.trim() && !isUpdating) { // thêm !isUpdating
      debouncedFetch(searchTerm);
    }
  }, [searchTerm, isUpdating]);

  const showToast = (type, message) => setToast({ type, message });

  const getButtonsByType = (type) => {
    switch(type) {
      case "friend": return ["remove"];
      case "sent": return ["cancel"];
      case "received": return ["accept","reject"];
      case "stranger": return ["send"];
      default: return [];
    }
  };

  const handleAction = async (action, user, context = "users") => {
    let res;
    let requestId;
    setIsUpdating(true);
    try {
      switch(action) {
        case "accept":
          if(context === "search")
            requestId = user.id
          else
            requestId = user.userId;
          res = await acceptFriend(requestId, context);
          if(res.success) showToast("success", `Đã chấp nhận ${user.name}`);
          else showToast("error", res.message || "Lỗi đồng ý kết bạn");
          break;
        case "reject":
          if(context === "search")
            requestId = user.id
          else
            requestId = user.userId;
          res = await rejectFriend(requestId, context);
          if(res.success) showToast("info", `Đã từ chối ${user.name}`);
          else showToast("error", res.message || "Lỗi từ chối kết bạn");
          break;
        case "cancel":
          res = await cancelFriend(user.userId, context);
          if(res.success) showToast("info", `Đã hủy lời mời kết bạn với ${user.name}`);
          else showToast("error", res.message || "Lỗi hủy lời mời");
          break;
        case "remove":
          res = await removeFriend(user.userId, context);
          if(res.success) showToast("info", `Đã xóa kết bạn với ${user.name}`);
          else showToast("error", res.message || "Lỗi xóa kết bạn");
          break;
        case "send_prev":
          setSelectedUser(user);
          break;
        case "send":
          const userId = user.userId ?? user.id;
          console.log("userId",userId)
          res = await sendRequest(userId,message,context)
          if(res.success) showToast("info", `Đã gửi kết bạn với ${user.name}`);
          else showToast("error", res.message || "Lỗi gửi lời mời kết bạn");

          setSelectedUser(null);
          break;
        default: break;
      }
    } finally {
      setIsUpdating(false); // kết thúc thao tác
    }
  };


  const renderUserItem = (user, showButtons = [], context = "users") => (
    <div
      key={user.id}
      className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50"
    >
      <div className="flex items-center space-x-3">
        <Picture src={user.avatar || AltAvatar} className="w-20 h-20" />
        <div className="flex-1">
          <p className="text-[20px] font-medium text-gray-900">{user.name}</p>
          {user.message && user.type !== "friend" && (
            <p className="text-[18px] text-gray-500">{user.message}</p>
          )}          
          {searchTerm && !["friend","sent","received"].includes(user.type) && (
            <p className="text-[18px] text-gray-500">Người lạ</p>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        {showButtons.includes("accept") && (
          <Button text="Chấp nhận" onClick={() => handleAction("accept", user, context)} variant="rounded" />
        )}
        {showButtons.includes("reject") && (
          <Button text="Từ chối" onClick={() => handleAction("reject", user, context)} variant="rounded" />
        )}
        {showButtons.includes("cancel") && (
          <Button text="Hủy" onClick={() => handleAction("cancel", user, context)} variant="rounded" />
        )}
        {showButtons.includes("remove") && (
          <Button text="Xóa kết bạn" onClick={() => handleAction("remove", user, context)} variant="rounded" />
        )}
        {showButtons.includes("send") && (
          <Button text="Kết bạn" onClick={() => handleAction("send_prev", user, context)} variant="rounded" />
        )}
      </div>
    </div>
  );

  if (loading) return <p>Đang tải danh sách bạn bè...</p>;

  const displayList = searchTerm ? searchResults : users;

  return (
    <MainPage>
      <div className="flex flex-col h-screen bg-white">
        <div className="p-4 border-b border-gray-200">
          <InputField
            placeholder="🔎︎ Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {!searchTerm && (
            <>
              <h3 className="text-[24px] font-medium mb-2">Danh sách bạn bè</h3>
              {users.filter(u => u.type === "friend").length === 0 
                ? <p className="text-gray-500 text-[20px]">Chưa có bạn bè nào</p>
                : users.filter(u => u.type === "friend").map(u => renderUserItem(u, getButtonsByType(u.type), "users"))}

              <h3 className="text-[24px] font-medium mt-4 mb-2">Lời mời kết bạn</h3>
              {users.filter(u => u.type === "received").length === 0
                ? <p className="text-gray-500 text-[20px]">Không có lời mời nào</p>
                : users.filter(u => u.type === "received").map(u => renderUserItem(u, getButtonsByType(u.type), "users"))}

              <h3 className="text-[24px] font-medium mt-4 mb-2">Lời mời đã gửi</h3>
              {users.filter(u => u.type === "sent").length === 0
                ? <p className="text-gray-500 text-[20px]">Chưa gửi lời mời nào</p>
                : users.filter(u => u.type === "sent").map(u => renderUserItem(u, getButtonsByType(u.type), "users"))}
            </>
          )}

          {searchTerm && (
            <>
              <h3 className="text-[24px] font-medium mb-2">Kết quả tìm kiếm</h3>
              {displayList.length === 0
                ? <p className="text-gray-500 text-[20px]">Không tìm thấy kết quả</p>
                : displayList.map(u => renderUserItem(u, getButtonsByType(u.type), "search"))}
            </>
          )}
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-80 shadow-lg">
              <h3 className="text-[24px] font-semibold text-gray-800 mb-2">Gửi lời mời kết bạn</h3>
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
                <Button text="Gửi" onClick={() => handleAction("send", selectedUser, "search")} />
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </MainPage>
  );
}
