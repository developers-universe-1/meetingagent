interface Props {
  stage: string
}

const stageStyles: Record<string, string> = {
  lead: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  discovery: 'bg-sky-950/50 text-sky-400 border-sky-900',
  demo: 'bg-violet-950/50 text-violet-400 border-violet-900',
  proposal: 'bg-amber-950/50 text-amber-400 border-amber-900',
  negotiation: 'bg-orange-950/50 text-orange-400 border-orange-900',
  'closed-won': 'bg-emerald-950/50 text-emerald-400 border-emerald-900',
  'closed-lost': 'bg-rose-950/50 text-rose-400 border-rose-900',
}

export default function StageBadge({ stage }: Props) {
  const style = stageStyles[stage] || stageStyles.lead
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${style}`}>
      {stage.replace('-', ' ')}
    </span>
  )
}
