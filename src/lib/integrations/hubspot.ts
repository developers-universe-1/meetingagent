import { z } from 'zod'
import { AgentError, RateLimitError } from '@/lib/errors'
import { logger } from '@/lib/logger'

// ------------------------------------------------------------------
// Zod schemas for HubSpot API response validation
// ------------------------------------------------------------------

export const HubSpotDealSchema = z.object({
  id: z.string(),
  properties: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  archived: z.boolean().optional(),
})

export const HubSpotContactSchema = z.object({
  id: z.string(),
  properties: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  archived: z.boolean().optional(),
})

export const HubSpotSearchResponseSchema = z.object({
  total: z.number(),
  results: z.array(z.record(z.string(), z.unknown())),
  paging: z
    .object({
      next: z.object({
        after: z.string(),
        link: z.string(),
      }),
    })
    .optional(),
})

export const HubSpotEngagementSchema = z.object({
  id: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const HubSpotCrmObjectSchema = z.object({
  id: z.string(),
  properties: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ------------------------------------------------------------------
// Type exports
// ------------------------------------------------------------------

export type HubSpotDeal = z.infer<typeof HubSpotDealSchema>
export type HubSpotContact = z.infer<typeof HubSpotContactSchema>
export type HubSpotSearchResponse = z.infer<typeof HubSpotSearchResponseSchema>

// ------------------------------------------------------------------
// Error hierarchy
// ------------------------------------------------------------------

export class HubSpotError extends AgentError {
  constructor(message: string, public readonly statusCode?: number, cause?: unknown) {
    super(message, 'hubspot', cause)
    this.name = 'HubSpotError'
  }
}

export class HubSpotAuthError extends HubSpotError {
  constructor(message: string, cause?: unknown) {
    super(message, 401, cause)
    this.name = 'HubSpotAuthError'
  }
}

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

export interface HubSpotConfig {
  accessToken: string // Private app token
  baseUrl?: string
}

// ------------------------------------------------------------------
// Rate limiter: 100 requests per 10 seconds
// ------------------------------------------------------------------

class SlidingWindowLimiter {
  private timestamps: number[] = []
  private readonly windowMs = 10_000
  private readonly maxRequests = 100

  async acquire(): Promise<void> {
    const now = Date.now()
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs)

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0]
      const wait = this.windowMs - (now - oldest) + 50
      logger.warn('hubspot', `Rate limit approached. Waiting ${wait}ms`)
      await new Promise(r => setTimeout(r, wait))
      return this.acquire()
    }

    this.timestamps.push(now)
  }
}

// ------------------------------------------------------------------
// API client
// ------------------------------------------------------------------

export class HubSpotClient {
  private limiter = new SlidingWindowLimiter()
  private baseUrl: string

  constructor(private config: HubSpotConfig) {
    this.baseUrl = config.baseUrl ?? 'https://api.hubapi.com'
  }

  private async request<T>(endpoint: string, opts: RequestInit & { schema: z.ZodType<T> }): Promise<T> {
    await this.limiter.acquire()

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

    const res = await fetch(url, {
      ...opts,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        ...(opts.headers ?? {}),
      },
    })

    if (res.status === 401) {
      throw new HubSpotAuthError('HubSpot access token invalid or expired')
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After')
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 10
      throw new RateLimitError('HubSpot API rate limit exceeded', seconds)
    }

    if (!res.ok) {
      const text = await res.text()
      throw new HubSpotError(`HubSpot API error: ${res.status} ${text}`, res.status)
    }

    const raw = await res.json()
    const parsed = opts.schema.safeParse(raw)
    if (!parsed.success) {
      throw new HubSpotError('HubSpot response validation failed', res.status, parsed.error)
    }
    return parsed.data
  }

  // ------------------------------------------------------------------
  // Public API methods
  // ------------------------------------------------------------------

  async getDeals(options?: {
    limit?: number
    pipeline?: string
    stage?: string
    modifiedAfter?: Date
  }): Promise<HubSpotDeal[]> {
    const limit = options?.limit ?? 100
    const filterGroups: unknown[] = []

    const filters: unknown[] = []
    if (options?.pipeline) {
      filters.push({ propertyName: 'pipeline', operator: 'EQ', value: options.pipeline })
    }
    if (options?.stage) {
      filters.push({ propertyName: 'dealstage', operator: 'EQ', value: options.stage })
    }
    if (options?.modifiedAfter) {
      filters.push({
        propertyName: 'hs_lastmodifieddate',
        operator: 'GTE',
        value: options.modifiedAfter.toISOString(),
      })
    }
    if (filters.length > 0) {
      filterGroups.push({ filters })
    }

    const payload = {
      filterGroups,
      sorts: ['-hs_lastmodifieddate'],
      properties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'hubspot_owner_id'],
      limit,
    }

    const data = await this.request('/crm/v3/objects/deals/search', {
      method: 'POST',
      body: JSON.stringify(payload),
      schema: HubSpotSearchResponseSchema,
    })

    return data.results.map(r => {
      const parsed = HubSpotDealSchema.safeParse(r)
      if (!parsed.success) {
        logger.warn('hubspot', 'Deal parse warning', { error: parsed.error.format() })
      }
      return parsed.success ? parsed.data : (r as unknown as HubSpotDeal)
    })
  }

  async getContacts(options?: {
    limit?: number
    email?: string
    modifiedAfter?: Date
  }): Promise<HubSpotContact[]> {
    const limit = options?.limit ?? 100
    const filterGroups: unknown[] = []

    const filters: unknown[] = []
    if (options?.email) {
      filters.push({ propertyName: 'email', operator: 'EQ', value: options.email })
    }
    if (options?.modifiedAfter) {
      filters.push({
        propertyName: 'lastmodifieddate',
        operator: 'GTE',
        value: options.modifiedAfter.toISOString(),
      })
    }
    if (filters.length > 0) {
      filterGroups.push({ filters })
    }

    const payload = {
      filterGroups,
      sorts: ['-lastmodifieddate'],
      properties: ['firstname', 'lastname', 'email', 'phone', 'jobtitle', 'hubspot_owner_id'],
      limit,
    }

    const data = await this.request('/crm/v3/objects/contacts/search', {
      method: 'POST',
      body: JSON.stringify(payload),
      schema: HubSpotSearchResponseSchema,
    })

    return data.results.map(r => {
      const parsed = HubSpotContactSchema.safeParse(r)
      if (!parsed.success) {
        logger.warn('hubspot', 'Contact parse warning', { error: parsed.error.format() })
      }
      return parsed.success ? parsed.data : (r as unknown as HubSpotContact)
    })
  }

  async createEngagement(payload: {
    engagementType: 'NOTE' | 'TASK' | 'MEETING' | 'CALL' | 'EMAIL'
    metadata: Record<string, unknown>
    associations?: {
      contactIds?: string[]
      companyIds?: string[]
      dealIds?: string[]
    }
  }): Promise<{ id: string }> {
    const body = {
      properties: {
        hs_engagement_type: payload.engagementType,
        hs_timestamp: new Date().toISOString(),
        ...payload.metadata,
      },
      associations: {
        ...(payload.associations?.contactIds
          ? { contacts: { results: payload.associations.contactIds.map(id => ({ id })) } }
          : {}),
        ...(payload.associations?.dealIds
          ? { deals: { results: payload.associations.dealIds.map(id => ({ id })) } }
          : {}),
      },
    }

    const result = await this.request('/crm/v3/objects/notes', {
      method: 'POST',
      body: JSON.stringify(body),
      schema: HubSpotCrmObjectSchema,
    })

    logger.info('hubspot', `Engagement created: ${result.id}`)
    return { id: result.id }
  }

  async updateDealStage(dealId: string, stageId: string): Promise<void> {
    await this.request(`/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: { dealstage: stageId } }),
      schema: HubSpotCrmObjectSchema,
    })
    logger.info('hubspot', `Deal ${dealId} stage updated to ${stageId}`)
  }
}
