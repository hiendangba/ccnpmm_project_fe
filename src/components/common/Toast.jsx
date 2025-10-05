import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration - 300);
    const removeTimer = setTimeout(() => onClose?.(), duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-400",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed top-5 right-5 px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-white transition-all duration-300 transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      } ${colors[type]}`}
      style={{ zIndex: 9999 }}
    >
      {message}
    </div>
  );
}
