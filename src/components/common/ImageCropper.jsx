import { useState, useRef, useEffect } from 'react';

export default function ImageCropper({ imageUrl, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const cropSize = 200; // Kích thước crop circle
  const minScale = 0.1; // Cho phép zoom out xuống 10%
  const maxScale = 5; // Cho phép zoom in lên 500%

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
        // Tính toán scale ban đầu để ảnh vừa với crop area
        const initialScale = Math.max(cropSize / img.width, cropSize / img.height) * 1.5;
        setScale(Math.max(initialScale, 0.3)); // Scale ban đầu tối thiểu 30%
        setPosition({ x: 0, y: 0 });
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, scale, position]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    ctx.restore();

    // Draw crop circle overlay - làm mờ phần bên ngoài
    ctx.save();
    
    // Tạo clipping path cho phần bên ngoài hình tròn
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(centerX, centerY, cropSize / 2, 0, 2 * Math.PI, true); // true = counterclockwise
    ctx.clip();
    
    // Vẽ overlay mờ đục trắng chỉ cho phần bên ngoài
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();

    // Không vẽ viền hình tròn
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    // Zoom rất nhẹ nhàng với hệ số nhỏ
    const delta = -e.deltaY * 0.0001; // Scroll down = zoom out, scroll up = zoom in
    const newScale = scale + delta;
    
    if (newScale >= minScale && newScale <= maxScale) {
      setScale(newScale);
    }
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const img = imageRef.current;
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    // Tạo canvas crop với kích thước đúng
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    const cropCtx = cropCanvas.getContext('2d');

    // Vẽ nền trong suốt
    cropCtx.clearRect(0, 0, cropSize, cropSize);

    // Tạo clipping path hình tròn ở giữa canvas crop
    cropCtx.save();
    cropCtx.beginPath();
    cropCtx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, 2 * Math.PI);
    cropCtx.clip();
    
    // Tính toán vị trí ảnh trên canvas chính
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;
    const imgX = canvasCenterX + position.x - imgWidth / 2;
    const imgY = canvasCenterY + position.y - imgHeight / 2;
    
    // Tính toán vùng crop trên canvas chính
    const cropX = canvasCenterX - cropSize / 2;
    const cropY = canvasCenterY - cropSize / 2;
    
    // Vẽ vùng crop từ canvas chính vào canvas crop
    cropCtx.drawImage(
      canvas,
      cropX, cropY, cropSize, cropSize, // Source: vùng crop trên canvas chính
      0, 0, cropSize, cropSize // Destination: toàn bộ canvas crop
    );
    
    cropCtx.restore();

    // Convert to blob
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/png', 1.0);
  };

  if (!imageLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải ảnh...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-600 text-center">
        Kéo để di chuyển ảnh, lăn chuột để zoom in/out
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>Zoom: {Math.round(scale * 100)}%</span>
        <span className="text-gray-400">•</span>
        <span>Lăn chuột để zoom</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          Hủy
        </button>
        <button
          onClick={handleCrop}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          Chọn
        </button>
      </div>
    </div>
  );
}
