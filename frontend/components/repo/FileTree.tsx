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

  const getFileColor = () => {
    // TypeScript/TSX
    if (node.name.endsWith('.tsx')) return { icon: 'text-blue-400', text: 'text-blue-300' };
    if (node.name.endsWith('.ts')) return { icon: 'text-blue-500', text: 'text-blue-400' };

    // JavaScript/JSX
    if (node.name.endsWith('.jsx')) return { icon: 'text-yellow-400', text: 'text-yellow-300' };
    if (node.name.endsWith('.js')) return { icon: 'text-yellow-500', text: 'text-yellow-400' };

    // Python
    if (node.name.endsWith('.py')) return { icon: 'text-blue-400', text: 'text-blue-300' };

    // JSON
    if (node.name.endsWith('.json')) return { icon: 'text-green-400', text: 'text-green-300' };

    // Markdown
    if (node.name.endsWith('.md') || node.name.endsWith('.mdx')) return { icon: 'text-purple-400', text: 'text-purple-300' };

    // CSS/SCSS/SASS
    if (node.name.endsWith('.css')) return { icon: 'text-pink-400', text: 'text-pink-300' };
    if (node.name.endsWith('.scss') || node.name.endsWith('.sass')) return { icon: 'text-pink-500', text: 'text-pink-400' };

    // HTML
    if (node.name.endsWith('.html')) return { icon: 'text-orange-500', text: 'text-orange-400' };

    // Config files
    if (node.name.match(/\.(yaml|yml)$/)) return { icon: 'text-red-400', text: 'text-red-300' };
    if (node.name.match(/\.(toml|ini|conf)$/)) return { icon: 'text-gray-400', text: 'text-gray-300' };

    // Image files
    if (node.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return { icon: 'text-purple-500', text: 'text-purple-400' };

    // Env/config
    if (node.name.match(/^\.env/)) return { icon: 'text-yellow-600', text: 'text-yellow-500' };

    // Folders
    if (node.type === 'folder') {
      return { icon: isOpen ? 'text-yellow-500' : 'text-amber-500', text: 'text-foreground' };
    }

    // Default
    return { icon: 'text-gray-400', text: 'text-muted-foreground' };
  };

  const getIcon = () => {
    const colors = getFileColor();

    if (node.type === 'folder') {
      return isOpen ? <FolderOpen size={16} className={colors.icon} /> : <Folder size={16} className={colors.icon} />;
    }

    // TypeScript/JavaScript
    if (node.name.match(/\.(tsx?|jsx?)$/)) return <FileCode size={16} className={colors.icon} />;

    // Python
    if (node.name.endsWith('.py')) return <FileCode size={16} className={colors.icon} />;

    // JSON
    if (node.name.endsWith('.json')) return <FileJson size={16} className={colors.icon} />;

    // Markdown
    if (node.name.match(/\.mdx?$/)) return <FileText size={16} className={colors.icon} />;

    // CSS/Styles
    if (node.name.match(/\.(css|scss|sass)$/)) return <FileType size={16} className={colors.icon} />;

    // Default
    return <File size={16} className={colors.icon} />;
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