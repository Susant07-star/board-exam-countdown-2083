const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────
const configPath = path.join(app.getPath('userData'), 'widget-config.json');

function loadConfig() {
  try { if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf8')); }
  catch (_) {}
  return {};
}
function saveConfig(patch) {
  try { fs.writeFileSync(configPath, JSON.stringify({ ...loadConfig(), ...patch })); }
  catch (_) {}
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

let win, tray;
let isCollapsed = false;
let expandedBounds = null;

// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
  const cfg  = loadConfig();
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  
  const defaultW = 420;
  const defaultH = 320;

  win = new BrowserWindow({
    width: cfg.width || defaultW, 
    height: cfg.height || defaultH,
    x: cfg.x ?? sw - defaultW - 16,
    y: cfg.y ?? sh - defaultH - 16,
    minWidth: 150,
    minHeight: 80,
    frame: false, transparent: true, hasShadow: false,
    resizable: true,
    alwaysOnTop: cfg.alwaysOnTop || false, 
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
    },
    show: false,
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.once('ready-to-show', () => win.show());
  
  // Save position and size
  win.on('moved', () => { 
      if (!win) return;
      const [x, y] = win.getPosition(); 
      saveConfig({ x, y }); 
  });
  win.on('resized', () => { 
      if (!win || isCollapsed) return;
      const [w, h] = win.getSize(); 
      saveConfig({ width: w, height: h }); 
  });

  win.on('close', (e) => {
      if (!app.isQuitting) {
          e.preventDefault();
          win.hide();
          if (tray) tray.setContextMenu(buildMenu());
      }
  });
}

// ── Tray ──────────────────────────────────────────────────────────────────────
function buildMenu() {
  const cfg  = loadConfig();
  const onTop = !!cfg.alwaysOnTop;

  return Menu.buildFromTemplate([
    { label: '🟣 Board Exam 2083 – Countdown', enabled: false },
    { type: 'separator' },
    {
      label: win && win.isVisible() ? 'Hide Widget' : 'Show Widget',
      click: () => {
        if (!win) return;
        win.isVisible() ? win.hide() : win.show();
        tray.setContextMenu(buildMenu());
      }
    },
    { type: 'separator' },
    {
      label: 'Reset to Default Size',
      click: () => {
        if (!win) return;
        isCollapsed = false;
        win.webContents.send('collapse-state', false);
        win.setMinimumSize(150, 80);
        win.setSize(420, 320);
        win.center();
        const [x, y] = win.getPosition();
        const [w, h] = win.getSize();
        saveConfig({ width: w, height: h, x, y });
      }
    },
    { type: 'separator' },
    {
      label: (onTop ? '✓  ' : '    ') + 'Always on Top',
      click: () => {
        const v = !onTop;
        saveConfig({ alwaysOnTop: v });
        win && win.setAlwaysOnTop(v, 'screen-saver');
        tray.setContextMenu(buildMenu());
      }
    },
    { type: 'separator' },
    { label: 'Quit Timer', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
}

function createTray() {
  let icon = nativeImage.createEmpty();
  try {
    const i = nativeImage.createFromPath(path.join(__dirname, '..', 'favicon.svg'));
    if (!i.isEmpty()) icon = i;
  } catch (_) {}

  tray = new Tray(icon);
  tray.setToolTip('Board Exam 2083 – Right-click for options');
  tray.setContextMenu(buildMenu());
  tray.on('double-click', () => {
    if (!win) return;
    win.isVisible() ? win.hide() : win.show();
    tray.setContextMenu(buildMenu());
  });
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.on('get-config', (e) => { e.returnValue = loadConfig(); });

ipcMain.on('toggle-collapse', (e) => {
  if (!win) return;
  if (!isCollapsed) {
    expandedBounds = win.getBounds();
    isCollapsed = true;
    win.setMinimumSize(70, 36); 
    win.setBounds({ x: expandedBounds.x, y: expandedBounds.y, width: 70, height: 36 });
  } else {
    isCollapsed = false;
    win.setMinimumSize(150, 80);
    if (expandedBounds) {
      const currentPos = win.getPosition();
      win.setBounds({ x: currentPos[0], y: currentPos[1], width: expandedBounds.width, height: expandedBounds.height });
      saveConfig({ width: expandedBounds.width, height: expandedBounds.height, x: currentPos[0], y: currentPos[1] });
    }
  }
  e.sender.send('collapse-state', isCollapsed);
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  app.commandLine.appendSwitch('disable-background-timer-throttling');
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
  createWindow();
  createTray();
});

app.on('second-instance', () => win && (win.show(), win.focus()));
app.on('window-all-closed', (e) => { if (!app.isQuitting) e.preventDefault(); });
app.on('before-quit', () => { app.isQuitting = true; });
