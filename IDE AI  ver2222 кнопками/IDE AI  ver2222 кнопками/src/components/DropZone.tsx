import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  children: React.ReactNode;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, children }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesDropped(files);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full transition-all duration-300`}
    >
      {isDragActive && (
        <div className="absolute inset-0 bg-slate-900 bg-opacity-90 flex flex-col justify-center items-center z-50 border-4 border-dashed border-cyan-500 rounded-lg p-4">
          <UploadCloud className="w-16 h-16 text-cyan-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mt-4">Перетащите файлы сюда</h2>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Мы автоматически добавим ваши файлы, картинки или архивы в проект.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Поддерживаются .ts, .tsx, .html, .css, .json, изображения
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
