'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* Logo / Brand */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">ContentScripted</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Your AI workout dashboard. Track, plan, and optimize your workouts effortlessly.
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Legal</h3>
          <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/legal" className="hover:text-teal-600 transition-colors">Privacy</Link>
            <Link href="/legal" className="hover:text-teal-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 text-center">
        © {new Date().getFullYear()} ContentScripted. All rights reserved.
      </div>
    </footer>
  );
}
