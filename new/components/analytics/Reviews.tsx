'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, Check, FileText, TrendingUp, TrendingDown,
  Eye, Clock, DollarSign, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserSettings, getUserReviews, createReview, updateScript, updateUserSettings, getUserScripts } from '@/lib/db/dbCalls';

interface ReviewModalProps {
  scriptId: string;
  onClose: () => void;
}

export default function ReviewModal({ scriptId, onClose }: ReviewModalProps) {
  const [formData, setFormData] = useState({
    views: '',
    retention_percentage: '',
    revenue: '',
    what_worked: '',
    what_didnt_work: '',
    changes_for_next_time: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userSettings, setUserSettings] = useState<any>(null);
  const [script, setScript] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ----------------------------
  // Load initial data
  // ----------------------------
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [settingsData, reviewsData] = await Promise.all([
          getUserSettings(),
          getUserReviews(),
        ]);
        const user = settingsData?.[0] || null;
        setUserSettings(user);
        setReviews(reviewsData || []);

        // Fetch the specific script from user scripts
        const scriptsData = await getUserScripts();
        const scriptData = scriptsData.find((s: any) => s.id === scriptId);
        setScript(scriptData || null);
      } catch (e) {
        console.error('Failed to load review data', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [scriptId]);

  const avgViews = reviews.length ? reviews.reduce((sum, r) => sum + (r.views || 0), 0) / reviews.length : 0;
  const avgRetention = reviews.length ? reviews.reduce((sum, r) => sum + (r.retention_percentage || 0), 0) / reviews.length : 0;

  const validate = () => {
    const newErrors: any = {};
    if (!formData.views || isNaN(parseFloat(formData.views))) newErrors.views = 'Valid view count required';
    if (!formData.retention_percentage || isNaN(parseFloat(formData.retention_percentage))) newErrors.retention_percentage = 'Valid retention percentage required';
    if (!formData.what_worked.trim()) newErrors.what_worked = 'Required - what worked well?';
    if (!formData.what_didnt_work.trim()) newErrors.what_didnt_work = 'Required - what didn\'t work?';
    if (!formData.changes_for_next_time.trim()) newErrors.changes_for_next_time = 'Required - what will you change?';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const isAboveAverage = reviews.length === 0 ||
        parseFloat(formData.views) > avgViews ||
        parseFloat(formData.retention_percentage) > avgRetention;

      await createReview({
        ...formData,
        script_id: scriptId,
        views: parseFloat(formData.views),
        retention_percentage: parseFloat(formData.retention_percentage),
        revenue: parseFloat(formData.revenue) || 0,
        is_above_average: isAboveAverage,
      });
      await updateScript(scriptId, {
        published_date: new Date(), // pass a Date object
      });

      if (userSettings) {
        const newBaselineViews = reviews.length
          ? (avgViews * reviews.length + parseFloat(formData.views)) / (reviews.length + 1)
          : parseFloat(formData.views);

        const newBaselineRetention = reviews.length
          ? (avgRetention * reviews.length + parseFloat(formData.retention_percentage)) / (reviews.length + 1)
          : parseFloat(formData.retention_percentage);

        await updateUserSettings({
          has_pending_review: false,
          pending_review_script_id: null,
          channel_baseline_views: newBaselineViews,
          channel_baseline_retention: newBaselineRetention,
        });
      }

      onClose(); // Close the modal after submission
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLabel = (str: string) => str?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

  // ----------------------------
  // Loading state
  // ----------------------------
  if (isLoading) {
    return (
      <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // ----------------------------
  // No pending script
  // ----------------------------
  if (!script) {
    return (
      <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-md p-6 text-center">
          <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">All caught up!</h2>
          <p className="text-stone-500 mb-6">No pending reviews</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-stone-50 rounded-xl w-full max-w-2xl p-6 relative
                  max-h-[90vh] overflow-y-auto">
    <button 
      className="absolute top-4 right-4 text-gray-500" 
      onClick={onClose}
    >
      X
    </button>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Post-Publish Review</h1>
          <p className="text-stone-500 mt-1">Complete this review to continue using your pipeline.</p>
        </div>

        {/* Script Info */}
        <motion.div 
          className="bg-white rounded-xl border border-stone-200 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-stone-100 rounded-lg">
              <FileText className="w-6 h-6 text-stone-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-stone-900">{script.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{formatLabel(script.topic)}</Badge>
                <Badge variant="outline">{formatLabel(script.format)}</Badge>
                <Badge variant="outline">{formatLabel(script.hook_type)}</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Channel Baselines */}
        {reviews.length > 0 && (
          <div className="bg-stone-100 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-stone-700 mb-3">Channel Baselines</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-stone-500" />
                <span className="text-sm text-stone-600">Avg Views: <strong>{Math.round(avgViews).toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-500" />
                <span className="text-sm text-stone-600">Avg Retention: <strong>{avgRetention.toFixed(1)}%</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        <motion.form 
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-stone-200 p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-stone-900">Performance Metrics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="views" className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Views *</Label>
              <Input
                id="views"
                type="number"
                min="0"
                value={formData.views}
                onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                className={`mt-1 ${errors.views ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.views && <p className="text-xs text-red-500 mt-1">{errors.views}</p>}
            </div>
            <div>
              <Label htmlFor="retention" className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Retention % *</Label>
              <Input
                id="retention"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.retention_percentage}
                onChange={(e) => setFormData({ ...formData, retention_percentage: e.target.value })}
                className={`mt-1 ${errors.retention_percentage ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.retention_percentage && <p className="text-xs text-red-500 mt-1">{errors.retention_percentage}</p>}
            </div>
            <div>
              <Label htmlFor="revenue" className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Revenue</Label>
              <Input
                id="revenue"
                type="number"
                min="0"
                step="0.01"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                className="mt-1"
                placeholder="0.00"
              />
            </div>
          </div>

          <hr className="border-stone-200" />

          <h3 className="font-semibold text-stone-900">Qualitative Reflection</h3>

          <div>
            <Label htmlFor="what_worked" className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> What worked well? *</Label>
            <Textarea
              id="what_worked"
              value={formData.what_worked}
              onChange={(e) => setFormData({ ...formData, what_worked: e.target.value })}
              className={`mt-1 ${errors.what_worked ? 'border-red-500' : ''}`}
              placeholder="What aspects of this video performed as expected or exceeded expectations?"
              rows={3}
            />
            {errors.what_worked && <p className="text-xs text-red-500 mt-1">{errors.what_worked}</p>}
          </div>

          <div>
            <Label htmlFor="what_didnt_work" className="flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-red-600" /> What didn't work? *</Label>
            <Textarea
              id="what_didnt_work"
              value={formData.what_didnt_work}
              onChange={(e) => setFormData({ ...formData, what_didnt_work: e.target.value })}
              className={`mt-1 ${errors.what_didnt_work ? 'border-red-500' : ''}`}
              placeholder="What aspects underperformed or didn't resonate with your audience?"
              rows={3}
            />
            {errors.what_didnt_work && <p className="text-xs text-red-500 mt-1">{errors.what_didnt_work}</p>}
          </div>

          <div>
            <Label htmlFor="changes" className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-blue-600" /> What will you change next time? *</Label>
            <Textarea
              id="changes"
              value={formData.changes_for_next_time}
              onChange={(e) => setFormData({ ...formData, changes_for_next_time: e.target.value })}
              className={`mt-1 ${errors.changes_for_next_time ? 'border-red-500' : ''}`}
              placeholder="Specific, actionable improvements for future videos"
              rows={3}
            />
            {errors.changes_for_next_time && <p className="text-xs text-red-500 mt-1">{errors.changes_for_next_time}</p>}
          </div>

          <Button 
            type="submit"
            className="w-full bg-stone-900 hover:bg-stone-800 h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Complete Review & Unlock Pipeline'}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
