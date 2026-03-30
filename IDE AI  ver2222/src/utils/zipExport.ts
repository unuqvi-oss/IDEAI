import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  parentId: string | null;
}

export const exportProjectToZip = async (files: FileNode[], projectName: string = 'my-project') => {
  const zip = new JSZip();

  const buildZipTree = (currentFiles: FileNode[]) => {
    // 1. Create a map of files by parentId
    const fileMap: { [key: string]: FileNode[] } = {};
    const rootFiles: FileNode[] = [];

    currentFiles.forEach((file) => {
      if (!file.parentId) {
        rootFiles.push(file);
      } else {
        if (!fileMap[file.parentId]) {
          fileMap[file.parentId] = [];
        }
        fileMap[file.parentId].push(file);
      }
    });

    // 2. Recursive helper to add files to folders
    const addToFolder = (folder: JSZip, children: FileNode[]) => {
      children.forEach((child) => {
        if (child.type === 'directory') {
          const newFolder = folder.folder(child.name);
          if (newFolder && fileMap[child.id]) {
            addToFolder(newFolder, fileMap[child.id]);
          }
        } else {
          folder.file(child.name, child.content || '');
        }
      });
    };

    // 3. Process root
    rootFiles.forEach((file) => {
      if (file.type === 'directory') {
        const folder = zip.folder(file.name);
        if (folder && fileMap[file.id]) {
          addToFolder(folder, fileMap[file.id]);
        }
      } else {
        zip.file(file.name, file.content || '');
      }
    });
  };

  buildZipTree(files);

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${projectName.replace(/\s+/g, '-').toLowerCase()}-export.zip`);
};
