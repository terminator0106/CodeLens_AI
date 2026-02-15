import { create } from 'zustand';
import { User, Repository, ChatMessage, FileNode } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (user: User) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setAuthLoading: (loading: boolean) => void;
  updateUserProfileImage: (profileImageUrl: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  login: (user) => set({ user, isAuthenticated: true }),
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  updateUserProfileImage: (profileImageUrl) => set((state) => ({
    user: state.user ? { ...state.user, profile_image_url: profileImageUrl } : null
  })),
}));

interface RepoState {
  repositories: Repository[];
  filteredRepositories: Repository[];
  selectedRepo: Repository | null;
  fileTree: FileNode[];
  selectedFile: FileNode | null;
  setRepositories: (repos: Repository[]) => void;
  setFilteredRepositories: (repos: Repository[]) => void;
  addRepository: (repo: Repository) => void;
  removeRepository: (repoId: string) => void;
  selectRepo: (repo: Repository | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  selectFile: (file: FileNode | null) => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  repositories: [],
  filteredRepositories: [],
  selectedRepo: null,
  fileTree: [],
  selectedFile: null,
  setRepositories: (repos) => set({ repositories: repos, filteredRepositories: repos }),
  setFilteredRepositories: (repos) => set({ filteredRepositories: repos }),
  addRepository: (repo) => set((state) => ({
    repositories: [...state.repositories, repo],
    filteredRepositories: [...state.filteredRepositories, repo]
  })),
  removeRepository: (repoId: string) => set((state) => ({
    repositories: state.repositories.filter(r => r.id !== repoId),
    filteredRepositories: state.filteredRepositories.filter(r => r.id !== repoId),
    selectedRepo: state.selectedRepo?.id === repoId ? null : state.selectedRepo
  })),
  selectRepo: (repo) => set({ selectedRepo: repo }),
  setFileTree: (tree) => set({ fileTree: tree }),
  selectFile: (file) => set({ selectedFile: file }),
}));

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setTyping: (typing: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  setTyping: (typing) => set({ isTyping: typing }),
  clearChat: () => set({ messages: [] }),
}));

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  authModalMode: 'login' | 'signup' | null;
  openAuthModal: (mode: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  authModalMode: null,
  openAuthModal: (mode) => set({ authModalMode: mode }),
  closeAuthModal: () => set({ authModalMode: null }),
}));