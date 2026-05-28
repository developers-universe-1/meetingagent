interface Props {
  sentiment: 'positive' | 'neutral' | 'negative'
}

const styles = {
  positive: 'bg-emerald-950/50 text-emerald-400 border-emerald-900',
  neutral: 'bg-amber-950/50 text-amber-400 border-amber-900',
  negative: 'bg-rose-950/50 text-rose-400 border-rose-900',
}

export default function SentimentBadge({ sentiment }: Props) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[sentiment]}`}>
      {sentiment}
    </span>
  )
}
