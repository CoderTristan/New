'use client'

import { motion } from 'framer-motion'

export type Stage = 'idea' | 'draft' | 'editing' | 'ready' | 'published'

export interface StageCounterProps {
  stage: Stage
  count: number
  isActive?: boolean
  onClick?: () => void
}

export default function StageCounter({
  stage,
  count,
  isActive = false,
  onClick,
}: StageCounterProps) {
  const colorClasses: Record<Stage, string> = {
    idea: 'bg-violet-100 text-violet-700 border border-violet-200',
    draft: 'bg-amber-100 text-amber-700 border border-amber-200',
    editing: 'bg-blue-100 text-blue-700 border border-blue-200',
    ready: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    published: 'bg-stone-100 text-stone-700 border border-stone-200',
  }

  const stageLabels: Record<Stage, string> = {
    idea: 'Ideas',
    draft: 'Drafts',
    editing: 'Editing',
    ready: 'Ready',
    published: 'Published',
  }

  return (
    <motion.button
      onClick={onClick}
      className={`flex-1 p-4 rounded-xl border transition-all ${colorClasses[stage]} ${
        isActive ? 'ring-2 ring-offset-2 ring-stone-400' : ''
      } flex flex-col items-center`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-sm font-medium mt-1">{stageLabels[stage]}</div>
    </motion.button>
  )
}
