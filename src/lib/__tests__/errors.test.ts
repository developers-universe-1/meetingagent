import { AgentError, RateLimitError } from '@/lib/errors'

describe('Errors', () => {
  it('creates an AgentError with stage and cause', () => {
    const cause = new Error('network failure')
    const err = new AgentError('Analysis failed', 'analyze', cause)
    expect(err.message).toBe('Analysis failed')
    expect(err.stage).toBe('analyze')
    expect(err.cause).toBe(cause)
    expect(err.name).toBe('AgentError')
  })

  it('creates a RateLimitError with retry time', () => {
    const err = new RateLimitError('Too many requests', 60)
    expect(err.message).toBe('Too many requests')
    expect(err.retryAfterSeconds).toBe(60)
    expect(err.name).toBe('RateLimitError')
  })
})
