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

const TRANSLATIONS = {
  hr: {
    btnNew: 'Novo', tipNew: 'Novi dokument (Ctrl+N)',
    btnOpen: 'Otvori', tipOpen: 'Otvori datoteku (Ctrl+O)',
    btnSave: 'Spremi', tipSave: 'Spremi (Ctrl+S)',
    btnSaveAs: 'Spremi kao...', tipSaveAs: 'Spremi kao...',
    btnFind: 'Traži', tipFind: 'Traži u tekstu (Ctrl+F)',
    wrapOn: 'Word Wrap: ON', wrapOff: 'Word Wrap: OFF',
    linesOn: 'Brojevi redaka: ON', linesOff: 'Brojevi redaka: OFF',
    minimapOn: 'Minimap: ON', minimapOff: 'Minimap: OFF',
    themeDark: 'Tema: Dark', themeLight: 'Tema: Light',
    tipFontDec: 'Smanji font', tipFontInc: 'Povećaj font',
    tipSyntax: 'Odabir sintakse', tipUiLang: 'Jezik sučelja',
    optPlaintext: 'Obični tekst / Log',
    untitled: 'Novi dokument',
    tipCloseTab: 'Zatvori karticu (Ctrl+W)',
    line: 'Red', col: 'Stupac',
    confirmClose: (name) => 'Dokument "' + name + '" ima nespremljene promjene. Svejedno zatvoriti?',
    errOpen: 'Greška pri otvaranju datoteke: ',
    errSave: 'Greška pri spremanju datoteke: '
  },
  sl: {
    btnNew: 'Novo', tipNew: 'Nov dokument (Ctrl+N)',
    btnOpen: 'Odpri', tipOpen: 'Odpri datoteko (Ctrl+O)',
    btnSave: 'Shrani', tipSave: 'Shrani (Ctrl+S)',
    btnSaveAs: 'Shrani kot...', tipSaveAs: 'Shrani kot...',
    btnFind: 'Najdi', tipFind: 'Najdi v besedilu (Ctrl+F)',
    wrapOn: 'Prelom vrstic: ON', wrapOff: 'Prelom vrstic: OFF',
    linesOn: 'Številke vrstic: ON', linesOff: 'Številke vrstic: OFF',
    minimapOn: 'Minimap: ON', minimapOff: 'Minimap: OFF',
    themeDark: 'Tema: Temna', themeLight: 'Tema: Svetla',
    tipFontDec: 'Zmanjšaj pisavo', tipFontInc: 'Povečaj pisavo',
    tipSyntax: 'Izbira sintakse', tipUiLang: 'Jezik vmesnika',
    optPlaintext: 'Navadno besedilo / Log',
    untitled: 'Nov dokument',
    tipCloseTab: 'Zapri zavihek (Ctrl+W)',
    line: 'Vrstica', col: 'Stolpec',
    confirmClose: (name) => 'Dokument "' + name + '" ima neshranjene spremembe. Vseeno zaprem?',
    errOpen: 'Napaka pri odpiranju datoteke: ',
    errSave: 'Napaka pri shranjevanju datoteke: '
  },
  en: {
    btnNew: 'New', tipNew: 'New document (Ctrl+N)',
    btnOpen: 'Open', tipOpen: 'Open file (Ctrl+O)',
    btnSave: 'Save', tipSave: 'Save (Ctrl+S)',
    btnSaveAs: 'Save As...', tipSaveAs: 'Save As...',
    btnFind: 'Find', tipFind: 'Find in text (Ctrl+F)',
    wrapOn: 'Word Wrap: ON', wrapOff: 'Word Wrap: OFF',
    linesOn: 'Line numbers: ON', linesOff: 'Line numbers: OFF',
    minimapOn: 'Minimap: ON', minimapOff: 'Minimap: OFF',
    themeDark: 'Theme: Dark', themeLight: 'Theme: Light',
    tipFontDec: 'Decrease font size', tipFontInc: 'Increase font size',
    tipSyntax: 'Select syntax', tipUiLang: 'Interface language',
    optPlaintext: 'Plain Text / Log',
    untitled: 'Untitled',
    tipCloseTab: 'Close tab (Ctrl+W)',
    line: 'Line', col: 'Col',
    confirmClose: (name) => 'Document "' + name + '" has unsaved changes. Close anyway?',
    errOpen: 'Error opening file: ',
    errSave: 'Error saving file: '
  },
  it: {
    btnNew: 'Nuovo', tipNew: 'Nuovo documento (Ctrl+N)',
    btnOpen: 'Apri', tipOpen: 'Apri file (Ctrl+O)',
    btnSave: 'Salva', tipSave: 'Salva (Ctrl+S)',
    btnSaveAs: 'Salva con nome...', tipSaveAs: 'Salva con nome...',
    btnFind: 'Trova', tipFind: 'Trova nel testo (Ctrl+F)',
    wrapOn: 'A capo automatico: ON', wrapOff: 'A capo automatico: OFF',
    linesOn: 'Numeri riga: ON', linesOff: 'Numeri riga: OFF',
    minimapOn: 'Minimappa: ON', minimapOff: 'Minimappa: OFF',
    themeDark: 'Tema: Scuro', themeLight: 'Tema: Chiaro',
    tipFontDec: 'Riduci carattere', tipFontInc: 'Ingrandisci carattere',
    tipSyntax: 'Seleziona sintassi', tipUiLang: 'Lingua interfaccia',
    optPlaintext: 'Testo semplice / Log',
    untitled: 'Senza titolo',
    tipCloseTab: 'Chiudi scheda (Ctrl+W)',
    line: 'Riga', col: 'Col',
    confirmClose: (name) => 'Il documento "' + name + '" ha modifiche non salvate. Chiudere comunque?',
    errOpen: 'Errore durante l\'apertura del file: ',
    errSave: 'Errore durante il salvataggio del file: '
  },
  de: {
    btnNew: 'Neu', tipNew: 'Neues Dokument (Strg+N)',
    btnOpen: 'Öffnen', tipOpen: 'Datei öffnen (Strg+O)',
    btnSave: 'Speichern', tipSave: 'Speichern (Strg+S)',
    btnSaveAs: 'Speichern unter...', tipSaveAs: 'Speichern unter...',
    btnFind: 'Suchen', tipFind: 'Im Text suchen (Strg+F)',
    wrapOn: 'Zeilenumbruch: EIN', wrapOff: 'Zeilenumbruch: AUS',
    linesOn: 'Zeilennummern: EIN', linesOff: 'Zeilennummern: AUS',
    minimapOn: 'Minimap: EIN', minimapOff: 'Minimap: AUS',
    themeDark: 'Design: Dunkel', themeLight: 'Design: Hell',
    tipFontDec: 'Schrift verkleinern', tipFontInc: 'Schrift vergrößern',
    tipSyntax: 'Syntax auswählen', tipUiLang: 'Oberflächensprache',
    optPlaintext: 'Klartext / Log',
    untitled: 'Unbenannt',
    tipCloseTab: 'Tab schließen (Strg+W)',
    line: 'Zeile', col: 'Spalte',
    confirmClose: (name) => 'Das Dokument "' + name + '" hat ungespeicherte Änderungen. Trotzdem schließen?',
    errOpen: 'Fehler beim Öffnen der Datei: ',
    errSave: 'Fehler beim Speichern der Datei: '
  },
  fr: {
    btnNew: 'Nouveau', tipNew: 'Nouveau document (Ctrl+N)',
    btnOpen: 'Ouvrir', tipOpen: 'Ouvrir un fichier (Ctrl+O)',
    btnSave: 'Enregistrer', tipSave: 'Enregistrer (Ctrl+S)',
    btnSaveAs: 'Enregistrer sous...', tipSaveAs: 'Enregistrer sous...',
    btnFind: 'Rechercher', tipFind: 'Rechercher dans le texte (Ctrl+F)',
    wrapOn: 'Retour à la ligne : OUI', wrapOff: 'Retour à la ligne : NON',
    linesOn: 'Numéros de ligne : OUI', linesOff: 'Numéros de ligne : NON',
    minimapOn: 'Minimap : OUI', minimapOff: 'Minimap : NON',
    themeDark: 'Thème : Sombre', themeLight: 'Thème : Clair',
    tipFontDec: 'Réduire la police', tipFontInc: 'Agrandir la police',
    tipSyntax: 'Choisir la syntaxe', tipUiLang: 'Langue de l\'interface',
    optPlaintext: 'Texte brut / Log',
    untitled: 'Sans titre',
    tipCloseTab: 'Fermer l\'onglet (Ctrl+W)',
    line: 'Ligne', col: 'Col',
    confirmClose: (name) => 'Le document "' + name + '" contient des modifications non enregistrées. Fermer quand même ?',
    errOpen: 'Erreur lors de l\'ouverture du fichier : ',
    errSave: 'Erreur lors de l\'enregistrement du fichier : '
  },
  pl: {
    btnNew: 'Nowy', tipNew: 'Nowy dokument (Ctrl+N)',
    btnOpen: 'Otwórz', tipOpen: 'Otwórz plik (Ctrl+O)',
    btnSave: 'Zapisz', tipSave: 'Zapisz (Ctrl+S)',
    btnSaveAs: 'Zapisz jako...', tipSaveAs: 'Zapisz jako...',
    btnFind: 'Znajdź', tipFind: 'Znajdź w tekście (Ctrl+F)',
    wrapOn: 'Zawijanie wierszy: WŁ.', wrapOff: 'Zawijanie wierszy: WYŁ.',
    linesOn: 'Numery wierszy: WŁ.', linesOff: 'Numery wierszy: WYŁ.',
    minimapOn: 'Minimapa: WŁ.', minimapOff: 'Minimapa: WYŁ.',
    themeDark: 'Motyw: Ciemny', themeLight: 'Motyw: Jasny',
    tipFontDec: 'Zmniejsz czcionkę', tipFontInc: 'Powiększ czcionkę',
    tipSyntax: 'Wybierz składnię', tipUiLang: 'Język interfejsu',
    optPlaintext: 'Zwykły tekst / Log',
    untitled: 'Bez tytułu',
    tipCloseTab: 'Zamknij kartę (Ctrl+W)',
    line: 'Wiersz', col: 'Kol',
    confirmClose: (name) => 'Dokument "' + name + '" ma niezapisane zmiany. Zamknąć mimo to?',
    errOpen: 'Błąd otwierania pliku: ',
    errSave: 'Błąd zapisywania pliku: '
  }
};
let currentUiLang = localStorage.getItem('uiLang') || 'hr';
if (!TRANSLATIONS[currentUiLang]) currentUiLang = 'hr';

