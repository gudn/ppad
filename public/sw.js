self.addEventListener('install', () => {
  console.log('[SW] installed')
})

self.addEventListener('activate', () => {
  console.log('[SW] activated')
})
