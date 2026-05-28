'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, TrendingDown, Award, ChevronRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import type { RepScorecard } from '@/lib/demo'

export default function CoachingPage() {
  const [reps, setReps] = useState<RepScorecard[]>([])

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => setReps(d.reps || []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-500" />
          Rep Coaching
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Per-position scorecards built from real call data — not vibes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reps.map((rep, i) => (
          <motion.div
            key={rep.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-medium text-lg">{rep.name}</p>
                <p className="text-xs text-zinc-500">{rep.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-400" />
                <span className="text-2xl font-bold">{rep.score}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-200">{rep.callsHandled}</p>
                <p className="text-[10px] text-zinc-500 uppercase">Calls</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-200">{rep.closeRate}%</p>
                <p className="text-[10px] text-zinc-500 uppercase">Close Rate</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-200">{rep.avgTalkRatio}%</p>
                <p className="text-[10px] text-zinc-500 uppercase">Talk Ratio</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-200">${(rep.avgDealSize / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-zinc-500 uppercase">Avg Deal</p>
              </div>
            </div>

            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rep.weeklyTrend.map((v, idx) => ({ week: `W${idx + 1}`, score: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis domain={[60, 100]} tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#a5b4fc' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Strengths
                </p>
                <ul className="space-y-1">
                  {rep.strengths.map((s, idx) => (
                    <li key={idx} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-amber-400 mb-1.5 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Gaps
                </p>
                <ul className="space-y-1">
                  {rep.gaps.map((g, idx) => (
                    <li key={idx} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <h2 className="font-semibold mb-4">Team Comparison</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reps.map(r => ({ name: r.name.split(' ')[0], score: r.score, closeRate: r.closeRate }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }}
                itemStyle={{ color: '#a5b4fc' }}
              />
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Coaching Score" />
              <Bar dataKey="closeRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Close Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