function t() {
  return TRANSLATIONS[currentUiLang];
}

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
let showMinimap = false;
let isWordWrap = localStorage.getItem('wordWrap') === 'on';
let currentFontSize = parseInt(localStorage.getItem('fontSize'), 10) || 14;

const editor = monaco.editor.create(document.getElementById('editor-container'), {
  theme: 'custom-dark',
  automaticLayout: true,
  fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
  fontSize: currentFontSize,
  lineHeight: Math.round(currentFontSize * 1.5),
  fontLigatures: false,
  minimap: { enabled: false },
  lineNumbers: 'on',
  wordWrap: isWordWrap ? 'on' : 'off',
  wrappingStrategy: 'advanced'
});


let tabs = [];
let activeTabId = null;
let untitledCounter = 1;

const tabsBar = document.getElementById('tabs-bar');
const filePathLabel = document.getElementById('file-path');
const cursorPosLabel = document.getElementById('cursor-pos');
const langSelect = document.getElementById('lang-select');
const uiLangSelect = document.getElementById('ui-lang-select');
const fontSizeLabel = document.getElementById('font-size-label');

uiLangSelect.value = currentUiLang;
fontSizeLabel.textContent = currentFontSize + 'px';

function updateFontSize(newSize) {
  currentFontSize = Math.min(36, Math.max(10, newSize));
  localStorage.setItem('fontSize', currentFontSize);
  fontSizeLabel.textContent = currentFontSize + 'px';
  editor.updateOptions({
    fontSize: currentFontSize,
    lineHeight: Math.round(currentFontSize * 1.5)
  });
  monaco.editor.remeasureFonts();
  editor.layout();
  editor.render(true);
}


