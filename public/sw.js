const staticCacheName = 'ppad-v1'

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

self.addEventListener('install', async () => {
  const cache = await caches.open(staticCacheName)
  await cache.addAll(coreFiles)
})

self.addEventListener('activate', async () => {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter(name => name !== staticCacheName)
      .map(name => caches.delete(name)),
  )
})

async function save(req) {
  const cache = await caches.open(staticCacheName)
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
    cached = await caches.match(new Request('/index.html'))
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
