// src/utils/timeUtils.js

export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return "Hôm qua " + date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  } else if (date.getFullYear() === now.getFullYear()) {
    const weekday = date.toLocaleDateString("vi-VN", { weekday: 'long' });
    return `${weekday} ${date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString("vi-VN") + ' ' + date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
  }
};

/**
 * Quy tắc hiển thị thời gian giống Messenger
 * @param messages - danh sách tin nhắn
 * @param idx - vị trí tin nhắn hiện tại
 * @returns boolean
 */
export const shouldShowTime = (messages, idx) => {
  if (idx === 0) return true; // tin nhắn đầu tiên luôn hiển thị thời gian

  const curr = messages[idx];
  const prev = messages[idx - 1];

  const currDate = new Date(curr.createdAt);
  const prevDate = new Date(prev.createdAt);

  const sameSender = curr.senderId === prev.senderId;
  const diffMinutes = Math.abs((currDate - prevDate) / (1000 * 60));

  // Hiển thị thời gian nếu khác người gửi hoặc cách nhau >5 phút
  return !sameSender || diffMinutes > 5;
};
