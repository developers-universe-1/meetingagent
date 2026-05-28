import { z } from 'zod'
import { AgentError, RateLimitError } from '@/lib/errors'
import { logger } from '@/lib/logger'

// ------------------------------------------------------------------
// Zod schemas for Salesforce API response validation
// ------------------------------------------------------------------

export const SalesforceTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  instance_url: z.string().url(),
  issued_at: z.string().optional(),
  signature: z.string().optional(),
  token_type: z.string().optional(),
})

export const SalesforceOpportunitySchema = z.object({
  Id: z.string(),
  Name: z.string(),
  StageName: z.string(),
  Amount: z.number().nullable().optional(),
  CloseDate: z.string().optional(),
  Probability: z.number().nullable().optional(),
  AccountId: z.string().nullable().optional(),
  OwnerId: z.string().optional(),
  LastModifiedDate: z.string().optional(),
  CreatedDate: z.string().optional(),
  Description: z.string().nullable().optional(),
  NextStep: z.string().nullable().optional(),
  LeadSource: z.string().nullable().optional(),
  Type: z.string().nullable().optional(),
})

export const SalesforceContactSchema = z.object({
  Id: z.string(),
  FirstName: z.string().nullable().optional(),
  LastName: z.string(),
  Email: z.string().email().nullable().optional(),
  Phone: z.string().nullable().optional(),
  AccountId: z.string().nullable().optional(),
  Title: z.string().nullable().optional(),
  LeadSource: z.string().nullable().optional(),
  LastModifiedDate: z.string().optional(),
  CreatedDate: z.string().optional(),
})

export const SalesforceQueryResponseSchema = z.object({
  totalSize: z.number(),
  done: z.boolean(),
  records: z.array(z.record(z.string(), z.unknown())),
  nextRecordsUrl: z.string().optional(),
})

export const SalesforceTaskSchema = z.object({
  id: z.string(),
  success: z.boolean(),
  errors: z.array(z.unknown()),
})

export const SalesforceUpdateResultSchema = z.object({
  id: z.string(),
  success: z.boolean(),
  errors: z.array(z.unknown()),
})

// ------------------------------------------------------------------
// Type exports
// ------------------------------------------------------------------

export type SalesforceToken = z.infer<typeof SalesforceTokenSchema>
export type SalesforceOpportunity = z.infer<typeof SalesforceOpportunitySchema>
export type SalesforceContact = z.infer<typeof SalesforceContactSchema>
export type SalesforceQueryResponse = z.infer<typeof SalesforceQueryResponseSchema>

// ------------------------------------------------------------------
// Error hierarchy
// ------------------------------------------------------------------

export class SalesforceError extends AgentError {
  constructor(message: string, public readonly statusCode?: number, cause?: unknown) {
    super(message, 'salesforce', cause)
    this.name = 'SalesforceError'
  }
}

export class SalesforceAuthError extends SalesforceError {
  constructor(message: string, cause?: unknown) {
    super(message, 401, cause)
    this.name = 'SalesforceAuthError'
  }
}

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

export interface SalesforceConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  refreshToken: string
  instanceUrl?: string
}

// ------------------------------------------------------------------
// Token manager with refresh flow
// ------------------------------------------------------------------

export class SalesforceTokenManager {
  private token: SalesforceToken | null = null
  private expiresAt = 0

  constructor(private config: SalesforceConfig) {}

  async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token.access_token
    }
    return this.refresh()
  }

  async refresh(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.config.refreshToken,
    })

    const res = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new SalesforceAuthError(`Token refresh failed: ${res.status} ${text}`)
    }

    const raw = await res.json()
    const parsed = SalesforceTokenSchema.safeParse(raw)
    if (!parsed.success) {
      throw new SalesforceAuthError('Invalid token response schema', parsed.error)
    }

    this.token = parsed.data
    // Salesforce access tokens are typically valid for ~2 hours; refresh 5 min early
    this.expiresAt = Date.now() + 115 * 60 * 1000
    if (this.config.instanceUrl) {
      this.token.instance_url = this.config.instanceUrl
    }

    logger.info('salesforce', 'Access token refreshed')
    return this.token.access_token
  }

  getInstanceUrl(): string {
    return this.token?.instance_url ?? this.config.instanceUrl ?? 'https://login.salesforce.com'
  }
}

// ------------------------------------------------------------------
// API client with rate-limit awareness
// ------------------------------------------------------------------

export class SalesforceClient {
  private tokenManager: SalesforceTokenManager

  constructor(config: SalesforceConfig) {
    this.tokenManager = new SalesforceTokenManager(config)
  }

