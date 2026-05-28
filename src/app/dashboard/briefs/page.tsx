'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, Target, AlertTriangle, Lightbulb } from 'lucide-react'
import StageBadge from '@/components/StageBadge'
import type { PreCallBrief } from '@/lib/demo'

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<PreCallBrief[]>([])

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => setBriefs(d.briefs || []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-500" />
          Pre-Call Briefs
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          60-second prep drawn from prior call analysis — no extra AI cost per render.
        </p>
      </div>

      <div className="grid gap-4">
        {briefs.map((brief, i) => (
          <motion.div
            key={brief.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-medium text-lg">{brief.meetingTitle}</p>
                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(brief.scheduledAt).toLocaleString()}
                  <span className="text-zinc-700">|</span>
                  {brief.repName}
                </p>
              </div>
              <StageBadge stage={brief.stage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Last Call Summary</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{brief.lastCallSummary}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Winning Pattern</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{brief.winningPattern}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Open Commitments
                </p>
                <ul className="space-y-1.5">
                  {brief.openCommitments.map((c, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-brand-400 mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Recurring Objections
                </p>
                <ul className="space-y-1.5">
                  {brief.recurringObjections.map((o, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">•</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Talk Ratio History
                </p>
                <p className="text-sm text-zinc-300">
                  Rep {brief.talkTimeRatio.rep}% / Prospect {brief.talkTimeRatio.prospect}%
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {brief.talkTimeRatio.rep > 55 ? 'Rep talks too much — coach listening' :
                   brief.talkTimeRatio.rep < 35 ? 'Rep is passive — coach assertion' :
                   'Healthy balance'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
