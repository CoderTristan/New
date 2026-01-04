'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Lightbulb, MoreVertical, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createIdea, updateIdea, deleteIdea, getUserIdeas } from '@/lib/db/dbCalls'
import IdeaModal from '../dashboard-files/IdeaModal'
import ScriptModal from '../dashboard-files/ScriptModal'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export interface Idea {
  id: string
  title?: string
  description?: string
  topic?: string
  format?: string
  priority?: string
  status?: string
}

export default function IdeaInbox() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterFormat, setFilterFormat] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('active')
  const [showIdeaModal, setShowIdeaModal] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [promoteIdea, setPromoteIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)

  const statusColors: Record<string, string> = {
    captured: 'bg-violet-100 text-violet-700',
    validated: 'bg-emerald-100 text-emerald-700',
    promoted: 'bg-stone-100 text-stone-500',
    archived: 'bg-stone-100 text-stone-400',
  }

  const formatLabel = (str?: string) =>
    str?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || ''

  // ----------------------
  // Load ideas from DB
  // ----------------------
  const loadIdeas = async () => {
    setLoading(true)
    try {
      const allIdeas = await getUserIdeas()
      setIdeas(allIdeas)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadIdeas()
  }, [])

  // ----------------------
  // Filtered ideas
  // ----------------------
  const filteredIdeas = ideas.filter((idea) => {
    const title = idea.title ?? ''
    const description = idea.description ?? ''
    const matchesSearch =
      !searchQuery ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTopic = filterTopic === 'all' || idea.topic === filterTopic
    const matchesFormat = filterFormat === 'all' || idea.format === filterFormat
    const matchesPriority = filterPriority === 'all' || idea.priority === filterPriority
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !['promoted', 'archived'].includes(idea.status || '')) ||
      idea.status === filterStatus
    return matchesSearch && matchesTopic && matchesFormat && matchesPriority && matchesStatus
  })

  // ----------------------
  // Handlers
  // ----------------------
  const handleIdeaSaved = async (data: Partial<Idea>) => {
    setShowIdeaModal(false)
    setEditingIdea(null)
    await loadIdeas()
  }

  const handleDelete = async (ideaId: string) => {
    await deleteIdea(ideaId)
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId))
  }

  const handlePromoteComplete = async (updatedIdea: Idea) => {
    await loadIdeas()
    setPromoteIdea(null)
    router.push(`/dashboard/${updatedIdea.id}/workspace`)
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Idea Inbox</h1>
          <p className="text-stone-500 mt-1">{filteredIdeas.length} ideas</p>
        </div>
        <div className="flex gap-2">
          {/* Refresh button now reloads from DB */}
          <Button onClick={loadIdeas} variant="outline">
            Refresh
          </Button>
          <Button
            onClick={() => setShowIdeaModal(true)}
            className="bg-violet-600 hover:bg-violet-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> New Idea
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Ideas List */}
      <AnimatePresence>
        {loading && <p className="text-stone-500">Loading...</p>}
        {!loading && filteredIdeas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 bg-white rounded-xl border border-stone-200"
          >
            <Lightbulb className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 mb-4">No ideas found.</p>
            <Button variant="outline" onClick={() => setShowIdeaModal(true)}>
              Capture your first idea
            </Button>
          </motion.div>
        )}

        {filteredIdeas.map((idea) => (
          <motion.div
            key={idea.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 transition-colors ${
              idea.status === 'promoted' || idea.status === 'archived' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-stone-900 truncate">{idea.title}</h3>
                  <Badge variant="outline" className={statusColors[idea.status]}>
                    {formatLabel(idea.status)}
                  </Badge>
                </div>
                <p className="text-sm text-stone-600 line-clamp-2 mb-3">{idea.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">{formatLabel(idea.topic)}</Badge>
                  <Badge variant="outline" className="text-xs">{formatLabel(idea.format)}</Badge>
                  <Badge variant="outline" className="text-xs border">{formatLabel(idea.priority)}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {idea.status !== 'promoted' && idea.status !== 'archived' && (
                  <Button
                    size="sm"
                    onClick={() => setPromoteIdea(idea)}
                    className="bg-stone-900 hover:bg-stone-800 flex items-center"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" /> Promote
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingIdea(idea); setShowIdeaModal(true); }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(idea.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Modals */}
      {showIdeaModal && (
        <IdeaModal
          idea={editingIdea ?? undefined}
          onClose={() => { setShowIdeaModal(false); setEditingIdea(null); }}
          onSave={handleIdeaSaved} // closes modal and reloads ideas
        />
      )}

      {promoteIdea && (
        <ScriptModal
          idea={promoteIdea}
          onClose={() => setPromoteIdea(null)}
          onSave={handlePromoteComplete} // refreshes after promotion
        />
      )}
    </div>
  )
}
