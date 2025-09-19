import { useRef, useEffect } from "react";
export default function CallScreen({ localStream, remoteStreams, isGroup = false, onEndCall }) {
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center z-50">
      {isGroup ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full h-full p-2">
          {remoteStreams.map((stream, index) => (
            <video
              key={index}
              autoPlay
              playsInline
              ref={el => { if(el) el.srcObject = stream; }}
              className="w-full h-full object-cover rounded-lg"
            />
          ))}
        </div>
      ) : (
        remoteStreams[0] && (
          <video
            autoPlay
            playsInline
            ref={el => { if(el) el.srcObject = remoteStreams[0]; }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      )}

      {localStream && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-48 h-36 rounded-lg absolute bottom-4 right-4 border-2 border-white object-cover"
        />
      )}

      {/* Nút kết thúc */}
      <button
        onClick={onEndCall}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        End Call
      </button>
    </div>
  );
}
