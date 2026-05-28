import { SalesforceClient, SalesforceConfig } from './salesforce'
import { HubSpotClient, HubSpotConfig } from './hubspot'
import { SlackClient, SlackConfig } from './slack'
import { GongClient, GongConfig } from './gong'

export { SalesforceClient } from './salesforce'
export type { SalesforceConfig } from './salesforce'
export { HubSpotClient } from './hubspot'
export type { HubSpotConfig } from './hubspot'
export { SlackClient } from './slack'
export type { SlackConfig } from './slack'
export { GongClient } from './gong'
export type { GongConfig } from './gong'

export type IntegrationClient = SalesforceClient | HubSpotClient | SlackClient | GongClient

export interface IntegrationRegistryEntry {
  name: string
  client: IntegrationClient | null
  config: Record<string, string> | null
  status: 'connected' | 'disconnected' | 'syncing' | 'error'
  lastSyncAt: Date | null
  recordCount: number
}

// ------------------------------------------------------------------
// Integration registry — singleton pattern for app-wide access
// ------------------------------------------------------------------

class IntegrationRegistry {
  private entries = new Map<string, IntegrationRegistryEntry>()

  constructor() {
    // Pre-register known integrations
    this.entries.set('salesforce', {
      name: 'Salesforce',
      client: null,
      config: null,
      status: 'disconnected',
      lastSyncAt: null,
      recordCount: 0,
    })
    this.entries.set('hubspot', {
      name: 'HubSpot',
      client: null,
      config: null,
      status: 'disconnected',
      lastSyncAt: null,
      recordCount: 0,
    })
    this.entries.set('slack', {
      name: 'Slack',
      client: null,
      config: null,
      status: 'disconnected',
      lastSyncAt: null,
      recordCount: 0,
    })
    this.entries.set('gong', {
      name: 'Gong',
      client: null,
      config: null,
      status: 'disconnected',
      lastSyncAt: null,
      recordCount: 0,
    })
  }

  register<T extends IntegrationClient>(
    key: string,
    factory: (config: unknown) => T,
    config: unknown
  ): T {
    const client = factory(config)
    const existing = this.entries.get(key)
    this.entries.set(key, {
      ...(existing ?? { name: key }),
      client,
      config: config as Record<string, string> | null,
      status: 'connected',
      lastSyncAt: new Date(),
      recordCount: 0,
    })
    return client
  }

  get(key: string): IntegrationRegistryEntry | undefined {
    return this.entries.get(key)
  }

  getClient<T extends IntegrationClient>(key: string): T | null {
    const entry = this.entries.get(key)
    return (entry?.client as T) ?? null
  }

  setStatus(key: string, status: IntegrationRegistryEntry['status']): void {
    const entry = this.entries.get(key)
    if (entry) {
      entry.status = status
      if (status === 'connected' || status === 'syncing') {
        entry.lastSyncAt = new Date()
      }
    }
  }

  setRecordCount(key: string, count: number): void {
    const entry = this.entries.get(key)
    if (entry) {
      entry.recordCount = count
    }
  }

  list(): IntegrationRegistryEntry[] {
    return Array.from(this.entries.values())
  }

  disconnect(key: string): void {
    const entry = this.entries.get(key)
    if (entry) {
      entry.client = null
      entry.config = null
      entry.status = 'disconnected'
      entry.lastSyncAt = null
      entry.recordCount = 0
    }
  }
}

export const integrationRegistry = new IntegrationRegistry()

// ------------------------------------------------------------------
// Factory helpers
// ------------------------------------------------------------------

export function createSalesforceClient(config: SalesforceConfig): SalesforceClient {
  return integrationRegistry.register('salesforce', c => new SalesforceClient(c as SalesforceConfig), config)
}

export function createHubSpotClient(config: HubSpotConfig): HubSpotClient {
  return integrationRegistry.register('hubspot', c => new HubSpotClient(c as HubSpotConfig), config)
}

export function createSlackClient(config: SlackConfig): SlackClient {
  return integrationRegistry.register('slack', c => new SlackClient(c as SlackConfig), config)
}

export function createGongClient(config: GongConfig): GongClient {
  return integrationRegistry.register('gong', c => new GongClient(c as GongConfig), config)
}
