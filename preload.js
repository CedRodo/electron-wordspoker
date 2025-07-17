const { contextBridge } = require('electron')

console.log("contextBridge:", contextBridge);


contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})