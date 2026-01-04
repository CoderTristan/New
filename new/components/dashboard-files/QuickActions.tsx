'use client'

import { Lightbulb, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  onNewIdea: () => void
  onNewScript: () => void
  disabled?: boolean
  disabledReason?: string
}

export default function QuickActions({
  onNewIdea,
  onNewScript,
  disabled = false,
  disabledReason = '',
}: QuickActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onNewIdea}
        disabled={disabled}
        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white h-12"
        title={disabled ? disabledReason : ''}
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        New Idea
      </Button>
      <Button
        onClick={onNewScript}
        disabled={disabled}
        variant="outline"
        className="flex-1 border-stone-300 h-12"
        title={disabled ? disabledReason : ''}
      >
        <FileText className="w-4 h-4 mr-2" />
        New Script
      </Button>
    </div>
  )
}
