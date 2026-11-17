self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new Worker(new URL('../node_modules/monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new Worker(new URL('../node_modules/monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new Worker(new URL('../node_modules/monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(new URL('../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), { type: 'module' });
    }
    return new Worker(new URL('../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' });
  }
};

import * as monaco from 'monaco-editor';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { getCurrentWebview } from '@tauri-apps/api/webview';

monaco.editor.defineTheme('custom-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#1e1e1e',
  }
});

let isDark = true;
let showLineNumbers = true;

const editor = monaco.editor.create(document.getElementById('editor-container'), {
  theme: 'custom-dark',
  automaticLayout: true,
  fontFamily: 'Consolas, "Courier New", monospace',
  fontSize: 14,
  lineHeight: 21,
  fontLigatures: false,
  disableMonospaceOptimizations: true,
  minimap: { enabled: true },
  lineNumbers: 'on',
  wordWrap: 'off'
});

let tabs = [];
let activeTabId = null;
let untitledCounter = 1;

const tabsBar = document.getElementById('tabs-bar');
const filePathLabel = document.getElementById('file-path');
const cursorPosLabel = document.getElementById('cursor-pos');
const langSelect = document.getElementById('lang-select');

// Filtri formata za prozore Otvori i Spremi kao
const FILE_FILTERS = [
  { name: 'Tekstualna datoteka (*.txt)', extensions: ['txt'] },
  { name: 'JSON datoteka (*.json)', extensions: ['json'] },
  { name: 'Lua skripta (*.lua)', extensions: ['lua'] },
  { name: 'Log datoteka (*.log)', extensions: ['log'] },
  { name: 'HTML dokument (*.html, *.htm)', extensions: ['html', 'htm'] },
  { name: 'CSS stilovi (*.css, *.scss)', extensions: ['css', 'scss'] },
  { name: 'JavaScript / TypeScript (*.js, *.ts)', extensions: ['js', 'ts'] },
  { name: 'XML datoteka (*.xml)', extensions: ['xml'] },
  { name: 'SQL upit (*.sql)', extensions: ['sql'] },
  { name: 'YAML konfiguracija (*.yml, *.yaml)', extensions: ['yml', 'yaml'] },
  { name: 'Python skripta (*.py)', extensions: ['py'] },
  { name: 'Rust izvorni kod (*.rs)', extensions: ['rs'] },
  { name: 'Markdown dokument (*.md)', extensions: ['md'] },
  { name: 'Konfiguracijske datoteke (*.ini, *.cfg, *.csv)', extensions: ['ini', 'cfg', 'csv'] },
  { name: 'Sve datoteke (*.*)', extensions: ['*'] }
];

function detectLanguage(filePath) {
  if (!filePath) return 'plaintext';
  const ext = filePath.split('.').pop().toLowerCase();
  const map = {
    txt: 'plaintext',
    log: 'plaintext',
    ini: 'ini',
    cfg: 'ini',
    lua: 'lua',
    html: 'html', htm: 'html',
    css: 'css', scss: 'css',
    js: 'javascript', ts: 'typescript',
    json: 'json',
    py: 'python',
    xml: 'xml',
    sql: 'sql',
    yml: 'yaml', yaml: 'yaml',
    rs: 'rust',
    md: 'markdown'
  };
  return map[ext] || 'plaintext';
}

function getFileName(filePath) {
  if (!filePath) return null;
  return filePath.split(/[/\\]/).pop();
}

function renderTabs() {
  tabsBar.innerHTML = '';
  tabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
    tabEl.title = tab.filePath || tab.title;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'tab-title';
    titleSpan.textContent = (tab.isDirty ? '* ' : '') + tab.title;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.title = 'Zatvori karticu (Ctrl+W)';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    };

    tabEl.onclick = () => switchTab(tab.id);
    tabEl.appendChild(titleSpan);
    tabEl.appendChild(closeBtn);
    tabsBar.appendChild(tabEl);
  });
}

function createNewTab(filePath = null, content = '') {
  if (filePath) {
    const existing = tabs.find(t => t.filePath === filePath);
    if (existing) {
      switchTab(existing.id);
      return;
    }
  }

  const id = Date.now() + Math.random();
  const lang = detectLanguage(filePath);
  const title = filePath ? getFileName(filePath) : `Novi dokument ${untitledCounter++}`;
  const model = monaco.editor.createModel(content, lang);

  const tab = {
    id,
    title,
    filePath,
    model,
    isDirty: false
  };

  model.onDidChangeContent(() => {
    if (!tab.isDirty) {
      tab.isDirty = true;
      renderTabs();
    }
  });

  tabs.push(tab);
  switchTab(id);
}

function switchTab(id) {
  const tab = tabs.find(t => t.id === id);
  if (!tab) return;

  activeTabId = id;
  editor.setModel(tab.model);
  filePathLabel.textContent = tab.filePath || tab.title;
  langSelect.value = tab.model.getLanguageId();
  renderTabs();
  editor.layout();
  editor.focus();
}

