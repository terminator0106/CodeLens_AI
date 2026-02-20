import { AnalyticsUsage, DashboardOverview, ExplainLevel, FileNode, Repository, User } from '../types';
import { useAuthStore, useUIStore } from '../store';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const EXPLAIN_CACHE_PREFIX_V1 = 'codelens.explain.v1';
const EXPLAIN_CACHE_PREFIX_V2 = 'codelens.explain.v2';
const WHY_CACHE_PREFIX = 'codelens.why.v1';
const EXPLAIN_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

type ExplainResponse = { explanation?: string; referenced_chunks: number[]; message?: string };

const normalizeLevel = (level?: string): ExplainLevel => {
    const raw = (level || '').toLowerCase().trim();
    if (raw === 'beginner' || raw === 'intermediate' || raw === 'expert') return raw;
    return 'intermediate';
};

const safeKeyPart = (value: string) =>
    (value || '')
        .toString()
        .replace(/\s+/g, ' ')
        .slice(0, 120)
        .replace(/[^a-zA-Z0-9._:-]/g, '_');

const explainCacheKeyV1 = (repoId: string, fileId: number) => {
    const userId = useAuthStore.getState().user?.id || 'anon';
    return `${EXPLAIN_CACHE_PREFIX_V1}:${userId}:${repoId}:${fileId}`;
};

const explainCacheKeyV2 = (repoId: string, fileId: number, scope: string, level: ExplainLevel) => {
    const userId = useAuthStore.getState().user?.id || 'anon';
    return `${EXPLAIN_CACHE_PREFIX_V2}:${userId}:${repoId}:${fileId}:${safeKeyPart(scope)}:${level}`;
};

const whyCacheKey = (repoId: string, fileId: number, scope: string, level: ExplainLevel) => {
    const userId = useAuthStore.getState().user?.id || 'anon';
    return `${WHY_CACHE_PREFIX}:${userId}:${repoId}:${fileId}:${safeKeyPart(scope)}:${level}`;
};

const readCache = (key: string): (ExplainResponse & { savedAt?: number }) | null => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as (ExplainResponse & { savedAt?: number });
        const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : 0;
        if (savedAt && Date.now() - savedAt > EXPLAIN_CACHE_TTL_MS) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

const readExplainCache = (repoId: string, fileId: number, scope: string, level?: ExplainLevel): ExplainResponse | null => {
    const lvl = normalizeLevel(level);
    const v2 = readCache(explainCacheKeyV2(repoId, fileId, scope, lvl));
    if (v2) {
        return {
            explanation: v2.explanation,
            referenced_chunks: Array.isArray(v2.referenced_chunks) ? v2.referenced_chunks : [],
            message: v2.message,
        };
    }

    // Back-compat: old cache only existed for file-level explain.
    if (scope === 'file' && lvl === 'intermediate') {
        const v1 = readCache(explainCacheKeyV1(repoId, fileId));
        if (v1) {
            return {
                explanation: v1.explanation,
                referenced_chunks: Array.isArray(v1.referenced_chunks) ? v1.referenced_chunks : [],
                message: v1.message,
            };
        }
    }
    return null;
};

const writeCache = (key: string, value: ExplainResponse) => {
    try {
        localStorage.setItem(key, JSON.stringify({ ...value, savedAt: Date.now() }));
    } catch {
        // Ignore storage quota / disabled storage.
    }
};

const writeExplainCache = (repoId: string, fileId: number, scope: string, level: ExplainLevel, value: ExplainResponse) => {
    writeCache(explainCacheKeyV2(repoId, fileId, scope, level), value);
};

const readWhyCache = (repoId: string, fileId: number, scope: string, level?: ExplainLevel): ExplainResponse | null => {
    const lvl = normalizeLevel(level);
    const parsed = readCache(whyCacheKey(repoId, fileId, scope, lvl));
    if (!parsed) return null;
    return {
        explanation: parsed.explanation,
        referenced_chunks: Array.isArray(parsed.referenced_chunks) ? parsed.referenced_chunks : [],
        message: parsed.message,
    };
};

const writeWhyCache = (repoId: string, fileId: number, scope: string, level: ExplainLevel, value: ExplainResponse) => {
    writeCache(whyCacheKey(repoId, fileId, scope, level), value);
};

