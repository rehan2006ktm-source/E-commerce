import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Trash2, MailOpen } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

export const ChatDrawer: React.FC = () => {
  const {
    inbox,
    activeConversation,
    activeParticipant,
    isChatOpen,
    setChatOpen,
    setActiveParticipant,
    fetchInbox,
    fetchConversation,
    sendMessage,
    deleteMessage,
    isLoading
  } = useChatStore();

  const { user, isAuthenticated } = useAuthStore();
  const [text, setText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load active inbox list when drawer pops open
  useEffect(() => {
    if (isChatOpen && isAuthenticated) {
      fetchInbox();
    }
  }, [isChatOpen, isAuthenticated, fetchInbox]);

  // Load conversation details when active receiver shifts
  useEffect(() => {
    if (activeParticipant && isChatOpen) {
      fetchConversation(activeParticipant._id);
    }
  }, [activeParticipant, isChatOpen, fetchConversation]);

  // Auto-scroll chat history panel on new message streams
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeParticipant) return;
    try {
      await sendMessage(activeParticipant._id, text);
      setText('');
    } catch {}
  };

  const handleClose = () => {
    setChatOpen(false);
    setActiveParticipant(null);
  };

  if (!isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Wrapper */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 w-full sm:w-[480px] h-screen bg-slate-950/95 border-r border-white/5 backdrop-blur-xl shadow-2xl flex"
          >
            {/* 1. INBOX LIST COLUMN (Left half if participant selected; full width if not) */}
            <div className={`flex flex-col border-r border-white/5 h-full transition-all ${
              activeParticipant ? 'hidden sm:flex sm:w-1/3' : 'w-full'
            }`}>
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="text-purple-500" size={20} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">Inbox Chat</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer sm:hidden"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Chat list */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {isLoading && inbox.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing mailbox...</div>
                ) : inbox.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <MailOpen size={24} className="text-gray-700 mx-auto" />
                    <p className="text-xs text-gray-500 max-w-[160px] mx-auto leading-normal">
                      No active conversations. Reach out to a seller to begin chatting!
                    </p>
                  </div>
                ) : (
                  inbox.map((item) => {
                    const active = activeParticipant?._id === item.participant._id;
                    return (
                      <button
                        key={item.participant._id}
                        onClick={() => setActiveParticipant(item.participant)}
                        className={`w-full text-left p-3.5 rounded-xl border flex gap-3 transition-all cursor-pointer ${
                          active
                            ? 'border-purple-500 bg-purple-950/20 text-purple-300'
                            : 'border-transparent hover:bg-slate-900/40 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-900 overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-xs border border-purple-500/25">
                          {item.participant.avatar ? (
                            <img src={item.participant.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            item.participant.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-xs text-gray-200 truncate">{item.participant.name}</span>
                            {item.unreadCount > 0 && (
                              <span className="bg-purple-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full shrink-0">
                                {item.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 truncate mt-1 leading-normal">
                            {item.lastMessage.text}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. CHAT HISTORY CONTAINER PANEL */}
            {activeParticipant && (
              <div className="flex-grow flex flex-col h-full bg-slate-950/40">
                {/* Active user header specs */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveParticipant(null)}
                      className="p-2 mr-1 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white cursor-pointer sm:hidden text-xs"
                    >
                      Back
                    </button>
                    <div className="w-9 h-9 rounded-full bg-purple-900 overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-xs">
                      {activeParticipant.avatar ? (
                        <img src={activeParticipant.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        activeParticipant.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white m-0">{activeParticipant.name}</h4>
                      <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-semibold">Active Client</span>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Conversation message feeds */}
                <div className="flex-grow overflow-y-auto p-5 space-y-4">
                  {isLoading && activeConversation.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-500 animate-pulse">
                      Retrieving message logs...
                    </div>
                  ) : (
                    activeConversation.map((msg) => {
                      const isMe = msg.sender?._id === user?._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`relative max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-purple-650 text-white rounded-tr-none shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                              : 'bg-slate-900 text-gray-250 rounded-tl-none border border-white/5'
                          }`}>
                            <p className="m-0 break-words">{msg.text}</p>
                            <span className="text-[8px] text-gray-500 block mt-1.5 text-right font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {/* Hover Delete Action */}
                            <button
                              onClick={() => deleteMessage(msg._id)}
                              className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-950 border border-white/5 text-red-400 hover:text-red-300 rounded-md transition-all cursor-pointer shadow-lg"
                              style={{ [isMe ? 'left' : 'right']: '-35px' }}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Message Send Input form */}
                <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-slate-950 flex gap-2">
                  <input
                    type="text"
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write your message..."
                    className="flex-grow px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer;
