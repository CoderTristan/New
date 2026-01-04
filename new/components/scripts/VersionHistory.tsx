import React from 'react'
import { format, parseISO } from 'date-fns'
import { RotateCcw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Version {
  timestamp: string
  label: string
  hook_content?: string
  outline_content?: string
  script_content?: string
  notes_content?: string
}

interface VersionHistoryProps {
  versions: Version[]
  onRestore: (version: Version) => void
}

export default function VersionHistory({ versions, onRestore }: VersionHistoryProps) {
  if (!versions || versions.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-sm text-stone-500">No snapshots yet</p>
        <p className="text-xs text-stone-400 mt-1">
          Click "Snapshot" to save a version
        </p>
      </div>
    )
  }

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getWordCount = (text?: string) =>
    text ? text.trim().split(/\s+/).length : 0

  return (
    <div className="py-4 space-y-3 max-h-[70vh] overflow-y-auto">
      {sortedVersions.map((version, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border border-stone-200 hover:border-stone-300 transition-colors bg-white"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-stone-900">{version.label}</h4>
              <p className="text-xs text-stone-500">
                {format(parseISO(version.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(version)}
              className="flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restore
            </Button>
          </div>

          <div className="text-xs text-stone-400 space-y-1">
            <p>Hook: {getWordCount(version.hook_content)} words</p>
            <p>Outline: {getWordCount(version.outline_content)} words</p>
            <p>Script: {getWordCount(version.script_content)} words</p>
            <p>Notes: {getWordCount(version.notes_content)} words</p>
          </div>
        </div>
      ))}
    </div>
  )
}
