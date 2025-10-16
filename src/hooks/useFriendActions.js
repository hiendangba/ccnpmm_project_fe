import {
    useState,
    useEffect
} from "react";
import friendApi from "../api/friendApi";

export default function useFriendActions(user, displayUser, setToast) {
    const [typeFriend, setTypeFriend] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [friends, setFriends] = useState([]);

    const loadFriends = async () => {
        try {
            const result = await friendApi.getFriend(displayUser.id);
            if (result?.data?.listFriend) {
                const list = result.data.listFriend;
                setFriends(list);
            }
        }
        catch (err) {
            console.error("Lỗi khi tải danh sách bạn bè:", err);
        }
    };

    const loadTypeFriends = async () => {
        try {
            // 1. Lấy bạn bè
            const friendsRes = await friendApi.getFriend(user?.id);
            const friends = friendsRes.success
                ? friendsRes.data.listFriend.map(f => ({
                    ...f,
                    type: "friend"
                }))
                : [];

            // 2. Lấy request đã nhận
            const receivedRes = await friendApi.getReceivedRequest();
            const received = receivedRes.success
                ? receivedRes.data.listFriendRequestReceived.map(r => ({
                    ...r,
                    type: "received"
                }))
                : [];


            // 3. Lấy request đã gửi
            const sentRes = await friendApi.getSentRequest();
            const sent = sentRes.success
                ? sentRes.data.listFriendRequestSent.map(s => ({
                    ...s,
                    type: "sent"
                }))
                : [];

            const total = [...friends, ...received, ...sent];
            return total;

        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const checkTypeFriend = (list) => {
        if (!Array.isArray(list)) return null;
        const found = list.find(e => e.userId === displayUser?.id);

        if (found) {
            setTypeFriend(found.type);
            setRequestId(found.id);
        }
        else {
            setTypeFriend(null);
            setRequestId(null);
        }
    }

    // 👉 gọi API khi vừa vào trang
    useEffect(() => {
        let isMounted = true;  // danh dau xem cai component con ton tai khong

        const fetchData = async () => {
            if (displayUser?.id && user?.id) {
                try {
                    // chay song song de tiet kiem thoi gian
                    const [_, results] = await Promise.all([
                        loadFriends(),
                        loadTypeFriends()
                    ]);
                    if (isMounted && results) {
                        checkTypeFriend(results);
                    }
                }
                catch (err) {
                    console.log("Lỗi khi tải dữ liệu bạn bè:", err);
                }
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        }
    }, [displayUser?.id, user?.id, typeFriend]);

    const handleSendFriend = async () => {
        const data = {
            receiverId: displayUser.id,
            message: "Chào bạn, mình kết bạn nha!",
        }
        const response = await friendApi.sendRequest(data);
        if (response.success) {
            setToast({ message: "Gửi lời mời kết bạn thành công", type: "success" });
            setTypeFriend("sent");
        }
        else {
            setToast({ message: "Gửi lời mời thất bại", type: "error" });
        }


    }

    const handleRejectFriend = async () => {
        if (!displayUser.id) {
            setToast({ message: "Từ chối lời mời thất bại", type: "error" });
            return;
        }
        const response = await friendApi.rejectFriend({ requestId: displayUser.id });
        if (response.success) {
            setToast({ message: "Từ chối lời mời kết bạn thành công", type: "success" });
            setTypeFriend("friend");
        } else {
            setToast({ message: "Từ chối lời mời thất bại", type: "error" });
        }
    }

    const handleAcceptFriend = async () => {
        if (!displayUser.id) {
            setToast({ message: "Chấp nhận lời mời thất bại", type: "error" });
            return;
        }
        const response = await friendApi.acceptFriend({ requestId: displayUser.id });
        if (response.success) {
            setToast({ message: "Chấp nhận lời mời kết bạn thành công", type: "success" });
            setTypeFriend("friend");
        } else {
            setToast({ message: "Chấp nhận lời mời thất bại", type: "error" });
        }
    }

    const handleRemoveFriend = async () => {
        if (!displayUser.id) {
            setToast({ message: "Xóa bạn bè thất bại", type: "error" });
            return;
        }
        const response = await friendApi.removeFriend(displayUser.id);
        if (response.success) {
            setToast({ message: "Xóa bạn bè thành công", type: "success" });
            setTypeFriend(null);
        } else {
            setToast({ message: "Xóa bạn bè thất bại", type: "error" });
        }
    }

    const handleDeclineFriend = async () => {
        if (!displayUser.id) {
            setToast({ message: "Thu hồi lời mời thất bại", type: "error" });
            return;
        }
        const response = await friendApi.cancelFriend(displayUser.id);
        if (response.success) {
            setToast({ message: "Thu hồi lời mời kết bạn thành công", type: "success" });
            setTypeFriend(null);
            setRequestId(null);
        } else {
            setToast({ message: "Thu hồi lời mời thất bại", type: "error" });
        }
    }

    return {
        typeFriend,
        requestId,
        friends,
        handleSendFriend,
        handleRejectFriend,
        handleAcceptFriend,
        handleRemoveFriend,
        handleDeclineFriend,
    };
}