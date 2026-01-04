'use client';

import { useRouter } from 'next/navigation';
import { differenceInDays, isValid, parseISO } from 'date-fns';
import { Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

type Script = {
  id: string;
  title: string;
  stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published';
  topic?: string;
  format?: string;
  last_edited?: string | number;
  updated_date?: string | number;
  scheduled_date?: string | number;
  checklist_intro?: boolean;
  checklist_body?: boolean;
  checklist_cta?: boolean;
};

type ScriptCardProps = {
  script: Script;
  isDragging?: boolean;
};

export default function ScriptCard({ script, isDragging = false }: ScriptCardProps) {
  const router = useRouter();

  // ------------------------
  // Determine last edit date safely
  // ------------------------
  const lastEditRaw = script.last_edited ?? script.updated_date;
  let lastEditDate: Date | null = null;

  if (typeof lastEditRaw === 'string') {
    lastEditDate = parseISO(lastEditRaw.replace(' ', 'T'));
  } else if (typeof lastEditRaw === 'number') {
    lastEditDate = new Date(lastEditRaw);
  }

  const daysSinceEdit = lastEditDate && isValid(lastEditDate)
    ? differenceInDays(new Date(), lastEditDate)
    : 0;

  const isStalled = daysSinceEdit > 7 && script.stage !== 'published';
  const checklistComplete = script.checklist_intro && script.checklist_body && script.checklist_cta;

  const formatLabel = (str?: string) =>
    str?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '';

  // ------------------------
  // Determine scheduled date safely
  // ------------------------
  let scheduledDate: Date | null = null;
  if (typeof script.scheduled_date === 'string') {
    scheduledDate = parseISO(script.scheduled_date.replace(' ', 'T'));
  } else if (typeof script.scheduled_date === 'number') {
    scheduledDate = new Date(script.scheduled_date);
  }

  // ------------------------
  // Click handler: navigate to script page
  // ------------------------
  const handleClick = () => {
    router.push(`/dashboard/${script.id}/workspace`);
  };

  return (
    <motion.div
      layout
      onClick={handleClick}
      className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
        isDragging
          ? 'border-stone-400 shadow-lg'
          : isStalled
          ? 'border-amber-300 bg-amber-50/50'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
      }`}
    >
      {/* Title + stalled indicator */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-stone-900 text-sm line-clamp-2">{script.title}</h4>
        {isStalled && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
      </div>

      {/* Topic & format badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {script.topic && <Badge variant="outline" className="text-xs py-0">{formatLabel(script.topic)}</Badge>}
        {script.format && <Badge variant="outline" className="text-xs py-0">{formatLabel(script.format)}</Badge>}
      </div>

      {/* Footer: schedule / days since edit + checklist */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1">
          {scheduledDate ? (
            <>
              <Calendar className="w-3 h-3" />
              <span>{scheduledDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>{daysSinceEdit}d ago</span>
            </>
          )}
        </div>

        {script.stage !== 'idea' && (
          <div className="flex items-center gap-1">
            {checklistComplete ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <div className="flex gap-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${script.checklist_intro ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${script.checklist_body ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${script.checklist_cta ? 'bg-emerald-500' : 'bg-stone-300'}`} />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
