'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ✅ USE EXISTING SERVER FUNCTIONS
import { getUserScripts, updateScript } from '@/lib/db/dbCalls' // adjust path if needed

type Script = {
  id: string
  title: string
  stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published'
  scheduled_date: Date | null
}

export default function Calendar(subscription: any) {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const isFreeTier = !subscription

  // ----------------------
  // Fetch scripts
  // ----------------------
  useEffect(() => {
    async function load() {
      const data = await getUserScripts()
      setScripts(data)
      setLoading(false)
    }
    load()
  }, [])

  // ----------------------
  // Calendar math
  // ----------------------
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getScriptsForDay = (date: Date) =>
    scripts.filter(
      s => s.scheduled_date && isSameDay(new Date(s.scheduled_date), date)
    )

  const schedulableScripts = scripts.filter(
    s =>
      ['draft', 'editing', 'ready'].includes(s.stage) &&
      !s.scheduled_date
  )

  // ----------------------
  // Mutations
  // ----------------------
  async function saveSchedule() {
    if (!selectedScript) return

    await updateScript(selectedScript.id, {
      scheduled_date: selectedDate ? new Date(selectedDate) : null,
    })

    setScripts(prev =>
      prev.map(s =>
        s.id === selectedScript.id
          ? { ...s, scheduled_date: selectedDate ? new Date(selectedDate) : null }
          : s
      )
    )

    setSelectedScript(null)
  }

  async function removeSchedule() {
    if (!selectedScript) return

    await updateScript(selectedScript.id, {
      scheduled_date: null,
    })

    setScripts(prev =>
      prev.map(s =>
        s.id === selectedScript.id
          ? { ...s, scheduled_date: null }
          : s
      )
    )

    setSelectedScript(null)
  }

  // ----------------------
  // UI
  // ----------------------
  const stageColors: Record<string, string> = {
    idea: 'bg-violet-500',
    draft: 'bg-amber-500',
    editing: 'bg-blue-500',
    ready: 'bg-emerald-500',
    published: 'bg-stone-500',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 px-8 py-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Publish Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft />
            </Button>
            <h2 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-xs text-center text-stone-500">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dayScripts = getScriptsForDay(day)
              return (
                <motion.div key={i} className="min-h-[100px] border rounded-lg p-2">
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  {dayScripts.map(script => (
                    <button
                      key={script.id}
                      onClick={() => {
                        setSelectedScript(script)
                        setSelectedDate(
                          script.scheduled_date
                            ? format(new Date(script.scheduled_date), 'yyyy-MM-dd')
                            : ''
                        )
                      }}
                      className={`mt-1 w-full text-left text-xs px-2 py-1 rounded text-white ${stageColors[script.stage]}`}
                    >
                      {script.title}
                    </button>
                  ))}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Unscheduled */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-4 flex gap-2 items-center">
            <CalendarIcon className="w-4 h-4" />
            Unscheduled
          </h3>
          {schedulableScripts.map(script => (
            <button
              key={script.id}
              onClick={() => {
                setSelectedScript(script)
                setSelectedDate('')
              }}
              className="w-full text-left p-3 border rounded-lg mb-2"
            >
              <div className="font-medium truncate">{script.title}</div>
              <Badge className={`${stageColors[script.stage]} text-white mt-1`}>
                {script.stage}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedScript} onOpenChange={() => setSelectedScript(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Publish Date</DialogTitle>
          </DialogHeader>

          <Label className="mt-4">Publish Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />

          <div className="flex gap-3 mt-6">
            {selectedScript?.scheduled_date && (
              <Button variant="outline" onClick={removeSchedule}>
                Remove
              </Button>
            )}
            <Button className="flex-1" onClick={saveSchedule}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
