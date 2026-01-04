import { getUserScripts, getUserSettings } from '@/lib/db/dbCalls'
import DashboardClient from '@/components/dashboard-files/Dashboard'

export default async function DashboardPage() {
  const [scripts, userSettings] = await Promise.all([
    getUserScripts(),
    getUserSettings(),
  ])

  return (
    <DashboardClient
      scripts={scripts}
      userSettings={userSettings}
    />
  )
}
