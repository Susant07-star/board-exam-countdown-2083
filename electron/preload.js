const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronWidget', {
  getConfig: () => ipcRenderer.sendSync('get-config'),
  toggleCollapse: () => ipcRenderer.send('toggle-collapse'),
  onCollapseState: (fn) => ipcRenderer.on('collapse-state', (_, state) => fn(state)),
});