const clearExplainCache = (opts?: { repoId?: string }) => {
    try {
        const userId = useAuthStore.getState().user?.id || 'anon';
        const prefixes = [
            `${EXPLAIN_CACHE_PREFIX_V1}:${userId}:`,
            `${EXPLAIN_CACHE_PREFIX_V2}:${userId}:`,
            `${WHY_CACHE_PREFIX}:${userId}:`,
        ];
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            const matchesPrefix = prefixes.some((p) => key.startsWith(p));
            if (!matchesPrefix) continue;

            if (opts?.repoId) {
                const matchesRepo = prefixes.some((p) => key.startsWith(`${p}${opts.repoId}:`));
                if (matchesRepo) toRemove.push(key);
            } else {
                toRemove.push(key);
            }
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
        // Ignore
    }
};

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
                    try {
                        useUIStore.getState().openAuthModal('login');
                    } catch {
                        window.location.hash = '#/login';
                    }
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
        const user = await request<{ id: number; username?: string; email: string; profile_image_url?: string }>('/auth/me');
        return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            profile_image_url: user.profile_image_url
        } as User & { profile_image_url?: string };
    },

    uploadProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/auth/profile-image`, {
            method: 'POST',
            body: formData,
            credentials: 'include', // Important for cookie auth
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.error || error.detail || 'Failed to upload image');
        }

        return await response.json();
    },
    login: async (email: string, password: string, rememberMe: boolean) => {
        const response = await request<{ user: { id: number; username?: string; email: string; profile_image_url?: string } }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, remember_me: rememberMe }),
        });
        return {
            user: {
                id: response.user.id.toString(),
                username: response.user.username,
                email: response.user.email,
                profile_image_url: response.user.profile_image_url,
            },
        } as { user: User };
    },
    signup: async (username: string, email: string, password: string, rememberMe: boolean = false) => {
        const response = await request<{ user: { id: number; username?: string; email: string; profile_image_url?: string } }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, remember_me: rememberMe }),
        });
        return {
            user: {
                id: response.user.id.toString(),
                username: response.user.username ?? username,
                email: response.user.email,
                profile_image_url: response.user.profile_image_url,
            },
        } as { user: User };
    },
    logout: async () => {
        const res = await request<{ status: string }>('/auth/logout', { method: 'POST' });
        // Clear any per-user cached AI outputs on logout.
        clearExplainCache();
        return res;
    },
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
    explainFile: async (repoId: string, fileId: number, opts?: { level?: ExplainLevel }): Promise<ExplainResponse> => {
        const level = normalizeLevel(opts?.level);
        const cached = readExplainCache(repoId, fileId, 'file', level);
        if (cached) return cached;

        const res = await request<ExplainResponse>(`/repos/${repoId}/files/${fileId}/explain`, {
            method: 'POST',
            body: JSON.stringify({ level }),
        });
        writeExplainCache(repoId, fileId, 'file', level, res);
        return res;
    },

    explainSymbol: async (
        repoId: string,
        fileId: number,
        payload: { function_name: string; start_line: number; end_line: number; level?: ExplainLevel }
    ): Promise<ExplainResponse> => {
        const level = normalizeLevel(payload.level);
        const scope = `symbol:${payload.function_name}:${payload.start_line}:${payload.end_line}`;
        const cached = readExplainCache(repoId, fileId, scope, level);
        if (cached) return cached;

        const res = await request<ExplainResponse>(`/repos/${repoId}/files/${fileId}/explain_symbol`, {
            method: 'POST',
            body: JSON.stringify({
                function_name: payload.function_name,
                start_line: payload.start_line,
                end_line: payload.end_line,
                level,
            }),
        });
        writeExplainCache(repoId, fileId, scope, level, res);
        return res;
    },

    whyWritten: async (
        repoId: string,
        fileId: number,
        payload: { function_name?: string; start_line?: number; end_line?: number; level?: ExplainLevel }
    ): Promise<ExplainResponse> => {
        const level = normalizeLevel(payload.level);
        const scope = payload.function_name
            ? `symbol:${payload.function_name}:${payload.start_line || 0}:${payload.end_line || 0}`
            : 'file';
        const cached = readWhyCache(repoId, fileId, scope, level);
        if (cached) return cached;

        const res = await request<ExplainResponse>(`/repos/${repoId}/files/${fileId}/why_written`, {
            method: 'POST',
            body: JSON.stringify({
                function_name: payload.function_name,
                start_line: payload.start_line,
                end_line: payload.end_line,
                level,
            }),
        });
        writeWhyCache(repoId, fileId, scope, level, res);
        return res;
    },

    fetchRiskRadar: (repoId: string, fileId: number) =>
        request<{ security: string[]; performance: string[]; maintainability: string[]; notes?: { security?: string; performance?: string; maintainability?: string } }>(
            `/repos/${repoId}/files/${fileId}/risk_radar`
        ),

    clearExplainCache: (repoId?: string) => clearExplainCache({ repoId }),
    fetchFileMetrics: (repoId: string, fileId: number) =>
        request<{ lines: number; chunks: number; avg_chunk_size: number }>(
            `/repos/${repoId}/files/${fileId}/metrics`
        ),
    fetchRepoAnalytics: (repoId: string) =>
        request<{ files: number; chunks: number; languages: Record<string, number>; avg_chunk_size: number; ingestion_time_ms: number }>(
            `/repos/${repoId}/analytics`
        ),
    fetchDashboardOverview: () => request<DashboardOverview>('/dashboard/overview'),
    queryChat: (repoId: string, question: string, opts?: { level?: ExplainLevel }) =>
        request<{ answer: string; referenced_files: string[]; token_usage: number; latency_ms: number }>('/query', {
            method: 'POST',
            body: JSON.stringify({ repo_id: Number(repoId), question, explain_level: normalizeLevel(opts?.level) }),
        }),

    fetchChatHistory: (repoId: string, limit: number = 100) =>
        request<{ repo_id: number; messages: { id: string; role: 'user' | 'ai'; content: string; timestamp: string; sources?: string[] }[] }>(
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
