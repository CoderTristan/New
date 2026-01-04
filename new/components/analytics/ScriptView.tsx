'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  ChevronLeft, FileText, Eye, Clock, DollarSign,
  TrendingUp, TrendingDown, Tag, Film, Zap, CheckCircle, MessageSquare, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getScriptById, getIdeaById, getUserSettings, getReviewByScriptId } from '@/lib/db/dbCalls';

export default function ScriptSummary({scriptId}: {scriptId: string}) {
  const router = useRouter();
  const [script, setScript] = useState(null);
  const [idea, setIdea] = useState(null);
  const [review, setReview] = useState(null);
  const [userSettings, setUserSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all data
  useEffect(() => {
    if (!scriptId) return;

    async function loadData() {
      setLoading(true);
      try {
        const scriptData = await getScriptById(scriptId);
        setScript(scriptData);

        if (scriptData?.idea_id) {
          const ideaData = await getIdeaById(scriptData.idea_id);
          setIdea(ideaData);
        }

        const reviewData = await getReviewByScriptId(scriptId);
        setReview(reviewData);

        const settings = await getUserSettings();
        setUserSettings(settings || {});
    } catch (err) {
        console.error('Failed to load data', err);
    } finally {
        setLoading(false);
    }
}

loadData();
}, [scriptId]);


  const formatLabel = (str) =>
    str?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">Script not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/dashboard/analytics`)}
          >
            Back to Analytics
          </Button>
        </div>
      </div>
    );
  }

  const wordCount = (script.script_content || '').split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = wordCount / (script.words_per_minute || 150);
  const actionCues = ((script.script_content || '').match(/\[ACTION:.*?\]/g) || []).length;
const formatPublishedDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return null;
  }
};

console.log(script);
console.log(review);
console.log(idea);
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-900">{script.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-stone-100 text-stone-700">{script.stage}</Badge>
      {script.published_date && (
        <span className="text-sm text-stone-500">
          Published {formatPublishedDate(script.published_date) || 'Date not available'}
        </span>
      )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/scripts/${scriptId}`)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Script
          </Button>
        </div>

        {/* Classification */}
        <motion.div
          className="bg-white rounded-xl border border-stone-200 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Classification
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Topic</span>
              <p className="font-medium text-stone-900 mt-1">{formatLabel(script.topic)}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Format</span>
              <p className="font-medium text-stone-900 mt-1">{formatLabel(script.format)}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Hook Type</span>
              <p className="font-medium text-stone-900 mt-1">{formatLabel(script.hook_type)}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Target Length</span>
              <p className="font-medium text-stone-900 mt-1">{script.target_length_minutes} min</p>
            </div>
          </div>
        </motion.div>

        {/* Script Stats */}
        <motion.div
          className="bg-white rounded-xl border border-stone-200 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Film className="w-4 h-4" />
            Script Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Word Count</span>
              <p className="font-medium text-stone-900 mt-1">{wordCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Est. Duration</span>
              <p className="font-medium text-stone-900 mt-1">{estimatedMinutes.toFixed(1)} min</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Action Cues</span>
              <p className="font-medium text-stone-900 mt-1">{actionCues}</p>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Checklist</span>
              <div className="flex gap-1 mt-1">
                <div className={`w-3 h-3 rounded-full ${script.checklist_intro ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                <div className={`w-3 h-3 rounded-full ${script.checklist_body ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                <div className={`w-3 h-3 rounded-full ${script.checklist_cta ? 'bg-emerald-500' : 'bg-stone-300'}`} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance */}
        {review && (
          <motion.div
            className="bg-white rounded-xl border border-stone-200 p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              {review.is_above_average ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              Performance
              {review.is_above_average && (
                <Badge className="bg-emerald-100 text-emerald-700 ml-2">Above Average</Badge>
              )}
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <Eye className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-stone-900">{review.views?.toLocaleString()}</div>
                <div className="text-xs text-stone-500">Views</div>
                {userSettings.channel_baseline_views && (
                  <div className={`text-xs mt-1 ${
                    review.views > userSettings.channel_baseline_views ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {review.views > userSettings.channel_baseline_views ? '+' : ''}
                    {Math.round(((review.views - userSettings.channel_baseline_views) / userSettings.channel_baseline_views) * 100)}% vs avg
                  </div>
                )}
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <Clock className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-stone-900">{review.retention_percentage}%</div>
                <div className="text-xs text-stone-500">Retention</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-stone-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-stone-900">${(review.revenue || 0).toFixed(2)}</div>
                <div className="text-xs text-stone-500">Revenue</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reflection Notes */}
        {review && (
          <motion.div
            className="bg-white rounded-xl border border-stone-200 p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reflection Notes
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h3 className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  What Worked
                </h3>
                <p className="text-sm text-emerald-900">{review.what_worked}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  What Didn't Work
                </h3>
                <p className="text-sm text-red-900">{review.what_didnt_work}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Changes for Next Time
                </h3>
                <p className="text-sm text-blue-900">{review.changes_for_next_time}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Original Idea */}
        {idea && (
          <motion.div
            className="bg-white rounded-xl border border-stone-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-violet-500" />
              Original Idea
            </h2>
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
              <h3 className="font-medium text-violet-900">{idea.title}</h3>
              <p className="text-sm text-violet-800 mt-2">{idea.description}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
