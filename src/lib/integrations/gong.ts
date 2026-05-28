import { z } from 'zod'
import { AgentError, RateLimitError } from '@/lib/errors'
import { logger } from '@/lib/logger'

// ------------------------------------------------------------------
// Zod schemas for Gong API response validation
// ------------------------------------------------------------------

export const GongCallSchema = z.object({
  id: z.string(),
  url: z.string().url().optional(),
  title: z.string().optional(),
  scheduled: z.string().optional(),
  started: z.string().optional(),
  duration: z.number().optional(),
  primaryUserId: z.string().optional(),
  direction: z.string().optional(),
  system: z.string().optional(),
  scope: z.string().optional(),
  media: z.string().optional(),
  language: z.string().optional(),
  workspaceId: z.string().optional(),
  purpose: z.string().optional(),
  meetingUrl: z.string().url().optional().nullable(),
  isPrivate: z.boolean().optional(),
  calendarEventId: z.string().optional().nullable(),
})

export const GongCallsResponseSchema = z.object({
  calls: z.array(z.record(z.string(), z.unknown())),
  records: z.object({
    totalRecords: z.number(),
    currentPageSize: z.number(),
  }),
})

export const GongTranscriptSchema = z.object({
  callId: z.string(),
  transcript: z.array(
    z.object({
      speakerId: z.string(),
      topic: z.string().optional(),
      sentences: z.array(
        z.object({
          start: z.number(),
          end: z.number(),
          text: z.string(),
        })
      ),
    })
  ),
})

export const GongCallStatsSchema = z.object({
  callId: z.string(),
  metaData: z.record(z.string(), z.unknown()).optional(),
  parties: z.array(z.record(z.string(), z.unknown())).optional(),
  interaction: z.record(z.string(), z.unknown()).optional(),
  collaboration: z.record(z.string(), z.unknown()).optional(),
  topics: z.array(z.record(z.string(), z.unknown())).optional(),
  trackers: z.array(z.record(z.string(), z.unknown())).optional(),
})

// ------------------------------------------------------------------
// Type exports
// ------------------------------------------------------------------

export type GongCall = z.infer<typeof GongCallSchema>
export type GongCallsResponse = z.infer<typeof GongCallsResponseSchema>
export type GongTranscript = z.infer<typeof GongTranscriptSchema>
export type GongCallStats = z.infer<typeof GongCallStatsSchema>

// ------------------------------------------------------------------
// Error hierarchy
// ------------------------------------------------------------------

export class GongError extends AgentError {
  constructor(message: string, public readonly statusCode?: number, cause?: unknown) {
    super(message, 'gong', cause)
    this.name = 'GongError'
  }
}

export class GongAuthError extends GongError {
  constructor(message: string, cause?: unknown) {
    super(message, 401, cause)
    this.name = 'GongAuthError'
  }
}

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

export interface GongConfig {
  accessKey: string
  accessSecret: string
  baseUrl?: string
}

// ------------------------------------------------------------------
// API client with pagination support
// ------------------------------------------------------------------

export class GongClient {
  private baseUrl: string

  constructor(private config: GongConfig) {
    this.baseUrl = config.baseUrl ?? 'https://api.gong.io'
  }

  private authHeader(): string {
    const creds = `${this.config.accessKey}:${this.config.accessSecret}`
    return `Basic ${Buffer.from(creds).toString('base64')}`
  }

  private async request<T>(endpoint: string, opts: RequestInit & { schema: z.ZodType<T> }): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

    const res = await fetch(url, {
      ...opts,
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
        ...(opts.headers ?? {}),
      },
    })

    if (res.status === 401) {
      throw new GongAuthError('Gong API credentials invalid')
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After')
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60
      throw new RateLimitError('Gong API rate limit exceeded', seconds)
    }

    if (!res.ok) {
      const text = await res.text()
      throw new GongError(`Gong API error: ${res.status} ${text}`, res.status)
    }

    const raw = await res.json()
    const parsed = opts.schema.safeParse(raw)
    if (!parsed.success) {
      throw new GongError('Gong response validation failed', res.status, parsed.error)
    }
    return parsed.data
  }

  // ------------------------------------------------------------------
  // Public API methods
  // ------------------------------------------------------------------

  async getCalls(options?: {
    fromDateTime?: Date
    toDateTime?: Date
    workspaceId?: string
    limit?: number
  }): Promise<{ calls: GongCall[]; totalRecords: number }> {
    const payload: Record<string, unknown> = {
      filter: {},
    }

    if (options?.fromDateTime) {
      ;(payload.filter as Record<string, unknown>).fromDateTime = options.fromDateTime.toISOString()
    }
    if (options?.toDateTime) {
      ;(payload.filter as Record<string, unknown>).toDateTime = options.toDateTime.toISOString()
    }
    if (options?.workspaceId) {
      ;(payload.filter as Record<string, unknown>).workspaceId = options.workspaceId
    }

    const allCalls: GongCall[] = []
    let cursor: string | undefined
    const limit = options?.limit ?? 100
    let totalRecords = 0

    do {
      const body: Record<string, unknown> = {
        ...payload,
        cursor,
      }

      const data = await this.request('/v2/calls', {
        method: 'POST',
        body: JSON.stringify(body),
        schema: GongCallsResponseSchema,
      })

      totalRecords = data.records.totalRecords

      const parsedCalls = data.calls.map(c => {
        const parsed = GongCallSchema.safeParse(c)
        if (!parsed.success) {
          logger.warn('gong', 'Call parse warning', { error: parsed.error.format() })
        }
        return parsed.success ? parsed.data : (c as unknown as GongCall)
      })

      allCalls.push(...parsedCalls)

      // Gong pagination uses cursor in response body under "records.nextCursor" in some versions,
      // but the documented field is typically absent; we break when we get fewer than page size.
      if (data.calls.length === 0 || allCalls.length >= limit) {
        break
      }

      // Conservative cursor extraction from nested structures
      const nextCursor = (data as unknown as { records?: { nextCursor?: string } }).records?.nextCursor
      cursor = nextCursor
    } while (cursor)

    return { calls: allCalls.slice(0, limit), totalRecords }
  }

  async getCallTranscript(callId: string): Promise<GongTranscript> {
    const data = await this.request(`/v2/calls/transcript?callIds=${encodeURIComponent(callId)}`, {
      method: 'GET',
      schema: z.object({
        callTranscripts: z.array(GongTranscriptSchema),
      }),
    })

    const first = data.callTranscripts[0]
    if (!first) {
      throw new GongError(`No transcript found for call ${callId}`)
    }
    return first
  }

  async getCallStats(callId: string): Promise<GongCallStats> {
    const data = await this.request(`/v2/calls/${encodeURIComponent(callId)}?content=stats`, {
      method: 'GET',
      schema: GongCallStatsSchema,
    })
    return data
  }
}
