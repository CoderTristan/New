'use client';
import { useEffect, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { TrendingUp, Eye, Clock, DollarSign, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import ReviewModal from './Reviews';
import { getUserScripts, getUserReviews, getUserSettings } from '@/lib/db/dbCalls';
import { useRouter } from 'next/navigation';

export default function Analytics(subscription: any) {
  const router = useRouter();
  const [scripts, setScripts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userSettings, setUserSettings] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [filterTopic, setFilterTopic] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const isFreeTier = !subscription

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [scriptsData, reviewsData, settingsData] = await Promise.all([
          getUserScripts(),
          getUserReviews(),
          getUserSettings()
        ]);

        setScripts(scriptsData);
        setReviews(reviewsData);
        setUserSettings(settingsData?.[0]);
        console.log('Loaded reviews:', reviewsData); // helps debug empty array
      } catch (e) {
        console.error('Failed to load analytics data', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const publishedScripts = scripts.filter(s => s.stage === 'published');

  // Only show modal if there isn't already a review
  const handleOpenReviewModal = (scriptId: string) => {
    const existingReview = reviews.find(r => r.script_id === scriptId);
    if (!existingReview) {
      setActiveScriptId(scriptId);
      setShowReviewModal(true);
    }
  };

  // Scripts with reviews for charts & stats
  const scriptsWithReviews = publishedScripts
    .map(s => ({ ...s, review: reviews.find(r => r.script_id === s.id) }))
    .filter(s => s.review);

  const filteredData = scriptsWithReviews.filter(s =>
    (filterTopic === 'all' || s.topic === filterTopic) &&
    (filterFormat === 'all' || s.format === filterFormat)
  );

  const viewsOverTime = filteredData
  .sort((a, b) => {
    const dateA = a.published_date || a.created_date;
    const dateB = b.published_date || b.created_date;
    return new Date(dateA || 0).getTime() - new Date(dateB || 0).getTime();
  })
  .map(s => {
    let dateString = s.published_date || s.created_date;

    // Ensure it's a string for parseISO
    if (dateString instanceof Date) {
      dateString = dateString.toISOString();
    }

    let dateObj;
    try {
      dateObj = dateString ? parseISO(dateString) : null;
    } catch {
      dateObj = null;
    }

    return {
      date: dateObj && isValid(dateObj) ? format(dateObj, 'MMM d') : 'Unknown',
      views: s.review?.views || 0,
      title: s.title
    };
  });


  const avgViews = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.views || 0), 0) / reviews.length : 0;
  const avgRetention = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.retention_percentage || 0), 0) / reviews.length : 0;
  const totalRevenue = reviews.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const aboveAverageCount = reviews.filter(r => r.is_above_average).length;

  const performanceByTopic = Object.entries(
    filteredData.reduce((acc, s) => {
      if (!acc[s.topic]) acc[s.topic] = { views: 0, count: 0 };
      acc[s.topic].views += s.review?.views || 0;
      acc[s.topic].count++;
      return acc;
    }, {})
  ).map(([topic, data]) => ({
    topic,
    avgViews: Math.round(data.views / data.count)
  }));

  const performanceByHook = Object.entries(
    filteredData.reduce((acc, s) => {
      if (!acc[s.hook_type]) acc[s.hook_type] = { views: 0, count: 0 };
      acc[s.hook_type].views += s.review?.views || 0;
      acc[s.hook_type].count++;
      return acc;
    }, {})
  ).map(([hook, data]) => ({
    hook,
    avgViews: Math.round(data.views / data.count)
  }));

  const topPerformers = [...filteredData]
    .sort((a, b) => (b.review?.views || 0) - (a.review?.views || 0))
    .slice(0, 5);

  const uniqueTopics = [...new Set(scripts.map(s => s.topic).filter(Boolean))];
  const uniqueFormats = [...new Set(scripts.map(s => s.format).filter(Boolean))];

  const formatLabel = (str) => str?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-8 py-8 max-w-6xl mx-auto">
      {/* Header & Filters */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Analytics</h1>
          <p className="text-stone-500 mt-1">Performance linked to decisions</p>
        </div>
        <div className="flex gap-3">
          <Select value={filterTopic} onValueChange={setFilterTopic}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Topic" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {uniqueTopics.map(t => <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterFormat} onValueChange={setFilterFormat}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Format" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {uniqueFormats.map(f => <SelectItem key={f} value={f}>{formatLabel(f)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div className="bg-white rounded-xl border p-5" initial={{ opacity: 0, y:20 }} animate={{ opacity:1, y:0 }}>
          <div className="flex items-center gap-2 text-stone-500 mb-2"><Eye className="w-4 h-4" /><span className="text-sm">Avg Views</span></div>
          <div className="text-2xl font-bold text-stone-900">{Math.round(avgViews)}</div>
        </motion.div>
        <motion.div className="bg-white rounded-xl border p-5" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <div className="flex items-center gap-2 text-stone-500 mb-2"><Clock className="w-4 h-4" /><span className="text-sm">Avg Retention</span></div>
          <div className="text-2xl font-bold text-stone-900">{avgRetention.toFixed(1)}%</div>
        </motion.div>
        <motion.div className="bg-white rounded-xl border p-5" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <div className="flex items-center gap-2 text-stone-500 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-sm">Above Avg</span></div>
          <div className="text-2xl font-bold text-emerald-600">{aboveAverageCount} / {reviews.length}</div>
        </motion.div>
        <motion.div className="bg-white rounded-xl border p-5" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <div className="flex items-center gap-2 text-stone-500 mb-2"><DollarSign className="w-4 h-4" /><span className="text-sm">Total Revenue</span></div>
          <div className="text-2xl font-bold text-stone-900">${totalRevenue.toFixed(2)}</div>
        </motion.div>
      </div>

      {/* Tabs / Charts / Top Performers */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Lock className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 mb-2">No data yet</h3>
          <p className="text-stone-500">Complete post-publish reviews to build your analytics</p>
        </div>
      ) : (
        <Tabs defaultValue="views" className="space-y-6">
          <TabsList>
            <TabsTrigger value="views">Views Over Time</TabsTrigger>
            <TabsTrigger value="topics">By Topic</TabsTrigger>
            <TabsTrigger value="hooks">By Hook Type</TabsTrigger>
            <TabsTrigger value="top">Top Performers</TabsTrigger>
          </TabsList>

          {/* Views Over Time */}
          <TabsContent value="views">
            <div className="bg-white rounded-xl border p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={12} />
                  <YAxis stroke="#737373" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #e5e5e5', borderRadius:'8px' }} />
                  <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} dot={{ fill:'#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* By Topic */}
          <TabsContent value="topics">
            <div className="bg-white rounded-xl border p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByTopic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="topic" stroke="#737373" fontSize={12} />
                  <YAxis stroke="#737373" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #e5e5e5', borderRadius:'8px' }} />
                  <Bar dataKey="avgViews" fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* By Hook Type */}
          <TabsContent value="hooks">
            <div className="bg-white rounded-xl border p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByHook} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" stroke="#737373" fontSize={12} />
                  <YAxis dataKey="hook" type="category" stroke="#737373" fontSize={12} width={120} />
                  <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #e5e5e5', borderRadius:'8px' }} />
                  <Bar dataKey="avgViews" fill="#f59e0b" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Top Performers */}
          <TabsContent value="top">
            <div className="space-y-4">
              {topPerformers.map(s => (
                <motion.div key={s.id} className="bg-white border rounded-xl p-5 flex justify-between items-center" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} onClick={() => router.push(`/dashboard/${s.id}/script-summary`)}>
                  <div>
                    <h3 className="font-semibold text-stone-900">{s.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{formatLabel(s.topic)}</Badge>
                      <Badge variant="outline" className="text-xs">{formatLabel(s.hook_type)}</Badge>
                    </div>
                    <p className="text-sm text-stone-500">{s.review?.views} views • {s.review?.retention_percentage}% retention</p>
                  </div>
                  {s.review?.is_above_average && <TrendingUp className="w-6 h-6 text-emerald-500" />}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Published Scripts Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Published Scripts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publishedScripts.map(s => (
            <motion.div
              key={s.id}
              className="bg-white border rounded-xl p-4 flex justify-between items-center hover:shadow-lg cursor-pointer"
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              onClick={() => handleOpenReviewModal(s.id)}
            >
              <div>
                <h3 className="font-semibold text-stone-900">{s.title}</h3>
                <p className="text-sm text-stone-500">{formatLabel(s.topic)} • {formatLabel(s.format)}</p>
              </div>
              <div className="text-stone-500">{s.stage}</div>
            </motion.div>
          ))}
        </div>
      </div>
{isFreeTier && (
        <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center gap-4 rounded-xl">
          <Lock className="w-16 h-16 text-stone-300" />
          <h2 className="text-2xl font-semibold text-stone-900">Analytics Locked</h2>
          <p className="text-stone-500 text-center max-w-sm">
            Upgrade to Creator to access full analytics and insights for your scripts.
          </p>
          <button
            className="px-6 py-2 border rounded-lg text-white border-stone-900 hover:bg-stone-100"
            onClick={() => router.push('/dashboard/billing')}
          >
            Upgrade to Creator
          </button>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && activeScriptId && <ReviewModal scriptId={activeScriptId} onClose={() => setShowReviewModal(false)} />}
    </div>
  );
}
