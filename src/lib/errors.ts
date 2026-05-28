export class AgentError extends Error {
  constructor(
    message: string,
    public readonly stage: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterSeconds: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}
