'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createIdea, updateIdea } from '@/lib/db/dbCalls'

const TOPICS = ['tutorial','review','commentary','vlog','educational','entertainment','news','behind-the-scenes','q-and-a','challenge']
const FORMATS = ['long-form','short-form','series-episode','standalone','compilation','documentary']
const HOOK_TYPES = ['question','bold-claim','story-tease','problem-solution','curiosity-gap','controversy','promise','demonstration']
const PRIORITIES = ['urgent','high','medium','low','someday']


export default function IdeaModal({ idea, onClose, onSave }: { idea?: any; onClose: () => void; onSave: (idea: any) => void }) {
  const isEditing = !!idea
  const [formData, setFormData] = useState({
    title: idea?.title || '',
    description: idea?.description || '',
    topic: idea?.topic || '',
    format: idea?.format || '',
    hook_type: idea?.hook_type || '',
    priority: idea?.priority || 'medium',
    status: idea?.status || 'captured',
  })
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const validate = () => {
    const newErrors: Record<string,string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.topic) newErrors.topic = 'Topic is required'
    if (!formData.format) newErrors.format = 'Format is required'
    if (!formData.hook_type) newErrors.hook_type = 'Hook type is required'
    if (!formData.priority) newErrors.priority = 'Priority is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      if (isEditing) {
        await updateIdea(idea.id, formData)
        onSave({ ...idea, ...formData })
      } else {
        const newIdea = await createIdea(formData)
        onSave(newIdea)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const formatLabel = (str: string) => str.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity:0, scale:0.95 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0, scale:0.95 }}
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">{isEditing ? 'Edit Idea' : 'Capture New Idea'}</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5"/></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <Label htmlFor="title" className="text-stone-700">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e=>setFormData({...formData, title:e.target.value})}
                placeholder="Clear, descriptive title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description" className="text-stone-700">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e=>setFormData({...formData, description:e.target.value})}
                placeholder="Detailed description of the video concept"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-700">Topic *</Label>
                <Select value={formData.topic} onValueChange={v=>setFormData({...formData, topic:v})}>
                  <SelectTrigger className={errors.topic?'border-red-500':''}><SelectValue placeholder="Select topic"/></SelectTrigger>
                  <SelectContent>{TOPICS.map(t=><SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>)}</SelectContent>
                </Select>
                {errors.topic && <p className="text-xs text-red-500 mt-1">{errors.topic}</p>}
              </div>

              <div>
                <Label className="text-stone-700">Format *</Label>
                <Select value={formData.format} onValueChange={v=>setFormData({...formData, format:v})}>
                  <SelectTrigger className={errors.format?'border-red-500':''}><SelectValue placeholder="Select format"/></SelectTrigger>
                  <SelectContent>{FORMATS.map(f=><SelectItem key={f} value={f}>{formatLabel(f)}</SelectItem>)}</SelectContent>
                </Select>
                {errors.format && <p className="text-xs text-red-500 mt-1">{errors.format}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-700">Hook Type *</Label>
                <Select value={formData.hook_type} onValueChange={v=>setFormData({...formData, hook_type:v})}>
                  <SelectTrigger className={errors.hook_type?'border-red-500':''}><SelectValue placeholder="Select hook"/></SelectTrigger>
                  <SelectContent>{HOOK_TYPES.map(h=><SelectItem key={h} value={h}>{formatLabel(h)}</SelectItem>)}</SelectContent>
                </Select>
                {errors.hook_type && <p className="text-xs text-red-500 mt-1">{errors.hook_type}</p>}
              </div>

              <div>
                <Label className="text-stone-700">Priority *</Label>
                <Select value={formData.priority} onValueChange={v=>setFormData({...formData, priority:v})}>
                  <SelectTrigger className={errors.priority?'border-red-500':''}><SelectValue placeholder="Select priority"/></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p=><SelectItem key={p} value={p}>{formatLabel(p)}</SelectItem>)}</SelectContent>
                </Select>
                {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority}</p>}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={isSaving}>
                {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Capture Idea')}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
