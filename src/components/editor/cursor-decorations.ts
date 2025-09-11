// Monaco editor cursor decorations for collaborative editing

export interface RemoteCursor {
  userId: string;
  userName: string;
  position: { line: number; column: number };
  color: string;
}

export class CursorDecorationManager {
  private editor: any;
  private decorations: Map<string, string[]> = new Map();

  constructor(editorInstance: any) {
    this.editor = editorInstance;
  }

  updateCursors(cursors: RemoteCursor[]) {
    console.log('[DECORATION CREATED] Updating cursors for', cursors.length, 'users');
    
    // Clear existing decorations
    this.clearAllDecorations();

    // Add new decorations for each cursor
    cursors.forEach(cursor => {
      console.log('[DECORATION CREATED] Adding decoration for user:', cursor.userName, 'at:', cursor.position);
      this.addCursorDecoration(cursor);
    });
  }

  private addCursorDecoration(cursor: RemoteCursor) {
    const { line, column } = cursor.position;
    
    // Create cursor line decoration
    const cursorDecoration: any = {
      range: new (window as any).monaco.Range(line, column, line, column),
      options: {
        className: `remote-cursor-${cursor.userId}`,
        stickiness: (window as any).monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        beforeContentClassName: `remote-cursor-line`,
      }
    };

    // Create user label decoration
    const labelDecoration: any = {
      range: new (window as any).monaco.Range(line, column, line, column),
      options: {
        glyphMarginClassName: `remote-cursor-glyph-${cursor.userId}`,
        stickiness: (window as any).monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        afterContentClassName: `remote-cursor-label`,
        after: {
          content: cursor.userName,
          inlineClassName: `remote-cursor-label-text`
        }
      }
    };

    // Apply decorations
    const decorationIds = this.editor.deltaDecorations([], [cursorDecoration, labelDecoration]);
    this.decorations.set(cursor.userId, decorationIds);

    // Inject CSS for this specific cursor
    this.injectCursorStyles(cursor);
  }

  private injectCursorStyles(cursor: RemoteCursor) {
    const styleId = `cursor-style-${cursor.userId}`;
    
    // Remove existing style for this user if it exists
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .monaco-editor .remote-cursor-${cursor.userId} {
        border-left: 2px solid ${cursor.color} !important;
        position: relative;
      }
      
      .monaco-editor .remote-cursor-line::before {
        content: '';
        position: absolute;
        left: -1px;
        top: 0;
        width: 2px;
        height: 100%;
        background-color: ${cursor.color};
        z-index: 1000;
      }
      
      .monaco-editor .remote-cursor-label-text {
        background-color: ${cursor.color};
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 500;
        position: absolute;
        top: -20px;
        left: -1px;
        white-space: nowrap;
        z-index: 1001;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .monaco-editor .remote-cursor-glyph-${cursor.userId} {
        background-color: ${cursor.color};
        border-radius: 50%;
        width: 8px !important;
        height: 8px !important;
        margin-left: 4px;
        margin-top: 6px;
      }
    `;
    
    document.head.appendChild(style);
  }

  private clearAllDecorations() {
    // Clear all cursor decorations
    this.decorations.forEach((decorationIds, userId) => {
      this.editor.deltaDecorations(decorationIds, []);
      
      // Remove associated styles
      const styleElement = document.getElementById(`cursor-style-${userId}`);
      if (styleElement) {
        styleElement.remove();
      }
    });
    
    this.decorations.clear();
  }

  dispose() {
    this.clearAllDecorations();
  }
}