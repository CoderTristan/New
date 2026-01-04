'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { History, Play, ChevronLeft, Check, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import VersionHistory from './VersionHistory'
import AttachmentsPanel from './AttachmentsPanel'
import DeliverabilityPanel from './DeliverabilityPanel'
import { updateScript } from '@/lib/db/dbCalls'

export interface Script {
  id: string
  stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published'
  title?: string
  hook_content?: string
  outline_content?: string
  script_content?: string
  notes_content?: string
  checklist_intro?: boolean
  checklist_body?: boolean
  checklist_cta?: boolean
  target_length_minutes?: number
  words_per_minute?: number
  attachments?: any[]
  versions?: any[]
  last_edited?: string
}

interface ScriptWorkspaceProps {
  initialScript: Script
  scriptId: string
  subscription?: any
}

// --------------------------
// Simple debounce hook
// --------------------------
function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}

// --------------------------
// Normalize defaults
// --------------------------
function normalizeScript(data: Script): Script {
  return {
    ...data,
    hook_content: data.hook_content || '',
    outline_content: data.outline_content || '',
    script_content: data.script_content || '',
    notes_content: data.notes_content || '',
    checklist_intro: data.checklist_intro || false,
    checklist_body: data.checklist_body || false,
    checklist_cta: data.checklist_cta || false,
    target_length_minutes: data.target_length_minutes || 10,
    words_per_minute: data.words_per_minute || 150,
    attachments: data.attachments || [],
    versions: data.versions || [],
  }
}

