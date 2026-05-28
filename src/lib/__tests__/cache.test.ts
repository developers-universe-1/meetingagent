import { InMemoryCache } from '@/lib/cache'

describe('InMemoryCache', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('stores and retrieves values', () => {
    const cache = new InMemoryCache<string>(1000)
    cache.set('key', 'value')
    expect(cache.get('key')).toBe('value')
  })

  it('returns undefined for missing keys', () => {
    const cache = new InMemoryCache<string>()
    expect(cache.get('missing')).toBeUndefined()
  })

  it('expires entries after TTL', () => {
    const cache = new InMemoryCache<string>(1000)
    cache.set('key', 'value')
    jest.advanceTimersByTime(1001)
    expect(cache.get('key')).toBeUndefined()
  })

  it('deletes entries', () => {
    const cache = new InMemoryCache<string>()
    cache.set('key', 'value')
    expect(cache.delete('key')).toBe(true)
    expect(cache.get('key')).toBeUndefined()
  })

  it('clears all entries', () => {
    const cache = new InMemoryCache<string>()
    cache.set('a', '1')
    cache.set('b', '2')
    cache.clear()
    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBeUndefined()
  })
})
