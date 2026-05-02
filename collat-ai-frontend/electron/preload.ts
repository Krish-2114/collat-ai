import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('collat', {
  platform: process.platform,
})
