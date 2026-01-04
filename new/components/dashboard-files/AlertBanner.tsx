'use client'

import { AlertTriangle, Clock, FileWarning } from 'lucide-react'
import Link from 'next/link'

export type AlertType = 'stalled' | 'unscheduled' | 'overdue_review'

export interface AlertBannerProps {
  type: AlertType
  count?: number
  scriptId?: string
  scriptTitle?: string
}

export default function AlertBanner({ type, count = 0, scriptId, scriptTitle }: AlertBannerProps) {
  const configs: Record<AlertType, {
    icon: typeof AlertTriangle
    bg: string
    text: string
    iconColor: string
    message: string
    link: string
  }> = {
    stalled: {
      icon: Clock,
      bg: 'bg-amber-50 border border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-600',
      message: `${count} script${count > 1 ? 's' : ''} stalled for over 7 days`,
      link: '/pipeline',
    },
    unscheduled: {
      icon: FileWarning,
      bg: 'bg-blue-50 border border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600',
      message: `${count} ready script${count > 1 ? 's' : ''} without publish date${count > 1 ? 's' : ''}`,
      link: '/calendar',
    },
    overdue_review: {
      icon: AlertTriangle,
      bg: 'bg-red-50 border border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600',
      message: scriptTitle ? `Review required for "${scriptTitle}" before proceeding` : 'Review required',
      link: `/review?scriptId=${scriptId}`,
    },
  }

  const config = configs[type]
  if (!config) return null

  const Icon = config.icon

  return (
    <Link href={config.link}>
      <div
        className={`
          p-4 rounded-xl flex items-center gap-3 cursor-pointer
          ${config.bg} hover:opacity-90 transition-opacity
          shadow-sm
        `}
      >
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span className={`text-sm font-medium ${config.text}`}>{config.message}</span>
      </div>
    </Link>
  )
}
