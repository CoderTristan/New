'use client'

import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { FileText, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Script {
  id: number
  title?: string
  stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published'
  updated_at?: string | Date | null
  last_edited?: string | Date | null
}

interface RecentEditsProps {
  scripts: Script[]
}

export default function RecentEdits({ scripts }: RecentEditsProps) {
  const router = useRouter()

  // Normalize dates to Date objects
  const normalizedScripts = scripts
    .map(script => {
      const updated = script.updated_at
        ? script.updated_at instanceof Date
          ? script.updated_at
          : parseISO(script.updated_at)
        : null
      const edited = script.last_edited
        ? script.last_edited instanceof Date
          ? script.last_edited
          : parseISO(script.last_edited)
        : null

      return { ...script, updated_at: updated, last_edited: edited }
    })
    .filter(script => script.updated_at || script.last_edited) // Keep only scripts with dates

  // Sort by most recent
  const recentScripts = normalizedScripts
    .sort(
      (a, b) =>
        (b.updated_at ?? b.last_edited)!.getTime() -
        (a.updated_at ?? a.last_edited)!.getTime()
    )
    .slice(0, 5)

  const stageColors: Record<string, string> = {
    idea: 'bg-violet-100 text-violet-700',
    draft: 'bg-amber-100 text-amber-700',
    editing: 'bg-blue-100 text-blue-700',
    ready: 'bg-emerald-100 text-emerald-700',
    published: 'bg-stone-100 text-stone-700',
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-stone-500" />
          <h3 className="font-semibold text-stone-900">Recent Edits</h3>
        </div>
        <button
          onClick={() => router.push('/dashboard/pipeline')}
          className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1"
        >
          View pipeline
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Script list */}
      {recentScripts.length === 0 ? (
        <p className="text-sm text-stone-500 py-4 text-center">
          No recent activity
        </p>
      ) : (
        <div className="space-y-2">
          {recentScripts.map(script => {
            const date = script.updated_at ?? script.last_edited
            return (
              <button
                key={script.id}
                onClick={() =>
                  router.push(`/dashboard/${script.id}/workspace`)
                }
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors w-full text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-900 truncate">
                    {script.title}
                  </div>
                  <div className="text-xs text-stone-500">
                    {date && isValid(date)
                      ? formatDistanceToNow(date, { addSuffix: true })
                      : 'Unknown'}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    stageColors[script.stage]
                  }`}
                >
                  {script.stage}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
