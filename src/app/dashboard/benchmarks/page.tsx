'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import type { BenchmarkSegment } from '@/lib/demo'

const teamData = {
  showRate: 68,
  contractRate: 24,
  avgSalesCycle: 42,
  avgDealSize: 89,
  winRate: 28,
}

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkSegment[]>([])

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => setBenchmarks(d.benchmarks || []))
  }, [])

  const radarData = [
    { metric: 'Show Rate', team: teamData.showRate, median: 65 },
    { metric: 'Contract Rate', team: teamData.contractRate, median: 22 },
    { metric: 'Win Rate', team: teamData.winRate, median: 25 },
    { metric: 'Deal Size (k)', team: teamData.avgDealSize, median: 70 },
    { metric: 'Sales Cycle (d)', team: 100 - teamData.avgSalesCycle, median: 58 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-500" />
          Industry Benchmarks
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Your numbers against comparable orgs across 28 industry segments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <h2 className="font-semibold mb-4">Segment Comparison</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarks} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} domain={[0, 100]} />
                <YAxis dataKey="segment" type="category" tick={{ fill: '#d4d4d8', fontSize: 11 }} width={140} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8 }}
                  itemStyle={{ color: '#a5b4fc' }}
                />
                <Bar dataKey="winRate" fill="#6366f1" radius={[0, 4, 4, 0]} name="Win Rate %" />
                <Bar dataKey="showRate" fill="#10b981" radius={[0, 4, 4, 0]} name="Show Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <h2 className="font-semibold mb-4">Your Team vs Median</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: '#71717a', fontSize: 9 }} />
                <Radar name="Your Team" dataKey="team" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Radar name="Industry Median" dataKey="median" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 8, fontSize: 12 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Show Rate', value: `${teamData.showRate}%`, vs: '+3pp vs median', good: true },
          { label: 'Contract Rate', value: `${teamData.contractRate}%`, vs: '+2pp vs median', good: true },
          { label: 'Avg Cycle', value: `${teamData.avgSalesCycle}d`, vs: '-12d vs median', good: true },
          { label: 'Avg Deal', value: `$${teamData.avgDealSize}k`, vs: '+19k vs median', good: true },
          { label: 'Win Rate', value: `${teamData.winRate}%`, vs: '+3pp vs median', good: true },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center"
          >
            <p className="text-xs text-zinc-500 uppercase tracking-wide">{m.label}</p>
            <p className="text-xl font-bold text-white mt-1">{m.value}</p>
            <p className={`text-xs mt-1 ${m.good ? 'text-emerald-400' : 'text-rose-400'}`}>{m.vs}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
