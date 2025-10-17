// Types for real-time collaboration features

export interface FileModel {
  id: string;
  name: string;
  language: string;
  content: string;
  lastModified: number;
  modifiedBy?: string;
}

export interface Participant {
  id: string;
  name: string;
  status: 'online' | 'away' | 'idle';
  cursor?: CursorPosition;
  color: string;
  joinedAt: string;
}

export interface CursorPosition {
  line: number;
  column: number;
  fileId?: string;
}

export interface CodeOperation {
  type: 'insert' | 'delete' | 'replace';
  range: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  text?: string;
  fileId: string;
  userId: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system';
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  maxParticipants?: number;
  participants: Participant[];
  files: FileModel[];
}

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'cursor-move' | 'code-change' | 'file-create' | 'file-delete' | 'chat-message';
  payload: any;
  userId: string;
  timestamp: number;
}