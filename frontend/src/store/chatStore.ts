import { create } from 'zustand';
import api from '../config/axios';
import { useAuthStore } from './authStore';

export interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface InboxItem {
  participant: ConversationParticipant;
  lastMessage: Message;
  unreadCount: number;
}

interface ChatState {
  inbox: InboxItem[];
  activeConversation: Message[];
  activeParticipant: ConversationParticipant | null;
  isChatOpen: boolean;
  isLoading: boolean;
  error: string | null;
  fetchInbox: () => Promise<InboxItem[]>;
  fetchConversation: (participantId: string) => Promise<Message[]>;
  sendMessage: (receiverId: string, text: string) => Promise<Message>;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  setChatOpen: (open: boolean) => void;
  setActiveParticipant: (participant: ConversationParticipant | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  inbox: [],
  activeConversation: [],
  activeParticipant: null,
  isChatOpen: false,
  isLoading: false,
  error: null,

  setChatOpen: (open) => set({ isChatOpen: open }),
  setActiveParticipant: (participant) => set({ activeParticipant: participant }),

  fetchInbox: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/messages/my-messages');
      // Backend returns either structured chats list or raw messages list.
      // We will parse messages list to aggregate conversations on client-side!
      // This is extremely robust and works even if the backend returns messages directly.
      const messages: Message[] = response.data.data || [];
      const currentUserId = useAuthStore.getState().user?._id || '';
      // Let's aggregate:
      const conversationsMap: Record<string, Message[]> = {};
      messages.forEach((msg) => {
        // Participant is the other user
        const otherUser = msg.sender?._id === currentUserId ? msg.receiver : msg.sender;
        if (otherUser && otherUser._id) {
          if (!conversationsMap[otherUser._id]) {
            conversationsMap[otherUser._id] = [];
          }
          conversationsMap[otherUser._id].push(msg);
        }
      });

      // Map to InboxItem
      const inboxList: InboxItem[] = Object.entries(conversationsMap).map(([otherId, msgs]) => {
        // Sort messages by date to get last message
        const sorted = [...msgs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastMsg = sorted[0];
        const otherUser = lastMsg.sender?._id === otherId ? lastMsg.sender : lastMsg.receiver;
        const unreadCount = msgs.filter((m) => m.receiver?._id !== otherId && !m.isRead).length;

        return {
          participant: {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar,
          },
          lastMessage: lastMsg,
          unreadCount,
        };
      });

      set({ inbox: inboxList, isLoading: false });
      return inboxList;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch inbox list', isLoading: false });
      return [];
    }
  },

  fetchConversation: async (participantId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/messages/conversation/${participantId}`);
      const messages = response.data.data || [];
      
      // Sort messages ascending by date for chat list rendering
      const sorted = [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      set({ activeConversation: sorted, isLoading: false });

      // Mark unread messages in this conversation as read
      const unread = sorted.filter((msg) => msg.receiver?._id !== participantId && !msg.isRead);
      for (const msg of unread) {
        await get().markAsRead(msg._id);
      }

      return sorted;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load conversation history', isLoading: false });
      return [];
    }
  },

  sendMessage: async (receiverId, text) => {
    set({ error: null });
    try {
      const response = await api.post('/messages/send', { receiverId, text });
      const newMsg = response.data.data;
      
      // Append to active conversation state
      set((state) => ({
        activeConversation: [...state.activeConversation, newMsg],
      }));

      // Refresh inbox
      await get().fetchInbox();
      return newMsg;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to dispatch message';
      set({ error: errMsg });
      throw new Error(errMsg);
    }
  },

  markAsRead: async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
    } catch {}
  },

  deleteMessage: async (messageId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/messages/${messageId}`);
      set((state) => ({
        activeConversation: state.activeConversation.filter((m) => m._id !== messageId),
        isLoading: false,
      }));
      await get().fetchInbox();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete message', isLoading: false });
    }
  },
}));
