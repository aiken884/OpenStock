'use strict';

const { app, BrowserWindow, ipcMain, shell } = require('electron');
app.setName('OpenStock');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const PORT = String(process.env.OPENSTOCK_PORT || '3847');
const APP_URL = `http://127.0.0.1:${PORT}`;

let mainWindow;
let splashWindow;
let setupWindow;
let serverProcess;

function configPath() {
    return path.join(app.getPath('userData'), 'config.json');
}

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath(), 'utf8'));
    } catch {
        return {};
    }
}

function saveConfig(next) {
    const current = loadConfig();
    const merged = { ...current, ...next };
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(configPath(), JSON.stringify(merged, null, 2));
    return merged;
}

function waitForHttp(url, timeoutMs) {
    const started = Date.now();
    return new Promise((resolve, reject) => {
        const tryOnce = () => {
            const req = http.get(url, (res) => {
                res.resume();
                resolve();
            });
            req.on('error', () => {
                if (Date.now() - started > timeoutMs) {
                    reject(new Error('啟動逾時'));
                    return;
                }
                setTimeout(tryOnce, 400);
            });
        };
        tryOnce();
    });
}

function createSplash() {
    splashWindow = new BrowserWindow({
        width: 420,
        height: 240,
        frame: false,
        resizable: false,
        backgroundColor: '#0a0a0a',
        show: true,
    });
    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createSetupWindow() {
    setupWindow = new BrowserWindow({
        width: 560,
        height: 460,
        backgroundColor: '#0a0a0a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    setupWindow.loadFile(path.join(__dirname, 'setup.html'));
    setupWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: '#0a0a0a',
        title: 'OpenStock',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    mainWindow.loadURL(APP_URL);
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function startServer() {
    const isPackaged = app.isPackaged;
    const bundledNode = path.join(process.resourcesPath, 'bin', 'node');
    const resolvedNode = isPackaged && fs.existsSync(bundledNode) ? bundledNode : 'node';
    const standaloneDir = isPackaged
        ? path.join(process.resourcesPath, 'standalone')
        : path.join(__dirname, '..', '.next', 'standalone');
    const launchScript = path.join(standaloneDir, 'desktop-launch.cjs');
    const fallbackLaunch = path.join(__dirname, 'launch.cjs');
    const script = fs.existsSync(launchScript) ? launchScript : fallbackLaunch;

    serverProcess = spawn(resolvedNode, [script], {
        cwd: standaloneDir,
        env: {
            ...process.env,
            PORT,
            HOSTNAME: '127.0.0.1',
            OPENSTOCK_USER_DATA: app.getPath('userData'),
            OPENSTOCK_STANDALONE: standaloneDir,
            OPENSTOCK_NODE: resolvedNode,
        },
        stdio: 'inherit',
    });

    serverProcess.on('exit', (code) => {
        if (code && code !== 0 && mainWindow) {
            console.error('OpenStock 服務已結束，代碼', code);
        }
    });
}

function waitForSetup() {
    return new Promise((resolve) => {
        const cfg = loadConfig();
        if (cfg.setupComplete) {
            resolve();
            return;
        }
        createSetupWindow();
        const finish = () => {
            saveConfig({ setupComplete: true });
            if (setupWindow) {
                setupWindow.close();
                setupWindow = null;
            }
            resolve();
        };
        ipcMain.handle('setup:save', async (_event, payload) => {
            saveConfig({
                finnhubApiKey: String(payload?.finnhubApiKey || '').trim(),
                setupComplete: true,
            });
            finish();
        });
        ipcMain.handle('setup:skip', async () => {
            finish();
        });
    });
}

async function boot() {
    createSplash();
    await waitForSetup();
    startServer();
    await waitForHttp(APP_URL, 180000);
    createMainWindow();
    if (splashWindow) {
        splashWindow.close();
        splashWindow = null;
    }
}

app.whenReady().then(() => {
    boot().catch((error) => {
        console.error(error);
        if (splashWindow) splashWindow.close();
        app.quit();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGTERM');
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && !splashWindow) {
        if (mainWindow) {
            mainWindow.show();
        } else {
            boot().catch(console.error);
        }
    }
});
