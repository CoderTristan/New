'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Lightbulb,
  Kanban,
  Calendar,
  BarChart3,
  Search,
  Settings,
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/dashboard' },
  { name: 'Ideas', icon: Lightbulb, href: '/dashboard/ideas' },
  { name: 'Pipeline', icon: Kanban, href: '/dashboard/pipeline' },
  { name: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
  { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { name: 'Search', icon: Search, href: '/dashboard/search' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  { name: 'Billing', icon: BarChart3, href: '/dashboard/billing' },

];

export function Aside() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-stone-200 fixed inset-y-0 left-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-stone-200">
        <Link href="/dashboard/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-stone-50 rounded-sm" />
          </div>
          <span className="font-semibold text-stone-900 tracking-tight">
            Content Scripted
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-stone-900' : 'text-stone-500'
                  }`}
                />
                <span className="font-medium text-sm">{item.name}</span>

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-stone-900"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <UserButton />
    </aside>
  );
}
