import { createContext, useContext, useState, useRef, useEffect } from "react";
import IncomingCallModal from "../components/call/IncomingCallModal";
import OutgoingCallModal from "../components/call/OutgoingCallModal";
import CallScreen from "../components/call/CallScreen";
import { initSocket, onEvent, joinRoom } from "../socket/socket";
import messageApi from "../api/messageApi";
import { getFakeMediaStream } from "../utils/fakeMedia";
import { useMessageContext } from "./MessageContext";

const CallContext = createContext();

export const CallProvider = ({ children, currentUser, }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const { setMessages } = useMessageContext();
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const rejectedUsersRef = useRef([]);
  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const acceptedUsersRef = useRef([]);

  useEffect(() => {
    acceptedUsersRef.current = acceptedUsers;
  }, [acceptedUsers]);
  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    const fetchAndJoinRooms = async () => {
      const listConv = await messageApi.getConversation();
      if (!listConv.success) return;
      listConv.data.forEach(conv => joinRoom(conv.conversationId));
    };

    fetchAndJoinRooms();

    onEvent("callRequest", (data) => {
      if (data.from !== currentUser.id) {
        setIncomingCall(data);
        setRejectedUsers([])
      }
    });

    onEvent("cancelCall", (data) => {
      if (data.from !== currentUser.id) {
        setIncomingCall(null);
        setOutgoingCall(null);
      }
    });

    onEvent("declineCall", (data) => {
      const { conversation, from, rejectedUsers: rejectedUser } = data;
      setAcceptedUsers(prev => prev.filter(u => u.id !== data.from));
      const exists = rejectedUsersRef.current.find((u) => u.id === rejectedUser.id);
      if (!exists) {
        rejectedUsersRef.current.push(rejectedUser);
        setRejectedUsers([...rejectedUsersRef.current]); // cập nhật UI
      }

      const totalMembers = conversation.members?.length || 0;
      const totalRejected = rejectedUsersRef.current.length;

      // 1️⃣ Cuộc gọi riêng
      const isPrivateCall = totalMembers === 2;
      if (isPrivateCall) {
        rejectedUsersRef.current = [];
        setOutgoingCall(null);
        return;
      }

      if (totalRejected >= totalMembers - 1) {
        rejectedUsersRef.current = [];
        setOutgoingCall(null);
      }
    });


    onEvent("call-accepted", (data) => {
      if (data.from !== currentUser.id && !rejectedUsersRef.current.find(u => u.id === currentUser.id)) {
        setAcceptedUsers(prev => {
          const newUsers = [{ id: currentUser.id }]; // luôn thêm currentUser
          if (!prev.find(u => u.id === data.from)) {
            newUsers.push({ id: data.from });
          }
          return [...prev, ...newUsers];
        });
        handleCallAccepted(data.conversation)
        setOutgoingCall(null); // đóng modal cuộc gọi đến
      }
    });


    onEvent("call-offer", (data) => {
      if (data.from !== currentUser.id && acceptedUsersRef.current.find(u => u.id === data.from)) {
        console.log("handleIncoming Offer")
        handleIncomingOffer(data.offer, data.conversation)
        console.log("finish handleIncoming Offer")
      }
    });

    onEvent("call-answer", (data) => {
      if (data.from !== currentUser.id && acceptedUsersRef.current.find(u => u.id === data.from)) {
        handleAnswer(data.answer, data.conversationId);
      }
    });

    onEvent("ice-candidate", (data) => {
      if (data.from !== currentUser.id && acceptedUsersRef.current.find(u => u.id === data.from)) {
        console.log("Received ice-candidate:", data);
        handleCandidate(data.candidate, data.conversationId);
      }
    });

    onEvent("call-ended", (data) => {
      if (data.from !== currentUser.id) {
        console.log("Call ended by other user");
        handleEndCall(data.conversationId);
      }
    })

    return () => {
      socketRef.current = null;
    };
  }, [currentUser.id]);

  const handleCallAccepted = async (conversation) => {
    try {
      // 1. Lấy local media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCalling(true);
      // 2. Tạo peer connection
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      // 3. Thêm local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      // 4. Nhận remote track
      pc.ontrack = (event) => {
        setRemoteStreams((prev) => [...prev, event.streams[0]]);
      };

      pcRef.current = pc;

      // 5. Tạo offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 6. Gửi offer qua socket
      socketRef.current?.emit("call-offer", {
        conversation,
        offer,
        from: currentUser.id
      });

    } catch (err) {
      console.error("Không thể tạo offer:", err);
    }
  };

  const handleIncomingOffer = async (offer, conversation) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setActiveCall(conversation)
      // 2. Tạo peer connection
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

      // 3. Thêm local tracks
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("ice-candidate", {
            conversationId: conversation.conversationId,
            candidate: event.candidate,
            from: currentUser.id
          });
        }
      };
      // 4. Nhận remote track
      pc.ontrack = (event) => setRemoteStreams(prev => [...prev, event.streams[0]]);

      pcRef.current = pc;

      // 5. Đặt remote description từ offer
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // 6. Tạo answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 7. Gửi answer về cho người gọi
      socketRef.current?.emit("call-answer", {
        conversationId: conversation.conversationId,
        answer,
        from: currentUser.id
      });
      setIsCalling(true);

    } catch (err) {
      console.error("Không thể xử lý offer:", err);
    }
  };

  const handleAnswer = async (answer, conversationId) => {
    try {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("Không thể xử lý answer:", err);
    }
  };

  const handleCandidate = async (candidate, conversationId) => {
    try {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Không thể thêm ICE candidate:", err);
    }
  };

  const handleEndCall = async (conversationId) => {
    // 1. Dừng tất cả track local
    localStream?.getTracks().forEach(track => track.stop());

    // 2. Đóng peer connection
    pcRef.current?.close();
    pcRef.current = null;

    setLocalStream(null);
    setRemoteStreams([]);
    setIsCalling(false);
    setActiveCall(null);
    setIncomingCall(null);
    setOutgoingCall(null);

  }

  const startCall = async (conversation, user) => {
    setOutgoingCall({ conversation });
    setRejectedUsers([])
    setActiveCall(conversation);
    socketRef.current?.emit("callRequest", {
      conversation,
      from: currentUser.id,
      user: user,
    });
  };

  // Accept call
  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      socketRef.current?.emit("call-accepted", {
        conversation: incomingCall.conversation,
        from: currentUser.id
      });
      setAcceptedUsers(prev => {
        const newUsers = [];
        if (!prev.find(u => u.id === currentUser.id)) {
          newUsers.push({ id: currentUser.id });
        }

        if (incomingCall && !prev.find(u => u.id === incomingCall.from)) {
          newUsers.push({ id: incomingCall.from });
        }
        return [...prev, ...newUsers];
      });
      await messageApi.updateCall(
        incomingCall.conversation.conversationId,
        { callStatus: "ongoing" }  // <--- cập nhật trạng thái cuộc gọi
      );
      setIncomingCall(null);
    } catch (err) {
      console.error("Không thể truy cập webcam/microphone:", err);
    }
  };

  // Decline call
  const declineCall = async (conversation) => {
    setIncomingCall(null);
    socketRef.current?.emit("declineCall", {
      conversation: conversation,
      from: currentUser.id,
      rejectedUsers: currentUser,
    });

    const messageResponse = await messageApi.updateCall(
      conversation.conversationId,
      {
        callStatus: "rejected",
      }
    );
    setMessages(prev => {
      const newMsg = messageResponse.data.message;
      const exists = prev.some(m => m.id === newMsg._id || m._id === newMsg._id);
      if (exists) {
        const updated = prev.map(m =>
          (m.id === newMsg._id || m._id === newMsg._id)
            ? { ...m, callStatus: "rejected" }
            : m
        );
        return updated;
      }
      return prev;
    });
  };

  // Cancel outgoing call
  const cancelCall = async (conversationId) => {
    setOutgoingCall(null);
    socketRef.current?.emit("cancelCall", {
      conversationId,
      from: currentUser.id
    });

    const messageResponse = await messageApi.updateCall(
      conversationId,
      {
        callStatus: "canceled",
      }
    );

    setMessages(prev => {
      const newMsg = messageResponse.data.message;
      const exists = prev.some(m => m.id === newMsg._id || m._id === newMsg._id);

      if (exists) {
        const updated = prev.map(m =>
          (m.id === newMsg._id || m._id === newMsg._id)
            ? { ...m, callStatus: "canceled" }
            : m
        );
        return updated;
      }

      const added = [...prev, newMsg];
      return added;
    });
  };

  const endCall = async () => {
    socketRef.current?.emit("call-ended", {
      conversationId: activeCall.conversationId,
      from: currentUser.id
    });

    const messageResponse = await messageApi.updateCall(
      activeCall.conversationId,
      {
        callStatus: "ended",
        endedAt: new Date().toISOString()
      }
    );

    setMessages(prev => {
      const newMsg = messageResponse.data.message;
      const exists = prev.some(m => m.id === newMsg._id || m._id === newMsg._id);

      if (exists) {
        const updated = prev.map(m =>
          (m.id === newMsg._id || m._id === newMsg._id)
            ? { ...m, callStatus: "ended", duration: newMsg.duration }
            : m
        );
        return updated;
      }

      const added = [...prev, newMsg];
      return added;
    });
    // 1. Dừng tất cả track local
    localStream?.getTracks().forEach(track => track.stop());

    // 2. Đóng peer connection
    pcRef.current?.close();
    pcRef.current = null;

    // 3. Xóa state
    setLocalStream(null);
    setRemoteStreams([]);
    setIsCalling(false);
    setActiveCall(null);

    // 4. Quay về trang trước hoặc trang mong muốn
    navigate(-1); // quay lại trang trước
  };

  return (
    <CallContext.Provider
      value={{
        startCall,
        acceptCall,
        declineCall,
        cancelCall,
        localStream,
        remoteStreams,
        isCalling,
        incomingCall,
        outgoingCall,
        activeCall,
        pcRef,
      }}
    >
      {children}

      {incomingCall && (
        <IncomingCallModal
          fromUserId={incomingCall.from}
          selectedConversation={incomingCall.conversation}
          currentUser={currentUser}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}

      {outgoingCall && (
        <OutgoingCallModal
          conversation={outgoingCall.conversation}
          currentUser={currentUser}
          onCancel={cancelCall}
        />
      )}
      {isCalling && acceptedUsers.find(u => u.id === currentUser.id) && (
        <CallScreen
          localStream={localStream}
          remoteStreams={remoteStreams}
          isGroup={activeCall.isGroup}
          onEndCall={endCall}
        />
      )}

    </CallContext.Provider>
  );
};

export const useCallProvider = () => useContext(CallContext);
