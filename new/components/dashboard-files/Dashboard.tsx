'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { differenceInDays } from 'date-fns'
import { useRouter } from 'next/navigation'

import StageCounter from './StageCounter'
import AlertBanner from './AlertBanner'
import RecentEdits from './RecentEdits'
import QuickActions from './QuickActions'
import IdeaModal from './IdeaModal'
import ScriptModal from './ScriptModal'
import MiniCalendar from './MiniCalender'

/* ------------------------------------------------------------------ */
/* Types — match the actual data coming from the DB                    */
/* ------------------------------------------------------------------ */

export interface Script {
  id: number
  stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published'
  title?: string | null
  last_edited?: string | Date | null
  updated_at?: string | Date | null
  scheduled_date?: string | Date | null
}

export interface UserSettings {
  hasPendingReview: boolean
  pendingReviewScriptId?: number | null
}

interface DashboardClientProps {
  scripts?: Script[] | null
  userSettings?: UserSettings | null
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardClient({
  scripts = [],
  userSettings,
}: DashboardClientProps) {
  const router = useRouter()
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [showScriptModal, setShowScriptModal] = useState(false)

  /* ------------------------------------------------------------------ */
  /* Normalize all date fields to Date objects                          */
  /* ------------------------------------------------------------------ */
  const normalizedScripts = useMemo(
    () =>
      scripts.map(script => ({
        ...script,
        last_edited: script.last_edited ? new Date(script.last_edited) : null,
        updated_at: script.updated_at ? new Date(script.updated_at) : null,
        scheduled_date: script.scheduled_date
          ? new Date(script.scheduled_date)
          : null,
      })),
    [scripts]
  )

  /* ------------------------------------------------------------------ */
  /* Stage counts                                                       */
  /* ------------------------------------------------------------------ */
  const stageCounts = {
    idea: normalizedScripts.filter(s => s.stage === 'idea').length,
    draft: normalizedScripts.filter(s => s.stage === 'draft').length,
    editing: normalizedScripts.filter(s => s.stage === 'editing').length,
    ready: normalizedScripts.filter(s => s.stage === 'ready').length,
    published: normalizedScripts.filter(s => s.stage === 'published').length,
  }

  /* ------------------------------------------------------------------ */
  /* Stalled scripts (older than 7 days, not published)                 */
  /* ------------------------------------------------------------------ */
  const stalledScripts = normalizedScripts.filter(s => {
    if (s.stage === 'published') return false
    const lastEdit = s.updated_at ?? s.last_edited
    if (!lastEdit) return false
    return differenceInDays(new Date(), lastEdit) > 7
  })

  /* ------------------------------------------------------------------ */
  /* Scheduling logic                                                   */
  /* ------------------------------------------------------------------ */
  const unscheduledReady = normalizedScripts.filter(
    s => s.stage === 'ready' && !s.scheduled_date
  )

  const scheduledScripts = normalizedScripts.filter(s => s.scheduled_date)

  const isBlocked = userSettings?.hasPendingReview ?? false

  /* ------------------------------------------------------------------ */
  /* Handlers                                                           */
  /* ------------------------------------------------------------------ */
  const handleNewIdea = () => setShowIdeaModal(true)
  const handleNewScript = () => setShowScriptModal(true)

  const handleIdeaCreated = () => setShowIdeaModal(false)
  const handleScriptCreated = (script: Script) => {
    setShowScriptModal(false)
    router.push(`/dashboard/${script.id}/workspace`)
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-stone-500">Your pipeline at a glance</p>
      </div>

      {/* Alerts */}
      <div className="space-y-3 mb-8">
        {isBlocked && userSettings?.pendingReviewScriptId && (
          <AlertBanner
            type="overdue_review"
            scriptId={userSettings.pendingReviewScriptId}
            scriptTitle={
              normalizedScripts.find(
                s => s.id === userSettings.pendingReviewScriptId
              )?.title ?? 'Untitled'
            }
          />
        )}

        {stalledScripts.length > 0 && (
          <AlertBanner type="stalled" count={stalledScripts.length} />
        )}

        {unscheduledReady.length > 0 && (
          <AlertBanner type="unscheduled" count={unscheduledReady.length} />
        )}
      </div>

      {/* Stage Counters */}
      <motion.div className="flex gap-4 mb-8">
        {(['idea', 'draft', 'editing', 'ready', 'published'] as const).map(
          stage => (
            <StageCounter
              key={stage}
              stage={stage}
              count={stageCounts[stage]}
              onClick={() => router.push('/dashboard/pipeline')}
            />
          )
        )}
      </motion.div>

      {/* Quick Actions */}
      <QuickActions
        onNewIdea={handleNewIdea}
        onNewScript={handleNewScript}
        disabled={isBlocked}
      />

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <MiniCalendar scheduledScripts={scheduledScripts} />
        <RecentEdits scripts={normalizedScripts} />
      </div>

      {/* Modals */}
      {showIdeaModal && (
        <IdeaModal
          onClose={() => setShowIdeaModal(false)}
          onSave={handleIdeaCreated}
        />
      )}

      {showScriptModal && (
        <ScriptModal
          onClose={() => setShowScriptModal(false)}
          onSave={handleScriptCreated}
        />
      )}
    </div>
  )
}