function closeTab(id) {
  const index = tabs.findIndex(t => t.id === id);
  if (index === -1) return;

  const tab = tabs[index];
  if (tab.isDirty) {
    const ok = confirm(`Dokument "${tab.title}" ima nespremljene promjene. Svejedno zatvoriti?`);
    if (!ok) return;
  }

  tab.model.dispose();
  tabs.splice(index, 1);

  if (tabs.length === 0) {
    createNewTab();
  } else if (activeTabId === id) {
    const nextTab = tabs[Math.max(0, index - 1)];
    switchTab(nextTab.id);
  } else {
    renderTabs();
    editor.layout();
  }
}

editor.onDidChangeCursorPosition((e) => {
  cursorPosLabel.textContent = `Red ${e.position.lineNumber}, Stupac ${e.position.column}`;
});

async function handleOpenFile() {
  try {
    const selected = await open({
      multiple: true,
      filters: [
        { name: 'Sve podržane datoteke', extensions: ['txt', 'json', 'lua', 'log', 'html', 'htm', 'css', 'js', 'ts', 'xml', 'sql', 'yml', 'yaml', 'py', 'rs', 'md', 'ini', 'cfg', 'csv'] },
        ...FILE_FILTERS
      ]
    });
    if (!selected) return;
    const paths = Array.isArray(selected) ? selected : [selected];
    for (const filePath of paths) {
      const content = await readTextFile(filePath);
      createNewTab(filePath, content);
    }
  } catch (err) {
    alert('Greška pri otvaranju datoteke: ' + err);
  }
}

async function handleSaveFile(forceSaveAs = false) {
  const tab = tabs.find(t => t.id === activeTabId);
  if (!tab) return;

  try {
    let targetPath = tab.filePath;
    if (!targetPath || forceSaveAs) {
      targetPath = await save({
        defaultPath: tab.filePath || tab.title,
        filters: FILE_FILTERS
      });
      if (!targetPath) return;
    }

    await writeTextFile(targetPath, tab.model.getValue());
    tab.filePath = targetPath;
    tab.title = getFileName(targetPath);
    tab.isDirty = false;

    const newLang = detectLanguage(targetPath);
    monaco.editor.setModelLanguage(tab.model, newLang);
    langSelect.value = newLang;
    filePathLabel.textContent = targetPath;
    renderTabs();
  } catch (err) {
    alert('Greška pri spremanju datoteke: ' + err);
  }
}

document.getElementById('btn-new').onclick = () => createNewTab();
document.getElementById('btn-open').onclick = handleOpenFile;
document.getElementById('btn-save').onclick = () => handleSaveFile(false);
document.getElementById('btn-save-as').onclick = () => handleSaveFile(true);

document.getElementById('btn-find').onclick = () => {
  editor.trigger('keyboard', 'actions.find', null);
};

document.getElementById('btn-lines').onclick = (e) => {
  showLineNumbers = !showLineNumbers;
  editor.updateOptions({ lineNumbers: showLineNumbers ? 'on' : 'off' });
  e.target.textContent = `Brojevi redaka: ${showLineNumbers ? 'ON' : 'OFF'}`;
};

document.getElementById('btn-theme').onclick = (e) => {
  isDark = !isDark;
  monaco.editor.setTheme(isDark ? 'custom-dark' : 'vs');
  document.body.classList.toggle('light-mode', !isDark);
  e.target.textContent = `Tema: ${isDark ? 'Dark' : 'Light'}`;
};

langSelect.onchange = (e) => {
  const tab = tabs.find(t => t.id === activeTabId);
  if (tab) {
    monaco.editor.setModelLanguage(tab.model, e.target.value);
  }
};

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    const key = e.key.toLowerCase();
    if (key === 'n') {
      e.preventDefault();
      createNewTab();
    } else if (key === 'o') {
      e.preventDefault();
      handleOpenFile();
    } else if (key === 's') {
      e.preventDefault();
      handleSaveFile(e.shiftKey);
    } else if (key === 'w') {
      e.preventDefault();
      if (activeTabId) closeTab(activeTabId);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (tabs.length > 1) {
        const idx = tabs.findIndex(t => t.id === activeTabId);
        const nextIdx = e.shiftKey ? (idx - 1 + tabs.length) % tabs.length : (idx + 1) % tabs.length;
        switchTab(tabs[nextIdx].id);
      }
    }
  }
});

getCurrentWebview().onDragDropEvent(async (event) => {
  if (event.payload.type === 'drop') {
    const paths = event.payload.paths;
    if (paths && paths.length > 0) {
      for (const filePath of paths) {
        try {
          const content = await readTextFile(filePath);
          createNewTab(filePath, content);
        } catch (err) {
          alert(`Greška pri otvaranju datoteke ${filePath}: ` + err);
        }
      }
    }
  }
});

window.addEventListener('load', () => {
monaco.editor.remeasureFonts();
editor.layout();
});
createNewTab();