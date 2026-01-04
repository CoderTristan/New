'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { createScript, updateIdea } from '@/lib/db/dbCalls'

const TOPICS = ['tutorial', 'review', 'commentary', 'vlog', 'educational', 'entertainment', 'news', 'behind-the-scenes', 'q-and-a', 'challenge']
const FORMATS = ['long-form', 'short-form', 'series-episode', 'standalone', 'compilation', 'documentary']
const HOOK_TYPES = ['question', 'bold-claim', 'story-tease', 'problem-solution', 'curiosity-gap', 'controversy', 'promise', 'demonstration']

export default function ScriptModal({ idea, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: idea?.title || '',
    idea_id: idea?.id || null,
    stage: 'idea',
    topic: idea?.topic || '',
    format: idea?.format || '',
    hook_type: idea?.hook_type || '',
    target_length_minutes: 10,
    words_per_minute: 150,
    hook_content: '',
    outline_content: '',
    script_content: '',
    notes_content: idea?.description || '',
    checklist_intro: false,
    checklist_body: false,
    checklist_cta: false,
    attachments: [],
    versions: [],
    last_edited: new Date().toISOString(),
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: any = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.topic) newErrors.topic = 'Topic is required'
    if (!formData.format) newErrors.format = 'Format is required'
    if (!formData.hook_type) newErrors.hook_type = 'Hook type is required'
    if (!formData.target_length_minutes || formData.target_length_minutes <= 0) {
      newErrors.target_length_minutes = 'Valid target length required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      const script = await createScript(formData)
      if (idea) {
        await updateIdea(idea.id, { status: 'promoted', promoted_to_script_id: script.id })
      }
      onSave(script)
    } catch (err) {
      console.error('Error creating script:', err)
      alert('Failed to create script.')
    } finally {
      setLoading(false)
    }
  }

  const formatLabel = (str) => str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">
              {idea ? 'Promote Idea to Script' : 'New Script'}
            </h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <Label htmlFor="title" className="text-stone-700">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Script title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-700">Topic *</Label>
                <Select value={formData.topic} onValueChange={(v) => setFormData({ ...formData, topic: v })}>
                  <SelectTrigger className={errors.topic ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.topic && <p className="text-xs text-red-500 mt-1">{errors.topic}</p>}
              </div>

              <div>
                <Label className="text-stone-700">Format *</Label>
                <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                  <SelectTrigger className={errors.format ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>{formatLabel(f)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.format && <p className="text-xs text-red-500 mt-1">{errors.format}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-700">Hook Type *</Label>
                <Select value={formData.hook_type} onValueChange={(v) => setFormData({ ...formData, hook_type: v })}>
                  <SelectTrigger className={errors.hook_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select hook" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOOK_TYPES.map((h) => (
                      <SelectItem key={h} value={h}>{formatLabel(h)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hook_type && <p className="text-xs text-red-500 mt-1">{errors.hook_type}</p>}
              </div>

              <div>
                <Label className="text-stone-700">Target Length (min) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.target_length_minutes}
                  onChange={(e) => setFormData({ ...formData, target_length_minutes: parseInt(e.target.value) || 0 })}
                  className={errors.target_length_minutes ? 'border-red-500' : ''}
                />
                {errors.target_length_minutes && <p className="text-xs text-red-500 mt-1">{errors.target_length_minutes}</p>}
              </div>
            </div>

            <div>
              <Label className="text-stone-700">Speaking Pace (WPM)</Label>
              <Input
                type="number"
                min="100"
                max="200"
                value={formData.words_per_minute}
                onChange={(e) => setFormData({ ...formData, words_per_minute: parseInt(e.target.value) || 150 })}
              />
              <p className="text-xs text-stone-500 mt-1">Words per minute for pacing calculations</p>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-stone-900 hover:bg-stone-800"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Script'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
