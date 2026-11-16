import { defineConfig } from 'vite';
import monacoEditorPluginModule from 'vite-plugin-monaco-editor';

const isObjectWithDefaultFunction = (module) => (
  module != null &&
  typeof module === 'object' &&
  'default' in module &&
  typeof module.default === 'function'
);

const monacoEditorPlugin = isObjectWithDefaultFunction(monacoEditorPluginModule)
  ? monacoEditorPluginModule.default
  : monacoEditorPluginModule;

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json', 'html', 'css', 'typescript']
    })
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true
  }
});
