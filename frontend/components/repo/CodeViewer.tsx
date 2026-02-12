import React from 'react';
import { FileNode } from '../../types';

interface CodeViewerProps {
  file: FileNode | null;
  isLoading?: boolean;
  error?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file, isLoading = false, error = '' }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
        <p className="text-sm font-medium">Loading file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-600 bg-gray-50/30">
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }
  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
        <div className="bg-white p-6 rounded-full shadow-sm mb-6">
          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xl font-medium text-gray-500">Select a file to view content</p>
        <p className="text-gray-400 mt-2">Browse the directory tree on the left</p>
      </div>
    );
  }

  const content = file.content || '// No content available';

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-base text-gray-700 font-medium">{file.name}</span>
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">{file.language}</span>
        </div>
        <div className="text-xs text-gray-400">Read-only</div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-8">
        <pre className="font-mono text-[15px] text-gray-800 leading-[1.7] whitespace-pre-wrap font-medium">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};