function applyUiLanguage() {
  const tr = t();
  document.documentElement.lang = currentUiLang;

  const btnNew = document.getElementById('btn-new');
  btnNew.textContent = tr.btnNew;
  btnNew.title = tr.tipNew;

  const btnOpen = document.getElementById('btn-open');
  btnOpen.textContent = tr.btnOpen;
  btnOpen.title = tr.tipOpen;

  const btnSave = document.getElementById('btn-save');
  btnSave.textContent = tr.btnSave;
  btnSave.title = tr.tipSave;

  const btnSaveAs = document.getElementById('btn-save-as');
  btnSaveAs.textContent = tr.btnSaveAs;
  btnSaveAs.title = tr.tipSaveAs;

  const btnFind = document.getElementById('btn-find');
  btnFind.textContent = tr.btnFind;
  btnFind.title = tr.tipFind;

  document.getElementById('btn-wrap').textContent = isWordWrap ? tr.wrapOn : tr.wrapOff;
  document.getElementById('btn-lines').textContent = showLineNumbers ? tr.linesOn : tr.linesOff;
  document.getElementById('btn-minimap').textContent = showMinimap ? tr.minimapOn : tr.minimapOff;
  document.getElementById('btn-theme').textContent = isDark ? tr.themeDark : tr.themeLight;

  document.getElementById('btn-font-dec').title = tr.tipFontDec;
  document.getElementById('btn-font-inc').title = tr.tipFontInc;
  langSelect.title = tr.tipSyntax;
  uiLangSelect.title = tr.tipUiLang;
  document.getElementById('opt-plaintext').textContent = tr.optPlaintext;

  tabs.forEach(tab => {
    if (!tab.filePath && tab.untitledNum) {
      tab.title = tr.untitled + ' ' + tab.untitledNum;
    }
  });

  const activeTab = tabs.find(tb => tb.id === activeTabId);
  if (activeTab) {
    filePathLabel.textContent = activeTab.filePath || activeTab.title;
  }

  const pos = editor.getPosition() || { lineNumber: 1, column: 1 };
  cursorPosLabel.textContent = tr.line + ' ' + pos.lineNumber + ', ' + tr.col + ' ' + pos.column;

  renderTabs();
}