  private async request<T>(
    endpoint: string,
    opts: RequestInit & { schema: z.ZodType<T> }
  ): Promise<T> {
    const accessToken = await this.tokenManager.getAccessToken()
    const baseUrl = this.tokenManager.getInstanceUrl()
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/services/data/v59.0${endpoint}`

    const res = await fetch(url, {
      ...opts,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(opts.headers ?? {}),
      },
    })

    if (res.status === 401) {
      throw new SalesforceAuthError('Salesforce access token expired or invalid')
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After')
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60
      throw new RateLimitError('Salesforce API rate limit exceeded', seconds)
    }

    if (!res.ok) {
      const text = await res.text()
      throw new SalesforceError(`Salesforce API error: ${res.status} ${text}`, res.status)
    }

    // Some endpoints (e.g. PATCH) return 204 No Content
    if (res.status === 204) {
      return undefined as unknown as T
    }

    const raw = await res.json()
    const parsed = opts.schema.safeParse(raw)
    if (!parsed.success) {
      throw new SalesforceError('Salesforce response validation failed', res.status, parsed.error)
    }
    return parsed.data
  }

  // Exponential backoff wrapper
  async withBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0
    while (true) {
      try {
        return await fn()
      } catch (err) {
        if (err instanceof RateLimitError && attempt < maxRetries) {
          const delay = Math.min(2 ** attempt * 1000 + Math.random() * 1000, 30000)
          logger.warn('salesforce', `Rate limited. Retrying in ${Math.round(delay)}ms…`)
          await new Promise(r => setTimeout(r, delay))
          attempt++
          continue
        }
        throw err
      }
    }
  }

  // ------------------------------------------------------------------
  // Public API methods
  // ------------------------------------------------------------------

  async getOpportunities(options?: {
    limit?: number
    stageName?: string
    modifiedAfter?: Date
  }): Promise<SalesforceOpportunity[]> {
    const limit = options?.limit ?? 200
    let soql = `SELECT Id, Name, StageName, Amount, CloseDate, Probability, AccountId, OwnerId, LastModifiedDate, CreatedDate, Description, NextStep, LeadSource, Type FROM Opportunity`
    const conditions: string[] = []

    if (options?.stageName) {
      conditions.push(`StageName = '${options.stageName.replace(/'/g, "\\'")}'`)
    }
    if (options?.modifiedAfter) {
      conditions.push(`LastModifiedDate >= ${options.modifiedAfter.toISOString()}`)
    }
    if (conditions.length > 0) {
      soql += ` WHERE ${conditions.join(' AND ')}`
    }
    soql += ` LIMIT ${limit}`

    const encoded = encodeURIComponent(soql)
    const data = await this.withBackoff(() =>
      this.request(`/query?q=${encoded}`, { schema: SalesforceQueryResponseSchema })
    )

    return data.records.map(r => {
      const parsed = SalesforceOpportunitySchema.safeParse(r)
      if (!parsed.success) {
        logger.warn('salesforce', 'Opportunity parse warning', { error: parsed.error.format() })
      }
      return parsed.success ? parsed.data : (r as unknown as SalesforceOpportunity)
    })
  }

  async getContacts(options?: { limit?: number; email?: string }): Promise<SalesforceContact[]> {
    const limit = options?.limit ?? 200
    let soql = `SELECT Id, FirstName, LastName, Email, Phone, AccountId, Title, LeadSource, LastModifiedDate, CreatedDate FROM Contact`
    const conditions: string[] = []

    if (options?.email) {
      conditions.push(`Email = '${options.email.replace(/'/g, "\\'")}'`)
    }
    if (conditions.length > 0) {
      soql += ` WHERE ${conditions.join(' AND ')}`
    }
    soql += ` LIMIT ${limit}`

    const encoded = encodeURIComponent(soql)
    const data = await this.withBackoff(() =>
      this.request(`/query?q=${encoded}`, { schema: SalesforceQueryResponseSchema })
    )

    return data.records.map(r => {
      const parsed = SalesforceContactSchema.safeParse(r)
      if (!parsed.success) {
        logger.warn('salesforce', 'Contact parse warning', { error: parsed.error.format() })
      }
      return parsed.success ? parsed.data : (r as unknown as SalesforceContact)
    })
  }

  async updateOpportunityStage(opportunityId: string, stageName: string): Promise<void> {
    await this.withBackoff(() =>
      this.request(`/sobjects/Opportunity/${opportunityId}`, {
        method: 'PATCH',
        body: JSON.stringify({ StageName: stageName }),
        schema: z.any(), // 204 No Content
      })
    )
    logger.info('salesforce', `Opportunity ${opportunityId} stage updated to ${stageName}`)
  }

  async createTask(payload: {
    Subject: string
    Status: string
    Priority: string
    WhatId?: string
    WhoId?: string
    OwnerId?: string
    ActivityDate?: string
    Description?: string
  }): Promise<{ id: string }> {
    const result = await this.withBackoff(() =>
      this.request('/sobjects/Task', {
        method: 'POST',
        body: JSON.stringify(payload),
        schema: SalesforceTaskSchema,
      })
    )
    logger.info('salesforce', `Task created: ${result.id}`)
    return { id: result.id }
  }
}
