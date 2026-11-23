/** Minimal Cache Storage stub for jsdom unit tests. */

function requestKey(request: RequestInfo | URL): string {
  if (typeof request === "string") {
    return request;
  }
  if (request instanceof URL) {
    return request.href;
  }
  return request.url;
}

class MemoryCache implements Cache {
  readonly #entries = new Map<string, Response>();

  match(request: RequestInfo | URL): Promise<Response | undefined> {
    const hit = this.#entries.get(requestKey(request));
    return Promise.resolve(hit ? hit.clone() : undefined);
  }

  matchAll(): Promise<readonly Response[]> {
    return Promise.resolve([...this.#entries.values()].map((response) => response.clone()));
  }

  add(): Promise<void> {
    return Promise.reject(new Error("Cache.add is not implemented in the test stub"));
  }

  addAll(): Promise<void> {
    return Promise.reject(new Error("Cache.addAll is not implemented in the test stub"));
  }

  put(request: RequestInfo | URL, response: Response): Promise<void> {
    this.#entries.set(requestKey(request), response.clone());
    return Promise.resolve();
  }

  delete(request: RequestInfo | URL): Promise<boolean> {
    return Promise.resolve(this.#entries.delete(requestKey(request)));
  }

  keys(): Promise<readonly Request[]> {
    return Promise.resolve([...this.#entries.keys()].map((url) => new Request(url)));
  }
}

class MemoryCacheStorage implements CacheStorage {
  readonly #caches = new Map<string, MemoryCache>();

  open(cacheName: string): Promise<Cache> {
    let cache = this.#caches.get(cacheName);
    if (!cache) {
      cache = new MemoryCache();
      this.#caches.set(cacheName, cache);
    }
    return Promise.resolve(cache);
  }

  has(cacheName: string): Promise<boolean> {
    return Promise.resolve(this.#caches.has(cacheName));
  }

  delete(cacheName: string): Promise<boolean> {
    return Promise.resolve(this.#caches.delete(cacheName));
  }

  keys(): Promise<string[]> {
    return Promise.resolve([...this.#caches.keys()]);
  }

  match(request: RequestInfo | URL): Promise<Response | undefined> {
    return Promise.all([...this.#caches.values()].map((cache) => cache.match(request))).then(
      (hits) => hits.find((hit) => hit !== undefined),
    );
  }
}

export function installCacheStorageStub(): MemoryCacheStorage {
  const storage = new MemoryCacheStorage();
  Object.defineProperty(globalThis, "caches", {
    configurable: true,
    writable: true,
    value: storage,
  });
  return storage;
}
