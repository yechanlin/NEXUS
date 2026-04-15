import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { FiMessageSquare, FiX, FiSend, FiChevronLeft } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import '../styles/chat.css';

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { projectId, projectTitle }
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const token = localStorage.getItem('token');

  const fetchChats = useCallback(async () => {
    if (!token) return;
    setLoadingChats(true);
    try {
      const res = await fetch(API_ENDPOINTS.chat, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setChats(data.data.chats);
    } catch {
      // silently fail
    } finally {
      setLoadingChats(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (projectId) => {
    if (!token || !projectId) return;
    try {
      const res = await fetch(API_ENDPOINTS.chatMessages(projectId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessages(data.data.messages);
      }
    } catch {
      // silently fail
    }
  }, [token]);

  // Load chats when panel opens
  useEffect(() => {
    if (isOpen && !activeChat) {
      fetchChats();
    }
  }, [isOpen, activeChat, fetchChats]);

  // Poll for new messages every 5 seconds when a chat is open
  useEffect(() => {
    if (activeChat) {
      setLoadingMessages(true);
      fetchMessages(activeChat.projectId).finally(() => setLoadingMessages(false));

      pollRef.current = setInterval(() => {
        fetchMessages(activeChat.projectId);
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeChat, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getLastOpened = (projectId) => {
    const stored = localStorage.getItem(`chat_last_opened_${projectId}`);
    return stored ? new Date(stored) : null;
  };

  const hasUnread = chats.some((chat) => {
    if (!chat.lastMessage) return false;
    const lastOpened = getLastOpened(chat.projectId);
    if (!lastOpened) return true;
    return new Date(chat.lastMessage.createdAt) > lastOpened;
  });

  const openChat = (chat) => {
    localStorage.setItem(`chat_last_opened_${chat.projectId}`, new Date().toISOString());
    setActiveChat({ projectId: chat.projectId, projectTitle: chat.projectTitle });
    setMessages([]);
  };

  const closeChat = () => {
    setActiveChat(null);
    setMessages([]);
    clearInterval(pollRef.current);
    fetchChats(); // refresh chat list
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(API_ENDPOINTS.chatMessages(activeChat.projectId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputText.trim() }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessages((prev) => [...prev, data.data.message]);
        setInputText('');
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const currentUserId = user?.id || user?._id;

  if (!user) return null;

  return (
    <div className="chatbox-container">
      {/* Floating toggle button */}
      <button
        className={`chatbox-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open chat"
      >
        {isOpen ? <FiX size={22} /> : <FiMessageSquare size={22} />}
        {!isOpen && hasUnread && (
          <span className="chatbox-unread-dot" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="chatbox-panel">
          {!activeChat ? (
            // Chat list view
            <>
              <div className="chatbox-header">
                <span>Messages</span>
                <button className="chatbox-close-btn" onClick={() => setIsOpen(false)}>
                  <FiX size={18} />
                </button>
              </div>
              <div className="chatbox-list">
                {loadingChats ? (
                  <div className="chatbox-empty">Loading chats...</div>
                ) : chats.length === 0 ? (
                  <div className="chatbox-empty">
                    <FiMessageSquare size={32} className="chatbox-empty-icon" />
                    <p>No chats yet.</p>
                    <span>Chats appear once you&apos;re accepted into a project.</span>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat.projectId}
                      className="chatbox-list-item"
                      onClick={() => openChat(chat)}
                    >
                      <div className="chat-project-avatar">
                        {chat.projectTitle.charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-list-info">
                        <div className="chat-project-title">{chat.projectTitle}</div>
                        {chat.lastMessage ? (
                          <div className="chat-last-message">
                            <span className="chat-last-sender">{chat.lastMessage.senderName}: </span>
                            {chat.lastMessage.text.length > 40
                              ? chat.lastMessage.text.slice(0, 40) + '…'
                              : chat.lastMessage.text}
                          </div>
                        ) : (
                          <div className="chat-last-message chat-no-messages">No messages yet</div>
                        )}
                      </div>
                      <div className="chat-list-time">
                        {chat.lastMessage ? formatDate(chat.lastMessage.createdAt) : ''}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            // Message view
            <>
              <div className="chatbox-header">
                <button className="chatbox-back-btn" onClick={closeChat}>
                  <FiChevronLeft size={20} />
                </button>
                <div className="chatbox-header-title">
                  <span>{activeChat.projectTitle}</span>
                  <span className="chatbox-header-sub">Project chat</span>
                </div>
                <button className="chatbox-close-btn" onClick={() => setIsOpen(false)}>
                  <FiX size={18} />
                </button>
              </div>

              <div className="chatbox-messages">
                {loadingMessages ? (
                  <div className="chatbox-empty">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="chatbox-empty">
                    <p>No messages yet.</p>
                    <span>Say hello to your team!</span>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn =
                      msg.sender?._id?.toString() === currentUserId?.toString() ||
                      msg.sender?.toString() === currentUserId?.toString();
                    const showDate =
                      idx === 0 ||
                      new Date(messages[idx - 1].createdAt).toDateString() !==
                        new Date(msg.createdAt).toDateString();

                    return (
                      <React.Fragment key={msg._id || idx}>
                        {showDate && (
                          <div className="chatbox-date-divider">
                            {formatDate(msg.createdAt)}
                          </div>
                        )}
                        <div className={`chatbox-message ${isOwn ? 'own' : 'other'}`}>
                          {!isOwn && (
                            <div className="msg-avatar">
                              {(msg.sender?.userName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="msg-content">
                            {!isOwn && (
                              <span className="msg-sender-name">
                                {msg.sender?.userName || 'Unknown'}
                              </span>
                            )}
                            <div className="msg-bubble">{msg.text}</div>
                            <span className="msg-time">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chatbox-input-area">
                <textarea
                  className="chatbox-input"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={1000}
                />
                <button
                  className="chatbox-send-btn"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || sending}
                  aria-label="Send message"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
