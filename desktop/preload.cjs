'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('openstockDesktop', {
    saveSetup: (payload) => ipcRenderer.invoke('setup:save', payload),
    skipSetup: () => ipcRenderer.invoke('setup:skip'),
});