uiLangSelect.onchange = (e) => {
  currentUiLang = e.target.value;
  localStorage.setItem('uiLang', currentUiLang);
  applyUiLanguage();
};

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
  const tr = t();
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
    closeBtn.title = tr.tipCloseTab;
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
    const existing = tabs.find(tb => tb.filePath === filePath);
    if (existing) {
      switchTab(existing.id);
      return;
    }
  }

  const tr = t();
  const id = Date.now() + Math.random();
  const lang = detectLanguage(filePath);
  const num = filePath ? null : untitledCounter++;
  const title = filePath ? getFileName(filePath) : (tr.untitled + ' ' + num);

  const model = monaco.editor.createModel(content, lang);
  const tab = {
    id,
    title,
    untitledNum: num,
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
  const tab = tabs.find(tb => tb.id === id);
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
  const index = tabs.findIndex(tb => tb.id === id);
  if (index === -1) return;

  const tab = tabs[index];
  if (tab.isDirty) {
    const ok = confirm(t().confirmClose(tab.title));
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
  const tr = t();
  cursorPosLabel.textContent = tr.line + ' ' + e.position.lineNumber + ', ' + tr.col + ' ' + e.position.column;
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
    alert(t().errOpen + err);
  }
}

async function handleSaveFile(forceSaveAs = false) {
  const tab = tabs.find(tb => tb.id === activeTabId);
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
    tab.untitledNum = null;
    tab.title = getFileName(targetPath);
    tab.isDirty = false;

    const newLang = detectLanguage(targetPath);
    monaco.editor.setModelLanguage(tab.model, newLang);
    langSelect.value = newLang;
    filePathLabel.textContent = targetPath;
    renderTabs();
  } catch (err) {
    alert(t().errSave + err);
  }
}

document.getElementById('btn-new').onclick = () => createNewTab();
document.getElementById('btn-open').onclick = handleOpenFile;
document.getElementById('btn-save').onclick = () => handleSaveFile(false);
document.getElementById('btn-save-as').onclick = () => handleSaveFile(true);

document.getElementById('btn-find').onclick = () => {
  editor.trigger('keyboard', 'actions.find', null);
};

document.getElementById('btn-wrap').onclick = () => {
  isWordWrap = !isWordWrap;
  localStorage.setItem('wordWrap', isWordWrap ? 'on' : 'off');
  editor.updateOptions({ wordWrap: isWordWrap ? 'on' : 'off' });
  applyUiLanguage();
};

document.getElementById('btn-lines').onclick = () => {
  showLineNumbers = !showLineNumbers;
  editor.updateOptions({ lineNumbers: showLineNumbers ? 'on' : 'off' });
  applyUiLanguage();
};

document.getElementById('btn-minimap').onclick = () => {
  showMinimap = !showMinimap;
  editor.updateOptions({ minimap: { enabled: showMinimap } });
  applyUiLanguage();
};

document.getElementById('btn-theme').onclick = () => {
  isDark = !isDark;
  monaco.editor.setTheme(isDark ? 'custom-dark' : 'vs');
  document.body.classList.toggle('light-mode', !isDark);
  applyUiLanguage();
};

document.getElementById('btn-font-dec').onclick = () => updateFontSize(currentFontSize - 1);
document.getElementById('btn-font-inc').onclick = () => updateFontSize(currentFontSize + 1);

langSelect.onchange = (e) => {
  const tab = tabs.find(tb => tb.id === activeTabId);
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
        const idx = tabs.findIndex(tb => tb.id === activeTabId);
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
          alert(t().errOpen + filePath + ': ' + err);
        }
      }
    }
  }
});

document.fonts.ready.then(() => {
  monaco.editor.remeasureFonts();
  editor.layout();
});


createNewTab();
applyUiLanguage();
