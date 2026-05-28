'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle, Pause, Copy, Check } from 'lucide-react'
import type { FollowUp } from '@/lib/demo'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-xs text-zinc-500 hover:text-brand-400 flex items-center gap-1"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => setFollowUps(d.followUps || []))
  }, [])

  const statusIcon = (status: string) => {
    if (status === 'sent') return <Send className="w-3.5 h-3.5 text-sky-400" />
    if (status === 'replied') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
    return <Pause className="w-3.5 h-3.5 text-amber-400" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-brand-500" />
          AI Follow-ups
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Drafted from call content. Sent from your mailbox. Paused on reply.
        </p>
      </div>

      <div className="grid gap-4">
        {followUps.map((fu, i) => (
          <motion.div
            key={fu.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium">{fu.subject}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{fu.company} • {fu.contact} • {fu.repName}</p>
              </div>
              <div className="flex items-center gap-2">
                {statusIcon(fu.status)}
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  fu.status === 'sent' ? 'bg-sky-950/50 text-sky-400 border-sky-900' :
                  fu.status === 'replied' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900' :
                  'bg-amber-950/50 text-amber-400 border-amber-900'
                }`}>
                  {fu.status}
                </span>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
              {fu.body}
            </div>
            <div className="flex justify-end mt-3">
              <CopyButton text={fu.body} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
