// utils/fakeMedia.js
export const getFakeMediaStream = async () => {
  // Tạo fake video
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, 640, 480);
  const videoStream = canvas.captureStream(30);

  // Tạo fake audio
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  oscillator.frequency.value = 440;
  oscillator.start();
  const dst = audioCtx.createMediaStreamDestination();
  oscillator.connect(dst);

  // Kết hợp video + audio
  return new MediaStream([...videoStream.getTracks(), ...dst.stream.getTracks()]);
};
