import { Repository, FileNode, AnalyticsData } from '../types';

// Mock Data
const MOCK_REPOS: Repository[] = [
  {
    id: '1',
    name: 'codelens-frontend',
    description: 'The frontend logic for CodeLens AI SaaS platform.',
    url: 'https://github.com/codelens/frontend',
    language: 'TypeScript',
    status: 'indexed',
    fileCount: 42,
    lastUpdated: '2 hours ago',
    branch: 'main',
  },
  {
    id: '2',
    name: 'codelens-backend',
    description: 'Microservices architecture powering the AI engine.',
    url: 'https://github.com/codelens/backend',
    language: 'Go',
    status: 'processing',
    fileCount: 128,
    lastUpdated: '5 mins ago',
    branch: 'dev',
  },
];

const MOCK_FILE_TREE: FileNode[] = [
  {
    id: 'root',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'comp',
        name: 'components',
        type: 'folder',
        children: [
          { id: 'btn', name: 'Button.tsx', type: 'file', language: 'typescript', content: `import React from 'react';\n\nexport const Button = () => <button>Click me</button>;` },
          { id: 'hdr', name: 'Header.tsx', type: 'file', language: 'typescript', content: `export const Header = () => <header>Logo</header>;` },
        ],
      },
      {
        id: 'pages',
        name: 'pages',
        type: 'folder',
        children: [
          { id: 'home', name: 'Home.tsx', type: 'file', language: 'typescript', content: `export default function Home() { return <div>Home</div>; }` },
        ],
      },
      { id: 'app', name: 'App.tsx', type: 'file', language: 'typescript', content: `// Main App Entry\nexport default function App() { return <Router />; }` },
      { id: 'utils', name: 'utils.ts', type: 'file', language: 'typescript', content: `export const add = (a, b) => a + b;` },
    ],
  },
  { id: 'pkg', name: 'package.json', type: 'file', language: 'json', content: `{\n  "name": "project",\n  "version": "1.0.0"\n}` },
  { id: 'readme', name: 'README.md', type: 'file', language: 'markdown', content: `# Project Title\n\nThis is a cool project.` },
];

const MOCK_ANALYTICS: AnalyticsData = {
  tokensUsed: 145000,
  filesIndexed: 342,
  compressionRatio: 65,
  repoSizeMB: 12.5,
};

export const api = {
  login: async (email: string) => {
    return new Promise<{ id: string; name: string; email: string }>((resolve) => {
      setTimeout(() => {
        resolve({ id: 'u1', name: 'Alex Developer', email });
      }, 800);
    });
  },
  fetchRepos: async () => {
    return new Promise<Repository[]>((resolve) => {
      setTimeout(() => resolve(MOCK_REPOS), 600);
    });
  },
  fetchRepoDetails: async (id: string) => {
    return new Promise<{ tree: FileNode[] }>((resolve) => {
      setTimeout(() => resolve({ tree: MOCK_FILE_TREE }), 500);
    });
  },
  fetchAnalytics: async () => {
    return new Promise<AnalyticsData>((resolve) => {
      setTimeout(() => resolve(MOCK_ANALYTICS), 400);
    });
  },
  queryChat: async (message: string) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`I analyzed the file. Based on "${message}", it seems like this component is responsible for UI rendering. The dependency graph shows it connects to the Store module.`);
      }, 1500);
    });
  }
};