// Utility functions for managing files in the collaborative editor

import type { FileModel } from '@/types/collaboration';

export class FileManager {
  private files: Map<string, FileModel> = new Map();
  private activeFileId: string | null = null;

  constructor(initialFiles?: FileModel[]) {
    if (initialFiles) {
      initialFiles.forEach(file => {
        this.files.set(file.id, file);
      });
      if (initialFiles.length > 0) {
        this.activeFileId = initialFiles[0].id;
      }
    }
  }

  // Get all files
  getAllFiles(): FileModel[] {
    return Array.from(this.files.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get file by ID
  getFile(id: string): FileModel | undefined {
    return this.files.get(id);
  }

  // Get active file
  getActiveFile(): FileModel | undefined {
    return this.activeFileId ? this.files.get(this.activeFileId) : undefined;
  }

  // Set active file
  setActiveFile(id: string): boolean {
    if (this.files.has(id)) {
      this.activeFileId = id;
      return true;
    }
    return false;
  }

  // Create new file
  createFile(name: string, language: string, content: string = '', modifiedBy?: string): FileModel {
    const id = this.generateFileId();
    const file: FileModel = {
      id,
      name,
      language,
      content,
      lastModified: Date.now(),
      modifiedBy
    };
    
    this.files.set(id, file);
    
    // Set as active if it's the first file
    if (this.files.size === 1) {
      this.activeFileId = id;
    }
    
    return file;
  }

  // Update file content
  updateFile(id: string, updates: Partial<Omit<FileModel, 'id'>>, modifiedBy?: string): boolean {
    const file = this.files.get(id);
    if (!file) return false;

    const updatedFile: FileModel = {
      ...file,
      ...updates,
      lastModified: Date.now(),
      modifiedBy: modifiedBy || file.modifiedBy
    };

    this.files.set(id, updatedFile);
    return true;
  }

  // Delete file
  deleteFile(id: string): boolean {
    if (!this.files.has(id)) return false;
    
    this.files.delete(id);
    
    // If the deleted file was active, set a new active file
    if (this.activeFileId === id) {
      const remainingFiles = this.getAllFiles();
      this.activeFileId = remainingFiles.length > 0 ? remainingFiles[0].id : null;
    }
    
    return true;
  }

  // Rename file
  renameFile(id: string, newName: string, modifiedBy?: string): boolean {
    const file = this.files.get(id);
    if (!file) return false;

    // Update language based on file extension
    const language = this.getLanguageFromExtension(newName);
    
    return this.updateFile(id, { 
      name: newName, 
      language 
    }, modifiedBy);
  }

  // Get language from file extension
  getLanguageFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'py': 'python',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sh': 'shell',
      'bash': 'shell',
    };

    return languageMap[extension || ''] || 'plaintext';
  }

  // Generate unique file ID
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export files as JSON
  exportFiles(): string {
    const filesArray = this.getAllFiles();
    return JSON.stringify({
      files: filesArray,
      activeFileId: this.activeFileId,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // Import files from JSON
  importFiles(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.files || !Array.isArray(data.files)) {
        return false;
      }
      
      // Clear existing files
      this.files.clear();
      
      // Add imported files
      data.files.forEach((file: FileModel) => {
        if (file.id && file.name && file.language && file.content !== undefined) {
          this.files.set(file.id, file);
        }
      });
      
      // Set active file
      if (data.activeFileId && this.files.has(data.activeFileId)) {
        this.activeFileId = data.activeFileId;
      } else if (this.files.size > 0) {
        this.activeFileId = this.getAllFiles()[0].id;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import files:', error);
      return false;
    }
  }
}