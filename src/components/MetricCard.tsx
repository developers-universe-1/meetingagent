'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string
  subtext?: string
  icon: LucideIcon
  color?: string
  delay?: number
}

export default function MetricCard({ label, value, subtext, icon: Icon, color = 'text-brand-400', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
        <div className={`bg-zinc-800/50 w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
    </motion.div>
  )
}
