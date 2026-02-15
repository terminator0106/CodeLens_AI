import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, FileText, File, FileJson, FileType } from 'lucide-react';
import { FileNode } from '../../types';

interface FileTreeProps {
  node: FileNode;
  onSelect: (node: FileNode) => void;
  selectedId?: string;
  depth?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ node, onSelect, selectedId, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth === 0 || depth === 1); // Open root and first level by default
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  const getIcon = () => {
    if (node.type === 'folder') return isOpen ? <FolderOpen size={16} className="text-primary" /> : <Folder size={16} className="text-muted-foreground" />;
    if (node.name.endsWith('.tsx') || node.name.endsWith('.jsx')) return <FileCode size={16} className="text-chart-blue" />;
    if (node.name.endsWith('.ts') || node.name.endsWith('.js')) return <FileCode size={16} className="text-chart-yellow" />;
    if (node.name.endsWith('.json')) return <FileJson size={16} className="text-chart-green" />;
    if (node.name.endsWith('.md')) return <FileText size={16} className="text-muted-foreground" />;
    if (node.name.endsWith('.css') || node.name.endsWith('.scss')) return <FileType size={16} className="text-primary/60" />;
    return <File size={16} className="text-muted-foreground" />;
  };

  const fileCount = node.children?.filter(c => c.type === 'file').length || 0;
  const folderCount = node.children?.filter(c => c.type === 'folder').length || 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-2 px-2 cursor-pointer transition-all rounded-lg text-sm group ${isSelected
          ? 'bg-primary/10 text-primary font-semibold shadow-card'
          : node.type === 'folder'
            ? 'text-foreground hover:bg-secondary/50 font-medium'
            : 'text-muted-foreground hover:bg-secondary/30'
          } ${depth === 0 ? 'mb-1' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleToggle}
      >
        <span className="mr-2 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
          {node.type === 'folder' && (
            isOpen ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} />
          )}
          {node.type === 'file' && <div className="w-3.5" />}
        </span>
        <span className="mr-2 group-hover:scale-110 transition-transform">{getIcon()}</span>
        <span className="truncate flex-1">{node.name}</span>
        {node.type === 'folder' && !isOpen && (fileCount + folderCount > 0) && (
          <span className="text-xs text-muted-foreground ml-2 bg-secondary px-1.5 py-0.5 rounded">
            {fileCount + folderCount}
          </span>
        )}
      </div>

      {isOpen && node.children && (
        <div className={`${depth === 0 ? 'border-l-2 border-border ml-3' : ''}`}>
          {/* Folders first, then files */}
          {node.children.filter(c => c.type === 'folder').map(child => (
            <FileTree
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
          {node.children.filter(c => c.type === 'file').map(child => (
            <FileTree
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};