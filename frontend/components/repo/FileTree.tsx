import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileCode, FileText, File } from 'lucide-react';
import { FileNode } from '../../types';

interface FileTreeProps {
  node: FileNode;
  onSelect: (node: FileNode) => void;
  selectedId?: string;
  depth?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ node, onSelect, selectedId, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth === 0); // Open root by default
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
    if (node.type === 'folder') return <Folder size={16} className={isOpen ? "text-primary" : "text-gray-400"} />;
    if (node.name.endsWith('.tsx') || node.name.endsWith('.ts')) return <FileCode size={16} className="text-blue-500" />;
    if (node.name.endsWith('.md')) return <FileText size={16} className="text-gray-500" />;
    return <File size={16} className="text-gray-400" />;
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1.5 px-2 cursor-pointer transition-colors rounded-md text-sm ${
          isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleToggle}
      >
        <span className="mr-1.5 flex-shrink-0 text-gray-400">
           {node.type === 'folder' && (
             isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
           )}
           {node.type === 'file' && <div className="w-3.5" />}
        </span>
        <span className="mr-2">{getIcon()}</span>
        <span className="truncate">{node.name}</span>
      </div>
      
      {isOpen && node.children && (
        <div>
          {node.children.map(child => (
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