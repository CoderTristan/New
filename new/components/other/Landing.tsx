'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import {
  Play,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  FileText,
  BarChart3,
  Kanban,
  Calendar,
  Search,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  const problems = [
    'Ideas scattered across notes apps, DMs, and your head',
    'Scripts rushed without structure or review',
    'No reflection loop after publishing',
    'Every video feels like starting from zero',
  ];

  const features = [
    { icon: Lightbulb, title: 'Idea Inbox', desc: 'Capture with enforced clarity. No unstructured notes.' },
    { icon: Kanban, title: 'Pipeline Board', desc: 'Fixed stages from Idea to Published. No customization noise.' },
    { icon: FileText, title: 'Script Workspace', desc: 'Structured sections, version history, deliverability scoring.' },
    { icon: Calendar, title: 'Schedule', desc: 'Internal calendar. Manual control. No sync complexity.' },
    { icon: BarChart3, title: 'Performance', desc: 'Manual metrics entry. Link results back to your process.' },
    { icon: Search, title: 'Global Search', desc: 'Find anything across ideas, scripts, and performance data.' },
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        'Pipeline access', 'Idea inbox', 'Script workspace', 'Global search'
      ],
      cta: "Start Free",
      highlighted: false
    },
    {
      name: "Creator",
      price: "$12",
      period: "per month",
      features: [
        'All Free tier features', 'Deliverability scoring', 'Pattern analytics', 'Script comparison', 'Teleprompter', 'Script review', 'Manual Scheduling'
      ],
      cta: "Start Creating",
      highlighted: true
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      features: [
        'All Creator tier features', 'Draft limits', 'Friction controls'
      ],
      cta: "Go Pro",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold tracking-tight text-zinc-900">
              Content Scripted
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#features" className="text-zinc-700 hover:text-zinc-900">Features</a>
            <a href="#pricing" className="text-zinc-700 hover:text-zinc-900">Pricing</a>

            {isSignedIn ? (
              <Link href="/dashboard/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button variant="outline">Sign Up</Button>
                </Link>
                <Link href="/sign-in">
                  <Button>Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <motion.div className="max-w-4xl mx-auto text-center" initial="initial" animate="animate" variants={stagger}>
          <motion.span variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            Pre-production for solo creators
          </motion.span>

          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold mb-6">
            Where every video<br /><span className="text-zinc-400">starts.</span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-xl text-zinc-500 mb-10">
            One rigid system. No customization. No decision fatigue.
          </motion.p>

          <motion.div variants={fadeIn} className="flex justify-center gap-4">
            <Link href={isSignedIn ? "/dashboard/dashboard" : "/sign-up"}>
              <Button size="lg" className="bg-zinc-900 text-white px-8 flex items-center gap-2">
                Start Your Pipeline
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Your creative process is fractured.
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {problems.map((p, i) => (
              <div key={i} className="p-5 bg-white border rounded-xl flex gap-4">
                <div className="w-8 h-8 bg-red-50 text-red-500 flex items-center justify-center rounded-full">{i + 1}</div>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">One rigid pipeline.</h2>
          <div className="flex items-center justify-between bg-zinc-50 p-8 rounded-2xl overflow-x-auto">
            {['Idea', 'Draft', 'Editing', 'Ready', 'Published'].map((stage, i) => (
              <div key={stage} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i === 4 ? 'bg-emerald-500' : 'bg-zinc-900'}`}>
                    <span className="text-white font-semibold">{i + 1}</span>
                  </div>
                  <span className="text-sm mt-2">{stage}</span>
                </div>
                {i < 4 && <ArrowRight className="mx-4 text-zinc-300" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-zinc-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-zinc-800/50 rounded-2xl">
              <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-zinc-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, i) => (
            <div key={i} className={`p-6 rounded-2xl border-2 ${tier.highlighted ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'}`}>
              {tier.highlighted && (
                <span className="inline-block mb-4 px-3 py-1 bg-zinc-900 text-white text-xs rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 my-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-zinc-500">{tier.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${tier.highlighted ? 'bg-zinc-900 text-white' : 'border border-zinc-300'}`}>
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