export default function ScriptWorkspace({ initialScript, scriptId, subscription }: ScriptWorkspaceProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Script>(normalizeScript(initialScript))
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeSection, setActiveSection] = useState<'hook' | 'outline' | 'script' | 'notes'>('hook')
  const isFreeTier = !subscription

  const stageColors: Record<string, string> = {
    idea: 'bg-violet-100 text-violet-700',
    draft: 'bg-amber-100 text-amber-700',
    editing: 'bg-blue-100 text-blue-700',
    ready: 'bg-emerald-100 text-emerald-700',
    published: 'bg-stone-100 text-stone-700',
  }

  // --------------------------
  // Debounced auto-save
  // --------------------------
  const debouncedSave = useDebouncedCallback(async (data: Script) => {
    setIsSaving(true)
    await updateScript(data.id, { ...data, last_edited: new Date().toISOString() })
    setIsSaving(false)
    setLastSaved(new Date())
  }, 2000)

  const handleChange = (field: keyof Script, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    debouncedSave(newData)
  }

  // --------------------------
  // Version snapshots
  // --------------------------
  const handleSaveSnapshot = () => {
    const newVersion = {
      timestamp: new Date().toISOString(),
      label: `Snapshot ${(formData.versions?.length || 0) + 1}`,
      hook_content: formData.hook_content,
      outline_content: formData.outline_content,
      script_content: formData.script_content,
      notes_content: formData.notes_content,
    }
    handleChange('versions', [...(formData.versions || []), newVersion])
  }

  const restoreVersion = (version: any) => {
    const newData = {
      ...formData,
      hook_content: version.hook_content,
      outline_content: version.outline_content,
      script_content: version.script_content,
      notes_content: version.notes_content,
    }
    setFormData(newData)
    debouncedSave(newData)
  }

  const checklistComplete =
    formData.checklist_intro && formData.checklist_body && formData.checklist_cta

  if (!formData) {
    return (
      <motion.div
        className="min-h-screen bg-stone-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">Loading script...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-stone-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="sticky top-0 z-10 bg-white border-b border-stone-200"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/pipeline`)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="text-xl font-semibold border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                placeholder="Script title"
              />
              <div className="flex items-center gap-2 mt-1">
                <Badge className={stageColors[formData.stage || 'idea']}>{formData.stage}</Badge>
                {isSaving && (
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Saving...
                  </span>
                )}
                {lastSaved && !isSaving && (
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveSnapshot}>
              <History className="w-4 h-4 mr-2" /> Snapshot
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">History</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Version History</SheetTitle>
                </SheetHeader>
                <VersionHistory versions={formData.versions || []} onRestore={restoreVersion} />
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">Attachments</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Attachments</SheetTitle>
                </SheetHeader>
                <AttachmentsPanel
                scriptId={scriptId}
                  attachments={formData.attachments || []}
                  onUpdate={(attachments) => handleChange('attachments', attachments)}
                />
              </SheetContent>
            </Sheet>

             <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/${formData.id}/teleprompter`)}
            >
              <Play className="w-4 h-4 mr-2" /> Teleprompter
            </Button>

            {isFreeTier && (
              <div className="absolute top-0 left-0 w-full h-full bg-white/80 z-20 flex items-center justify-center rounded-lg pointer-events-none">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/dashboard/billing')}
                  className="pointer-events-auto"
                >
                  Upgrade to Creator to use
                </Button>
              </div>
            )}
          </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="hook">Hook</TabsTrigger>
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="hook">
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <Label className="text-stone-700 mb-2 block">
                  Hook Content
                  <span className="text-stone-400 font-normal ml-2">First 30 seconds - grab attention</span>
                </Label>
                <Textarea
                  value={formData.hook_content}
                  onChange={(e) => handleChange('hook_content', e.target.value)}
                  placeholder="Write your hook here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="outline">
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <Label className="text-stone-700 mb-2 block">
                  Outline
                  <span className="text-stone-400 font-normal ml-2">Structure your content before writing</span>
                </Label>
                <Textarea
                  value={formData.outline_content}
                  onChange={(e) => handleChange('outline_content', e.target.value)}
                  placeholder="- Main point 1&#10;- Supporting detail"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="script">
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <Label className="text-stone-700 mb-2 block">
                  Full Script
                  <span className="text-stone-400 font-normal ml-2">Use [ACTION: description] for cues</span>
                </Label>
                <Textarea
                  value={formData.script_content}
                  onChange={(e) => handleChange('script_content', e.target.value)}
                  placeholder="Write your full script here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <Label className="text-stone-700 mb-2 block">
                  Notes
                  <span className="text-stone-400 font-normal ml-2">Research, references, reminders</span>
                </Label>
                <Textarea
                  value={formData.notes_content}
                  onChange={(e) => handleChange('notes_content', e.target.value)}
                  placeholder="Add notes here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Checklist */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              Completion Checklist
              {checklistComplete && <Check className="w-4 h-4 text-emerald-600" />}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.checklist_intro}
                  onCheckedChange={(checked) => handleChange('checklist_intro', checked)}
                />
                <span className="text-sm text-stone-700">Intro Complete</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.checklist_body}
                  onCheckedChange={(checked) => handleChange('checklist_body', checked)}
                />
                <span className="text-sm text-stone-700">Body Complete</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.checklist_cta}
                  onCheckedChange={(checked) => handleChange('checklist_cta', checked)}
                />
                <span className="text-sm text-stone-700">Call to Action</span>
              </label>
            </div>
          </div>

          {/* Target Settings */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-900 mb-4">Target Settings</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-stone-600">Target Length (min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.target_length_minutes}
                  onChange={(e) => handleChange('target_length_minutes', parseInt(e.target.value) || 10)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-stone-600">Speaking Pace (WPM)</Label>
                <Input
                  type="number"
                  min={100}
                  max={200}
                  value={formData.words_per_minute}
                  onChange={(e) => handleChange('words_per_minute', parseInt(e.target.value) || 150)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 relative">
          {/* Deliverability Panel */}
          <DeliverabilityPanel
            scriptContent={formData.script_content || ''}
            hookContent={formData.hook_content || ''}
            targetMinutes={formData.target_length_minutes || 10}
            wpm={formData.words_per_minute || 150}
          />

          {isFreeTier && (
            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl pointer-events-none">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/billing')}
                className="pointer-events-auto"
              >
                Upgrade to Creator to use
              </Button>
            </div>
          )}
        </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
