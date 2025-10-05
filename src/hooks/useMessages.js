import { useState, useRef, useEffect } from "react";
import messageApi from "../api/messageApi";
import {initSocket ,joinRoom, leaveRoom, onEvent } from "../socket/socket";

export const useMessages = (selectedConversation, currentUser) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const messageRefs = useRef({});
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isFirstLoadRef = useRef(true);

  // init socket + event
  useEffect(() => {
    if (!selectedConversation) return;
    initSocket();
    joinRoom(selectedConversation.conversationId);

    onEvent("receiveMessage", (message) => {

        if (message.senderId !== currentUser.id && message.conversationId === selectedConversation.conversationId) {
            setMessages(prev => [...prev, message]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
    });

    onEvent("messageRead", (message) => {
        if (message.conversationId === selectedConversation.conversationId) {

        setMessages(prev =>
            prev.map(m => m.id === message.id ? { ...m, ...message } : m)
        );
        }
    });

    return () => leaveRoom(selectedConversation.conversationId);
  }, [selectedConversation, currentUser.id]);

  // fetch messages
  const fetchMessages = async (pageNum = pageRef.current) => {
    if (!selectedConversation || loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    try {
      const limit = 20;
      let res;
      if (selectedConversation.isGroup) {
        res = await messageApi.getMessageGroup({
          conversationId: selectedConversation.conversationId,
          page: pageNum,
          limit
        });
      } else {
        const otherId = selectedConversation.members.find(m => m.id !== currentUser.id)?.id;
        res = await messageApi.getMessageOneToOne({
          receiverId: otherId,
          page: pageNum,
          limit
        });
      }

      const fetched = (res.data.messages || []).slice().reverse();
      const totalItems = res.totalItems;
      const currentCount = (pageNum - 1) * limit + fetched.length;
      hasMoreRef.current = currentCount < totalItems;
      pageRef.current = pageNum + 1;

      setMessages(prev => {
        if (pageNum === 1) {
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          });
          return fetched;
        } else {
          const container = containerRef.current;
          const oldScrollHeight = container.scrollHeight;
          const newMessages = [...fetched, ...prev];
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - oldScrollHeight;
          });
          return newMessages;
        }
      });

    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
    }
  };

  // load first messages khi conversation đổi
  useEffect(() => {
    if (!selectedConversation) return;
    setMessages([]);
    pageRef.current = 1;
    hasMoreRef.current = true;
    isFirstLoadRef.current = true;

    const loadFirst = async () => {
      await fetchMessages(1);
      setTimeout(() => isFirstLoadRef.current = false, 50);
    };
    loadFirst();
  }, [selectedConversation]);

  // scroll load more
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (
        isFirstLoadRef.current ||
        !hasMoreRef.current ||
        loadingRef.current ||
        container.scrollHeight <= container.clientHeight
      ) return;

      if (container.scrollTop <= 20) {
        fetchMessages(pageRef.current);
      }
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [selectedConversation]);

  // mark as read
  useEffect(() => {
    if (messages.length === 0) return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const messageId = entry.target.dataset.message;
        const message = messages.find(m => m.id === messageId);
        if (!message || message.senderId === currentUser.id) return;
        if ((message.readBy || []).includes(currentUser.id)) return;

        messageApi.markAsRead(message.id).catch(console.error);
      });
    }, { threshold: 0.9 });

    Object.values(messageRefs.current).forEach(el => el && observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, [messages, currentUser.id]);

  // send message
  const sendMessage = async (content, attachments) => {
    if ((!content?.trim() && (!attachments || attachments.length === 0)) || !selectedConversation) return;

    try {
      const formData = new FormData();
      formData.append("conversationId", selectedConversation.conversationId);
      formData.append("content", content || "");

      // Chuẩn hóa attachments thành mảng, đảm bảo có .length
      const files = attachments
        ? (Array.isArray(attachments) ? attachments : [attachments])
        : [];

      if (files.length > 0) {
        formData.append("attachments", files[0]); // chỉ gửi 1 ảnh
        formData.append("type", "image");
      }

      const res = await messageApi.sendMessage(formData);

      if (res.success) {
        setMessages(prev => [...prev, res.data.message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch (err) {
      console.error(err);
    }
  };



  return { messages, messagesEndRef, containerRef, messageRefs, fetchMessages, sendMessage };
};
