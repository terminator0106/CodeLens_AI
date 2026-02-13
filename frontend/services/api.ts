import { AnalyticsUsage, DashboardOverview, FileNode, Repository, User } from '../types';
import { useAuthStore } from '../store';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const isAuthRoute = (path: string) => path.startsWith('/auth/');
const isOnAuthScreen = () => {
    const hash = window.location.hash || '';
    return hash.startsWith('#/login') || hash.startsWith('#/signup');
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // 401 on auth endpoints is expected (e.g., invalid credentials, not logged in yet).
            // Only force-logout+redirect for protected, non-auth API calls.
            if (!isAuthRoute(path)) {
                useAuthStore.getState().logout();
                if (!isOnAuthScreen()) {
                    window.location.hash = '#/login';
                }
            }
        }
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.error || errorBody.detail || 'Request failed';
        throw new Error(message);
    }

    return response.json() as Promise<T>;
};

const buildTree = (files: { id: number; file_path: string; language?: string }[]): FileNode[] => {
    const root: FileNode = { id: 'root', name: 'root', type: 'folder', children: [] };

    const sortNodes = (nodes: FileNode[]) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        nodes.forEach((n) => {
            if (n.type === 'folder' && n.children && n.children.length > 0) {
                sortNodes(n.children);
            }
        });
    };

    files.forEach((file) => {
        // Normalize path separators (handle both \ and /) and split
        const normalizedPath = file.file_path.replace(/\\/g, '/');
        const parts = normalizedPath.split('/').filter(p => p); // filter out empty parts
        let current = root;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const existing = current.children?.find((child) => child.name === part);
            if (existing) {
                current = existing;
                return;
            }
            const node: FileNode = isFile
                ? {
                    id: file.id.toString(),
                    name: part,
                    type: 'file',
                    language: file.language,
                    fileId: file.id,
                    filePath: file.file_path,
                }
                : {
                    id: `${current.id}/${part}`,
                    name: part,
                    type: 'folder',
                    children: [],
                };
            current.children = current.children || [];
            current.children.push(node);
            if (!isFile) {
                current = node;
            }
        });
    });

    if (root.children && root.children.length > 0) {
        sortNodes(root.children);
    }

    return root.children || [];
};

export const api = {
    getMe: async () => {
        const user = await request<{ id: number; email: string; profile_image_url?: string }>('/auth/me');
        return {
            id: user.id.toString(),
            email: user.email,
            profile_image_url: user.profile_image_url
        } as User & { profile_image_url?: string };
    },

    uploadProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/auth/profile-image', {
            method: 'POST',
            body: formData,
            credentials: 'include', // Important for cookie auth
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || 'Failed to upload image');
        }

        return await response.json();
    },
    login: async (email: string, password: string, rememberMe: boolean) => {
        const response = await request<{ user: { id: number; email: string } }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, remember_me: rememberMe }),
        });
        return { user: { id: response.user.id.toString(), email: response.user.email } } as { user: User };
    },
    signup: async (email: string, password: string, rememberMe: boolean = false) => {
        const response = await request<{ user: { id: number; email: string } }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, remember_me: rememberMe }),
        });
        return { user: { id: response.user.id.toString(), email: response.user.email } } as { user: User };
    },
    logout: () => request<{ status: string }>('/auth/logout', { method: 'POST' }),
    fetchRepos: async (): Promise<Repository[]> => {
        const data = await request<
            { id: number; repo_url: string; repo_name: string; created_at: string; status: string; file_count: number }[]
        >('/repos');
        return data.map((repo) => ({
            id: repo.id.toString(),
            name: repo.repo_name,
            description: `Imported from ${repo.repo_url}`,
            url: repo.repo_url,
            language: 'Unknown',
            status: repo.status === 'indexed' ? 'indexed' : 'processing',
            fileCount: repo.file_count,
            lastUpdated: new Date(repo.created_at).toLocaleString(),
            branch: 'main',
        }));
    },
    ingestRepo: async (repoUrl: string, branch: string): Promise<Repository> => {
        const repo = await request<
            { id: number; repo_url: string; repo_name: string; created_at: string; status: string; file_count: number }
        >('/repos/ingest', {
            method: 'POST',
            body: JSON.stringify({ repo_url: repoUrl, branch }),
        });
        return {
            id: repo.id.toString(),
            name: repo.repo_name,
            description: `Imported from ${repo.repo_url}`,
            url: repo.repo_url,
            language: 'Unknown',
            status: repo.status === 'indexed' ? 'indexed' : 'processing',
            fileCount: repo.file_count,
            lastUpdated: new Date(repo.created_at).toLocaleString(),
            branch,
        };
    },
    reingestRepo: async (repoId: string, branch: string = 'main'): Promise<void> => {
        await request<{
            repo_id: number;
            files: number;
            chunks: number;
            id: number;
            repo_url: string;
            repo_name: string;
            created_at: string;
            status: string;
            file_count: number;
        }>(`/repos/${repoId}/reingest`, {
            method: 'POST',
            body: JSON.stringify({ branch }),
        });
    },
    deleteRepo: async (repoId: string): Promise<void> => {
        await request<{ status: string; repo_id: number }>(`/repos/${repoId}`, {
            method: 'DELETE',
        });
    },
    fetchRepoFiles: async (repoId: string): Promise<FileNode[]> => {
        const data = await request<{ repo_id: number; files: { id: number; file_path: string; language?: string }[] }>(
            `/repos/${repoId}/files`
        );
        return buildTree(data.files);
    },
    fetchFileContent: (repoId: string, fileId: number) =>
        request<{ file_path: string; language?: string; content: string }>(
            `/repos/${repoId}/files/${fileId}`
        ),
    explainFile: (repoId: string, fileId: number) =>
        request<{ explanation?: string; referenced_chunks: number[]; message?: string }>(
            `/repos/${repoId}/files/${fileId}/explain`,
            {
                method: 'POST',
                body: JSON.stringify({}),
            }
        ),
    fetchFileMetrics: (repoId: string, fileId: number) =>
        request<{ lines: number; chunks: number; avg_chunk_size: number }>(
            `/repos/${repoId}/files/${fileId}/metrics`
        ),
    fetchRepoAnalytics: (repoId: string) =>
        request<{ files: number; chunks: number; languages: Record<string, number>; avg_chunk_size: number; ingestion_time_ms: number }>(
            `/repos/${repoId}/analytics`
        ),
    fetchDashboardOverview: () => request<DashboardOverview>('/dashboard/overview'),
    queryChat: (repoId: string, question: string) =>
        request<{ answer: string; referenced_files: string[]; token_usage: number; latency_ms: number }>('/query', {
            method: 'POST',
            body: JSON.stringify({ repo_id: Number(repoId), question }),
        }),

    fetchChatHistory: (repoId: string, limit: number = 100) =>
        request<{ repo_id: number; messages: { id: string; role: 'user' | 'ai'; content: string; timestamp: string }[] }>(
            `/repos/${repoId}/chat/history?limit=${encodeURIComponent(String(limit))}`
        ),
    fetchAnalytics: async () => {
        const data = await request<{
            total_repos: number;
            total_files: number;
            total_chunks: number;
            avg_query_latency_ms: number;
            token_usage: number;
        }>('/analytics/usage');
        return {
            totalRepos: data.total_repos,
            totalFiles: data.total_files,
            totalChunks: data.total_chunks,
            avgQueryLatencyMs: data.avg_query_latency_ms,
            tokenUsage: data.token_usage,
        } as AnalyticsUsage;
    },
};
