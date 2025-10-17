// Custom Monaco Editor themes that match our design system

export const inkwellDarkTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
    { token: 'keyword', foreground: '2CA6A4', fontStyle: 'bold' },
    { token: 'string', foreground: 'C86E5A' },
    { token: 'number', foreground: 'F39C12' },
    { token: 'type', foreground: '9B59B6' },
    { token: 'function', foreground: '3498DB' },
    { token: 'variable', foreground: 'E8E8E8' },
    { token: 'operator', foreground: '2CA6A4' },
    { token: 'delimiter', foreground: 'BDC3C7' },
  ],
  colors: {
    'editor.background': '#1A1E23',        // --editor-bg
    'editor.foreground': '#E8E8E8',        // Light text
    'editor.lineHighlightBackground': '#242830', // --editor-line-highlight  
    'editor.selectionBackground': '#2A4A4A',     // --editor-selection
    'editor.selectionHighlightBackground': '#2A4A4A80',
    'editor.wordHighlightBackground': '#2A4A4A40',
    'editor.wordHighlightStrongBackground': '#2A4A4A80',
    'editorCursor.foreground': '#2CA6A4',        // Teal cursor
    'editorIndentGuide.background': '#2A2E35',
    'editorIndentGuide.activeBackground': '#2CA6A4',
    'editorLineNumber.foreground': '#6A737D',
    'editorLineNumber.activeForeground': '#2CA6A4',
    'scrollbar.shadow': '#00000050',
    'scrollbarSlider.background': '#2A2E3580',
    'scrollbarSlider.hoverBackground': '#2CA6A480',
    'scrollbarSlider.activeBackground': '#2CA6A4',
    'minimap.background': '#1A1E23',
    'minimapSlider.background': '#2A2E3540',
    'minimapSlider.hoverBackground': '#2A2E3580',
    'minimapSlider.activeBackground': '#2CA6A480',
  }
};

export const inkwellLightTheme = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
    { token: 'keyword', foreground: '2CA6A4', fontStyle: 'bold' },
    { token: 'string', foreground: 'C86E5A' },
    { token: 'number', foreground: 'E67E22' },
    { token: 'type', foreground: '8E44AD' },
    { token: 'function', foreground: '2980B9' },
    { token: 'variable', foreground: '2C3E50' },
    { token: 'operator', foreground: '2CA6A4' },
    { token: 'delimiter', foreground: '34495E' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#2C3E50',
    'editor.lineHighlightBackground': '#F8F9FA',
    'editor.selectionBackground': '#BDE4E3',
    'editor.selectionHighlightBackground': '#BDE4E380',
    'editorCursor.foreground': '#2CA6A4',
    'editorIndentGuide.background': '#E1E8ED',
    'editorIndentGuide.activeBackground': '#2CA6A4',
    'editorLineNumber.foreground': '#6A737D',
    'editorLineNumber.activeForeground': '#2CA6A4',
  }
};