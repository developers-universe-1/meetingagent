'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plug,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Mail,
  MessageSquare,
  BarChart3,
  Cloud,
  Zap,
  Link2,
  Database,
} from 'lucide-react'

interface IntegrationMeta {
  id: string
  name: string
  description: string
  icon: typeof Plug
  status: 'connected' | 'disconnected' | 'syncing' | 'error'
  lastSync: string
  category: string
  recordCount?: number
  oauthUrl?: string
}

const initialIntegrations: IntegrationMeta[] = [
  {
    id: 'gong',
    name: 'Gong',
    description: 'Import call recordings, transcripts, and sentiment metadata.',
    icon: BarChart3,
    status: 'syncing',
    lastSync: '2 min ago',
    category: 'Revenue Intelligence',
    recordCount: 1247,
    oauthUrl: 'https://app.gong.io/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/auth/gong/callback&response_type=code',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Bi-directional sync of deals, contacts, and activity history.',
    icon: Cloud,
    status: 'connected',
    lastSync: '5 min ago',
    category: 'CRM',
    recordCount: 342,
    oauthUrl: 'https://login.salesforce.com/services/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/auth/salesforce/callback&response_type=code&scope=api+refresh_token',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync pipelines, meetings, and engagement data.',
    icon: Cloud,
    status: 'connected',
    lastSync: '12 min ago',
    category: 'CRM',
    recordCount: 189,
    oauthUrl: 'https://app.hubspot.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/auth/hubspot/callback&scope=crm.objects.contacts.read+crm.objects.deals.read+crm.schemas.deals.read',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send AI-drafted follow-ups and track open/reply rates.',
    icon: Mail,
    status: 'connected',
    lastSync: '1 min ago',
    category: 'Email',
    recordCount: 56,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Pipeline alerts, coaching nudges, and win/loss notifications.',
    icon: MessageSquare,
    status: 'connected',
    lastSync: '8 min ago',
    category: 'Messaging',
    recordCount: 0,
    oauthUrl: 'https://slack.com/oauth/v2/authorize?client_id=YOUR_CLIENT_ID&scope=incoming-webhook&redirect_uri=http://localhost:3000/api/auth/slack/callback',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Trigger workflows from deal stage changes and call outcomes.',
    icon: Zap,
    status: 'disconnected',
    lastSync: 'Never',
    category: 'Automation',
    recordCount: 0,
  },
]

const statusBadge = (status: IntegrationMeta['status']) => {
  switch (status) {
    case 'connected':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-emerald-950/50 text-emerald-400 border-emerald-900">
          <CheckCircle2 className="w-3 h-3" /> Connected
        </span>
      )
    case 'syncing':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-sky-950/50 text-sky-400 border-sky-900">
          <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
        </span>
      )
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-rose-950/50 text-rose-400 border-rose-900">
          <XCircle className="w-3 h-3" /> Error
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-zinc-700">
          <XCircle className="w-3 h-3" /> Disconnected
        </span>
      )
  }
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const toggleStatus = useCallback((id: string) => {
    setIntegrations(prev =>
      prev.map(int => {
        if (int.id !== id) return int
        const isOn = int.status === 'connected' || int.status === 'syncing'
        const next = isOn ? 'disconnected' : 'connected'
        return {
          ...int,
          status: next,
          lastSync: next === 'connected' ? 'Just now' : 'Never',
          recordCount: next === 'connected' ? int.recordCount ?? 0 : 0,
        }
      })
    )
  }, [])

  const simulateConnect = useCallback((id: string) => {
    setConnectingId(id)
    setIntegrations(prev =>
      prev.map(int => (int.id === id ? { ...int, status: 'syncing' as const } : int))
    )

    // Simulate OAuth handshake + initial sync
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(int =>
          int.id === id
            ? {
                ...int,
                status: 'connected',
                lastSync: 'Just now',
                recordCount: Math.floor(Math.random() * 500) + 50,
              }
            : int
        )
      )
      setConnectingId(null)
    }, 2500)
  }, [])

  const connectedCount = integrations.filter(i => i.status === 'connected' || i.status === 'syncing').length
  const totalRecords = integrations.reduce((sum, i) => sum + (i.recordCount ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug className="w-6 h-6 text-brand-500" />
          Integrations
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Connect your go-to-stack. Data flows in automatically — no CSV uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Connected</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{connectedCount} <span className="text-zinc-600 text-base font-normal">/ {integrations.length}</span></div>
          <p className="text-xs text-zinc-500 mt-1">Active data sources</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Sync Health</span>
          <div className="text-2xl font-bold text-brand-400 mt-1">100%</div>
          <p className="text-xs text-zinc-500 mt-1">No sync errors in last 24h</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Records Synced</span>
          <div className="text-2xl font-bold text-white mt-1">{totalRecords.toLocaleString()}</div>
          <p className="text-xs text-zinc-500 mt-1">From all connected integrations</p>
        </motion.div>
      </div>

      <div className="space-y-3">
        {integrations.map((integration, i) => {
          const Icon = integration.icon
          const isOn = integration.status === 'connected' || integration.status === 'syncing'
          const isConnecting = connectingId === integration.id

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOn ? 'bg-brand-500/10 text-brand-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{integration.name}</p>
                    {statusBadge(integration.status)}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{integration.description}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-zinc-600">Last sync: {integration.lastSync}</p>
                    {isOn && typeof integration.recordCount === 'number' && integration.recordCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <Database className="w-3 h-3" />
                        {integration.recordCount.toLocaleString()} records
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isOn && integration.oauthUrl && (
                  <button
                    onClick={() => simulateConnect(integration.id)}
                    disabled={isConnecting}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3 h-3" />
                        Connect
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => toggleStatus(integration.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOn ? 'bg-brand-500' : 'bg-zinc-700'}`}
                  aria-label={`Toggle ${integration.name}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
