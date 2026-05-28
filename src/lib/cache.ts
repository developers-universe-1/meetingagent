interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class InMemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>()

  constructor(private readonly defaultTtlMs: number = 5 * 60 * 1000) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    })
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

export const analysisCache = new InMemoryCache<unknown>(10 * 60 * 1000)
