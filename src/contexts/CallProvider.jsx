import { createContext, useContext, useState, useRef, useEffect } from "react";
import IncomingCallModal from "../components/call/IncomingCallModal";
import OutgoingCallModal from "../components/call/OutgoingCallModal";
import CallScreen from "../components/call/CallScreen";
import { initSocket, onEvent, joinRoom } from "../socket/socket";
import messageApi from "../api/messageApi";
import { getFakeMediaStream } from "../utils/fakeMedia";

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
            }
        });

        onEvent("cancelCall", (data) => {
            if (data.from !== currentUser.id) {
                setIncomingCall(null);
                setOutgoingCall(null); // đóng modal cuộc gọi đến
            }
        });

        onEvent("call-accepted", (data) => {
            if(data.from !== currentUser.id)
            {
                handleCallAccepted(data.conversation)
                setOutgoingCall(null); // đóng modal cuộc gọi đến
            }
        });

        onEvent("call-offer", (data) => {
            if(data.from !== currentUser.id)
            {
                handleIncomingOffer(data.offer,data.conversation)
            }
        });

        onEvent("call-answer", (data) => {
            if (data.from !== currentUser.id) {
                handleAnswer(data.answer, data.conversationId);
            }
        });

        // Khi nhận ICE candidate từ peer
        onEvent("ice-candidate", (data) => {
            if (data.from !== currentUser.id) {
                handleCandidate(data.candidate, data.conversationId); 
            }
        });

        onEvent("call-ended", (data) => {
          if(data.from !== currentUser.id){
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
            // 1. Lấy local media
            const stream = await getFakeMediaStream();
           
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

    const handleEndCall = async (conversationId) =>{
      console.log(123123)
      // 1. Dừng tất cả track local
      localStream?.getTracks().forEach(track => track.stop());

      // 2. Đóng peer connection
      pcRef.current?.close();
      pcRef.current = null;

      // 3. Xóa state liên quan
      setLocalStream(null);
      setRemoteStreams([]);
      setIsCalling(false);
      setActiveCall(null);
      setIncomingCall(null);
      setOutgoingCall(null);

    }


  // Start call (voice/video)
  const startCall = async (type = "video", conversation) => {
    setOutgoingCall({ type, conversation });
    setActiveCall(conversation);
    socketRef.current?.emit("callRequest", {
      conversation,
      from: currentUser.id,
      type,
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
        setIncomingCall(null);
    } catch (err) {
      console.error("Không thể truy cập webcam/microphone:", err);
    }
  };

  // Decline call
  const declineCall = () => {
    setIncomingCall(null);
  };

  // Cancel outgoing call
    const cancelCall = (conversationId) => {
        setOutgoingCall(null);
        socketRef.current?.emit("cancelCall", {
            conversationId,
            from: currentUser.id
        });
    };

      const endCall = () => {
          socketRef.current?.emit("call-ended", {
            conversationId: activeCall?.conversationId,
            from: currentUser.id
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
      {isCalling && (
        <>
        <CallScreen
          localStream={localStream}
          remoteStreams={remoteStreams}
          isGroup={activeCall.isGroup}
          onEndCall={endCall}
        />
        </>
      )}

    </CallContext.Provider>
  );
};

export const useCallProvider = () => useContext(CallContext);
