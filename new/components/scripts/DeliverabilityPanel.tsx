'use client'

import { AlertTriangle, Check, Clock, FileText, Zap, BarChart3 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface DeliverabilityPanelProps {
  scriptContent: string
  hookContent: string
  targetMinutes: number
  wpm: number
}

export default function DeliverabilityPanel({
  scriptContent,
  hookContent,
  targetMinutes,
  wpm,
}: DeliverabilityPanelProps) {
  // Combine content
  const allContent = (hookContent || '') + '\n\n' + (scriptContent || '')
  const cleanContent = allContent.replace(/\[ACTION:.*?\]/g, '')
  const words = cleanContent.split(/\s+/).filter(w => w).length
  const estimatedMinutes = words / (wpm || 150)

  // Pacing score
  const targetWords = (targetMinutes || 10) * (wpm || 150)
  const pacingRatio = words / targetWords
  const pacingScore = Math.max(0, Math.min(100, 100 - Math.abs(1 - pacingRatio) * 100))

  // Action cues
  const actionCues = (allContent.match(/\[ACTION:.*?\]/g) || []).length
  const recommendedCues = Math.max(1, Math.floor(estimatedMinutes / 2))
  const cuesOk = actionCues >= recommendedCues

  // Readability (Flesch-Kincaid approximation)
  const syllables = cleanContent.toLowerCase().split(/\s+/).reduce((count, word) => {
    const matches = word.match(/[aeiouy]+/g)
    return count + (matches ? matches.length : 1)
  }, 0)
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim()).length || 1
  const avgWordsPerSentence = words / sentences
  const avgSyllablesPerWord = syllables / (words || 1)
  const readingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  const readabilityScore = Math.max(0, Math.min(100, readingEase))

  // Long segment check
  const paragraphs = cleanContent.split(/\n\n+/)
  const longSegments = paragraphs.filter(p => p.split(/\s+/).filter(w => w).length > 300)

  // Overall readiness
  const issues: string[] = []
  if (pacingScore < 70) issues.push('Pacing significantly off target')
  if (!cuesOk) issues.push(`Need ${recommendedCues - actionCues} more action cues`)
  if (readabilityScore < 50) issues.push('Script may be too complex')
  if (longSegments.length > 0) issues.push(`${longSegments.length} segment(s) over 300 words`)

  const isReady = issues.length === 0

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" /> Deliverability
      </h3>

      <div className="space-y-5">
        {/* Pacing */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pacing
            </span>
            <span className="text-sm font-medium">
              {estimatedMinutes.toFixed(1)} / {targetMinutes} min
            </span>
          </div>
          <Progress value={pacingScore} className="h-2" />
          <div className="flex justify-between text-xs text-stone-400 mt-1">
            <span>{words} words</span>
            <span>{Math.round(pacingScore)}% match</span>
          </div>
        </div>

        {/* Action Cues */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Action Cues
            </span>
            <span className={`text-sm font-medium ${cuesOk ? 'text-emerald-600' : 'text-amber-600'}`}>
              {actionCues} / {recommendedCues} min
            </span>
          </div>
          <Progress value={Math.min(100, (actionCues / recommendedCues) * 100)} className="h-2" />
        </div>

        {/* Readability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Readability
            </span>
            <span
              className={`text-sm font-medium ${
                readabilityScore >= 60 ? 'text-emerald-600' : readabilityScore >= 40 ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {readabilityScore >= 60 ? 'Easy' : readabilityScore >= 40 ? 'Moderate' : 'Complex'}
            </span>
          </div>
          <Progress value={readabilityScore} className="h-2" />
          <div className="text-xs text-stone-400 mt-1">Avg {avgWordsPerSentence.toFixed(0)} words/sentence</div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="pt-3 border-t border-stone-100">
            <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Issues</h4>
            <ul className="space-y-1.5">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ready Status */}
        <div className={`p-3 rounded-lg ${isReady ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-2">
            {isReady ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Ready for filming</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  {issues.length} issue{issues.length > 1 ? 's' : ''} to address
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
