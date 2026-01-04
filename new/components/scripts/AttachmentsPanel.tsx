'use client'

import React, { useState } from 'react'
import { Upload, Trash2, ExternalLink, Image, FileText, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addAttachmentToScript } from '@/lib/db/dbCalls' // Your Drizzle DB function

interface Attachment {
  category: string
  name: string
  url: string // base64 or data URL
}

interface AttachmentsPanelProps {
  scriptId: string
  attachments: Attachment[]
  onUpdate: (attachments: Attachment[]) => void
}

const CATEGORIES = [
  { value: 'thumbnail', label: 'Thumbnail Draft', icon: Image },
  { value: 'sponsor', label: 'Sponsor Notes', icon: FileText },
  { value: 'reference', label: 'Reference', icon: Bookmark },
]

export default function AttachmentsPanel({ scriptId, attachments, onUpdate }: AttachmentsPanelProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [newCategory, setNewCategory] = useState('reference')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file)

      const newAttachment: Attachment = {
        category: newCategory,
        name: file.name,
        url: base64Data,
      }

      // Update DB
      const updated = await addAttachmentToScript(scriptId, newAttachment)

      // Update local state
      onUpdate(updated)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleRemove = async (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index)
    onUpdate(newAttachments)

  }

  const groupedAttachments: Record<string, Attachment[]> = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = attachments.filter(a => a.category === cat.value)
    return acc
  }, {} as Record<string, Attachment[]>)

  return (
    <div className="py-4">
      {/* Upload Section */}
      <div className="mb-6 p-4 border border-dashed border-stone-300 rounded-lg">
        <div className="flex gap-3 mb-3">
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="block">
          <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
          <Button variant="outline" className="w-full" disabled={isUploading} asChild>
            <span className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </span>
          </Button>
        </label>
      </div>

      {/* Render Attachments */}
      <div className="space-y-6">
        {CATEGORIES.map(cat => {
          const items = groupedAttachments[cat.value]
          if (items.length === 0) return null
          const Icon = cat.icon
          return (
            <div key={cat.value}>
              <h4 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {cat.label}
              </h4>
              <div className="space-y-2">
                {items.map((attachment, index) => {
                  const globalIndex = attachments.indexOf(attachment)
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 bg-stone-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{attachment.name}</p>
                      </div>
                      <div className="flex gap-1">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleRemove(globalIndex)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Convert file to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
