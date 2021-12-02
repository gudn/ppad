const staticCacheName = 'ppad-v1'
const cdnCacheName = 'cdn-v1'

const coreFiles = [
  '/favicon.png',
  '/global.css',
  '/index.html',
  '/am_parse_bg.wasm',
  '/build/bundle.js',
  '/build/bundle.css',
  '/icons/add.svg',
  '/icons/arrow-down.svg',
  '/icons/arrow-up.svg',
  '/icons/pencil.svg',
  '/icons/search.svg',
  '/icons/trash.svg',
]

self.addEventListener('install', cacheAll)

self.addEventListener('activate', async () => {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter(name => name !== staticCacheName)
      .filter(name => name !== cdnCacheName)
      .map(name => caches.delete(name)),
  )
})

async function cacheAll() {
  const cache = await caches.open(staticCacheName)
  await cache.addAll(coreFiles)
}

async function save(req) {
  const cache = await caches.open(cdnCacheName)
  await cache.add(req)
}

function isCdn(url) {
  const hostname = url.hostname
  if (url.origin === location.origin) return false
  return /(?:cdn|fonts)/.test(hostname)
}

async function cacheAndSave(req) {
  const url = new URL(req.url)
  let cached = await caches.match(req)
  if (!cached && url.origin === location.origin) {
    if (
      /^\/(?:doc|view|draw|import)/.test(url.pathname) ||
      url.pathname === '/'
    )
      cached = await caches.match('/index.html')
    else cacheAll()
  }
  // cache cdn
  if (!cached && isCdn(url)) {
    if (navigator.onLine) {
      save(req)
    }
  }
  return cached ?? (await fetch(req))
}

self.addEventListener('fetch', event => {
  event.respondWith(cacheAndSave(event.request))
})
