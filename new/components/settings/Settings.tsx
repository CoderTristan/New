'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Gauge, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { saveSettings, getUserSettings } from '@/lib/db/dbCalls'

interface SettingsPageProps {
  subscription?: any
}

export default function SettingsPage({ subscription }: SettingsPageProps) {
  const router = useRouter()
  const [settings, setSettings] = useState({
    default_words_per_minute: 150,
    max_concurrent_drafts: 5,
    require_schedule_before_draft: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  console.log('subscription' + subscription)
  console.log('subscriptionname' + subscription.plan_name)

  const isPro = subscription?.plan_name === 'Pro'

  // Load settings from DB on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await getUserSettings()
        if (saved) {
          setSettings({
            default_words_per_minute: saved.default_words_per_minute ?? 150,
            max_concurrent_drafts: saved.max_concurrent_drafts ?? 5,
            require_schedule_before_draft: saved.require_schedule_before_draft ?? false,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPro) return
    setSaving(true)
    try {
      await saveSettings(settings)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-stone-50">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-8 py-10 pointer-events-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-stone-500 mt-1">
            Configure how the pipeline enforces your process
          </p>
        </div>

        {/* Script Defaults */}
        <motion.section
          className="bg-white border border-stone-200 rounded-xl p-6 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Script Defaults
          </h2>

          <div>
            <Label htmlFor="wpm">Speaking Pace (Words Per Minute)</Label>
            <Input
              id="wpm"
              type="number"
              min={100}
              max={220}
              value={settings.default_words_per_minute}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  default_words_per_minute: Number(e.target.value),
                })
              }
              className="w-32 mt-1"
              disabled={!isPro}
            />
            <p className="text-xs text-stone-500 mt-1">
              Used to estimate runtime during drafting
            </p>
          </div>
        </motion.section>

        {/* Pipeline Constraints */}
        <motion.section
          className="bg-white border border-stone-200 rounded-xl p-6 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Pipeline Constraints
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="maxDrafts">Maximum Concurrent Drafts</Label>
              <Input
                id="maxDrafts"
                type="number"
                min={1}
                max={20}
                value={settings.max_concurrent_drafts}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    max_concurrent_drafts: Number(e.target.value),
                  })
                }
                className="w-32 mt-1"
                disabled={!isPro}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label>Require Schedule Before Drafting</Label>
              </div>
              <Switch
                checked={settings.require_schedule_before_draft}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    require_schedule_before_draft: checked,
                  })
                }
                disabled={!isPro}
              />
            </div>
          </div>
        </motion.section>

        {/* Save */}
        <Button
          type="submit"
          className="w-full h-12 bg-stone-900 hover:bg-stone-800"
          disabled={!isPro || saving}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </form>

      {/* Pro Overlay */}
      {!isPro && (
        <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center gap-4 rounded-xl">
          <Lock className="w-16 h-16 text-stone-300" />
          <h2 className="text-2xl font-semibold text-stone-900">Pro Required</h2>
          <p className="text-stone-500 text-center max-w-sm">
            Upgrade to Pro to access full settings and customize your pipeline.
          </p>
          <Button
            className="px-6 py-2 border rounded-lg text-white border-stone-900 hover:bg-stone-500"
            onClick={() => router.push('/dashboard/billing')}
          >
            Upgrade to Pro
          </Button>
        </div>
      )}
    </div>
  )
}
