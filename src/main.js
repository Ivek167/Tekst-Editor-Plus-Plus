import * as monaco from 'monaco-editor';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { getCurrentWebview } from '@tauri-apps/api/webview';

monaco.editor.defineTheme('custom-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'd4d4d4' },
    { token: 'identifier', foreground: '9cdcfe' },
    { token: 'keyword', foreground: '569cd6' },
    { token: 'string', foreground: 'ce9178' },
    { token: 'number', foreground: 'b5cea8' },
    { token: 'tag', foreground: '9cdcfe' },
    { token: 'attribute.name', foreground: '9cdcfe' }
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#9cdcfe'
  }
});

const editor = monaco.editor.create(document.getElementById('editor-container'), {
  value: '',
  language: 'plaintext',
  theme: 'custom-dark',
  automaticLayout: true,
  lineNumbers: 'on',
  fontSize: 14,
  minimap: { enabled: true },
  wordWrap: 'on'
});

let currentFilePath = null;
let showLineNumbers = true;
let isDarkMode = true;

editor.onDidChangeCursorPosition((e) => {
  document.getElementById('cursor-pos').textContent = `Red ${e.position.lineNumber}, Stupac ${e.position.column}`;
});

function detectLanguage(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const map = {
    'txt': 'plaintext', 'json': 'json', 'js': 'javascript',
    'xml': 'xml', 'config': 'xml', 'html': 'html', 'ini': 'ini', 'lua': 'lua'
  };
  const lang = map[ext] || 'plaintext';
  monaco.editor.setModelLanguage(editor.getModel(), lang);
  document.getElementById('lang-select').value = lang;
}

document.getElementById('btn-new').addEventListener('click', () => {
  editor.setValue('');
  currentFilePath = null;
  document.getElementById('file-path').textContent = 'Novi dokument (nespremljeno)';
});

document.getElementById('btn-open').addEventListener('click', async () => {
  const selected = await open({
    multiple: false,
    filters: [{
      name: 'Podržane datoteke',
      extensions: ['txt', 'json', 'js', 'xml', 'html', 'ini', 'lua', 'config', '*']
    }]
  });
  if (selected) {
    const content = await readTextFile(selected);
    editor.setValue(content);
    currentFilePath = selected;
    document.getElementById('file-path').textContent = selected;
    detectLanguage(selected);
  }
});

async function saveAsFile() {
  const filePath = await save({
    defaultPath: 'dokument.txt',
    filters: [
      { name: 'Tekstualni dokument (*.txt)', extensions: ['txt'] },
      { name: 'JSON datoteka (*.json)', extensions: ['json'] },
      { name: 'JavaScript (*.js)', extensions: ['js'] },
      { name: 'XML datoteka (*.xml)', extensions: ['xml'] },
      { name: 'HTML stranica (*.html)', extensions: ['html'] },
      { name: 'INI konfiguracija (*.ini)', extensions: ['ini'] },
      { name: 'Lua skripta (*.lua)', extensions: ['lua'] },
      { name: 'Config datoteka (*.config)', extensions: ['config'] },
      { name: 'Sve datoteke (*.*)', extensions: ['*'] }
    ]
  });

  if (filePath) {
    await writeTextFile(filePath, editor.getValue());
    currentFilePath = filePath;
    document.getElementById('file-path').textContent = filePath;
    detectLanguage(filePath);
  }
}

document.getElementById('btn-save').addEventListener('click', async () => {
  if (currentFilePath) {
    await writeTextFile(currentFilePath, editor.getValue());
  } else {
    await saveAsFile();
  }
});

document.getElementById('btn-save-as').addEventListener('click', saveAsFile);

document.getElementById('btn-find').addEventListener('click', () => {
  editor.focus();
  editor.trigger('keyboard', 'actions.find', null);
});

document.getElementById('btn-lines').addEventListener('click', (e) => {
  showLineNumbers = !showLineNumbers;
  editor.updateOptions({ lineNumbers: showLineNumbers ? 'on' : 'off' });
  e.target.textContent = `Brojevi redaka: ${showLineNumbers ? 'ON' : 'OFF'}`;
});

document.getElementById('btn-theme').addEventListener('click', (e) => {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    monaco.editor.setTheme('custom-dark');
    document.body.classList.remove('light-mode');
    e.target.textContent = 'Tema: Dark';
  } else {
    monaco.editor.setTheme('vs');
    document.body.classList.add('light-mode');
    e.target.textContent = 'Tema: Light';
  }
});

document.getElementById('lang-select').addEventListener('change', (e) => {
  monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
});
// Slušanje povlačenja datoteka (Drag and Drop)
getCurrentWebview().onDragDropEvent(async (event) => {
  if (event.payload.type === 'drop') {
    const paths = event.payload.paths;
    if (paths && paths.length > 0) {
      const filePath = paths[0];
      try {
        const content = await readTextFile(filePath);
        editor.setValue(content);

        // Ažuriraj putanju u statusnoj traci i globalnu varijablu
        const filePathLabel = document.getElementById('file-path');
        if (filePathLabel) filePathLabel.textContent = filePath;
        if (typeof currentFilePath !== 'undefined') currentFilePath = filePath;

        // Automatsko prepoznavanje jezika po ekstenziji
        const ext = filePath.split('.').pop().toLowerCase();
        const langMap = {
          html: 'html', htm: 'html', css: 'css', js: 'javascript',
          json: 'json', py: 'python', xml: 'xml', sql: 'sql', txt: 'plaintext'
        };
        const detectedLang = langMap[ext] || 'plaintext';
        monaco.editor.setModelLanguage(editor.getModel(), detectedLang);

        const langSelect = document.getElementById('lang-select');
        if (langSelect) langSelect.value = detectedLang;
      } catch (err) {
        alert('Greška pri otvaranju povučene datoteke: ' + err);
      }
    }
  }
});
