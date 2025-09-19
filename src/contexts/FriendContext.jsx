import { createContext, useState, useEffect, useRef } from "react";
import friendApi from "../../src/api/friendApi";
import userApi from "../../src/api/userApi";
import { initSocket, onEvent, joinRoom } from "../socket/socket";
import { useAuth } from "../contexts/AuthProvider";
import _ from "lodash";

export const FriendContext = createContext();

export function FriendProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const socketRef = useRef(null);

  const searchUsers = async (search) => {
    if (!search) {
      setSearchResults([]);
      return;
    }

    try {
      console.log(search)
      const res = await userApi.searchUser({
        search: search
      });
      if (res.success) {
        const results = res.data.users.map(result => {
          const existing = users.find(u => u.userId === result.id);
          return existing
            ? existing
            : { ...result, type: "stranger", status: "stranger" };
        });
        setSearchResults(results);
      }
      return res;
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedFetch = _.debounce(searchUsers, 300);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 1. Lấy bạn bè
        const friendsRes = await friendApi.getFriend();
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

        setUsers([...friends, ...received, ...sent]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    joinRoom(currentUser.id);

    onEvent("acceptedFriend", (data) => {
      if (currentUser.id !== data.userId) {
        setUsers((prev) =>
          prev.map(u =>
            u.id === data.id
              ? { ...u, status: "accepted", type: "friend" }
              : u
          )
        );

        setSearchResults((prev) =>
          prev.map(u =>
            u.id === data.id
              ? { ...u, status: "accepted", type: "friend" }
              : u
          )
        );
      }
    }),

      onEvent("rejectedFriend", (data) => {
        if (currentUser.id !== data.userId) {
          setUsers((prev) => prev.filter(u => u.id !== data.id));
          setSearchResults((prev) =>
            prev.map(u =>
              u.id === data.id
                ? { ...u, type: "stranger", status: "stranger" }
                : u
            )
          );        
        }
      }),

      onEvent("cancelFriend", (data) => {
        if (currentUser.id !== data.userId) {
          setUsers((prev) => prev.filter(u => u.id !== data.id));
          setSearchResults((prev) =>
            prev.map(u =>
              u.id === data.id
                ? { ...u, type: "stranger", status: "stranger" }
                : u
            )
          );
        }
      }),

      onEvent("removeFriend", (data) => {
        if (currentUser.id !== data.userId) {
          setUsers((prev) => prev.filter(u => u.id !== data.id));
          setSearchResults((prev) =>
            prev.map(u =>
              u.id === data.id
                ? { ...u, type: "stranger", status: "stranger" }
                : u
            )
          );
        }
      }),

      onEvent("sendRequest", (data) => {
        console.log(data)
        if (currentUser.id !== data.userId) {
          const newUser = { ...data, type: "received", status: "pending" };
          setUsers((prev) => [...prev, newUser]);
        }
      });


    return () => {
      socketRef.current = null;
    };
  }, []);


  const sendRequest = async (id, message, context = "users") => {
    try {
      const res = await friendApi.sendRequest({ receiverId: id, message });

      if (res.success) {
        const newType = res.data.status === "accepted" ? "friend" : "sent";
        if (newType === "friend") {
          setUsers((prev) =>
            prev.map(u =>
              u.id === res.data.id ? { ...u, type: newType, status: "accepted" } : u
            )
          );
          if (context === "search" || context === "both") {
            setSearchResults(prev => {
              const exists = prev.find(u => u.id === res.data.id);
              if (exists) {
                // Update
                return prev.map(u =>
                  u.id === res.data.id ? { ...u, status: "accepted", type: "friend" } : u
                );
              } else {
                return [
                  ...prev,
                  { ...res.data, status: "accepted", type: "friend" }
                ];
              }
            });
          }
        } else {
          const newUser = { ...res.data, type: newType, status: "pending" };
          setUsers((prev) => [...prev, newUser]);
          if (context === "search" || context === "both") {
            setSearchResults((prev) => [...prev, newUser]);
          }
        }
      }

      return res;
    } catch (err) {
      console.error(err);
      return { success: false, message: "Có lỗi xảy ra" };
    }
  }




  // Hàm chấp nhận lời mời kết bạn
  const acceptFriend = async (id, context = "users") => {
    try {
      const res = await friendApi.acceptFriend({ requestId: id });
      if (res.success) {
        setUsers(prev =>
          prev.map(u =>
            u.id === res.data.id ? { ...u, status: "accepted", type: "friend" } : u
          )
        );

        if (context === "search" || context === "both") {
          setSearchResults(prev => {
            const newResults = prev.map(u =>
              u.id === res.data.id ? { ...u, status: "accepted", type: "friend" } : u
            );
            return newResults;
          });
        }
      }
      return res;
    } catch (err) {
      console.error(err);
      return { success: false, message: "Có lỗi xảy ra" };
    }
  };

  const rejectFriend = async (id, context = "users") => {
    try {
      const res = await friendApi.rejectFriend({ requestId: id });
      if (res.success) {
        // Cập nhật users
        setUsers(prev => prev.filter(u => u.id !== res.data.id));
        // Cập nhật searchResults nếu cần
        if (context === "search" || context === "both") {
          setSearchResults(prev => prev.filter(u => u.id !== res.data.id));
        }
      }
      return res;
    } catch (err) {
      console.error(err);
      return { success: false, message: "Có lỗi xảy ra" };
    }
  };

  const cancelFriend = async (id, context = "users") => {
    try {
      const res = await friendApi.cancelFriend(id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== res.data.id));
        if (context === "search" || context === "both") {
          setSearchResults(prev => prev.filter(u => u.id !== res.data.id));
        }
      }
      return res;
    } catch (err) {
      console.error(err);
      return { success: false, message: "Có lỗi xảy ra" };
    }
  };

  const removeFriend = async (id, context = "users") => {
    try {
      const res = await friendApi.removeFriend(id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== res.data.id));
        if (context === "search" || context === "both") {
          setSearchResults(prev => prev.filter(u => u.id !== res.data.id));
        }
      }
      return res;
    } catch (err) {
      console.error(err);
      return { success: false, message: "Có lỗi xảy ra" };
    }
  };


  return (
    <FriendContext.Provider value={{
      users,
      searchResults,
      loading,
      sendRequest,
      debouncedFetch,
      acceptFriend,
      rejectFriend,
      cancelFriend,
      removeFriend
    }}>
      {children}
    </FriendContext.Provider>
  );
}
