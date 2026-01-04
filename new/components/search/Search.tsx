'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search as SearchIcon, Lightbulb, FileText, BarChart3,
  Filter, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUserScripts, getUserReviews, getUserIdeas } from '@/lib/db/dbCalls';

const TOPICS = ['tutorial', 'review', 'commentary', 'vlog', 'educational', 'entertainment', 'news', 'behind-the-scenes', 'q-and-a', 'challenge'];
const FORMATS = ['long-form', 'short-form', 'series-episode', 'standalone', 'compilation', 'documentary'];
const HOOK_TYPES = ['question', 'bold-claim', 'story-tease', 'problem-solution', 'curiosity-gap', 'controversy', 'promise', 'demonstration'];
const STAGES = ['idea', 'draft', 'editing', 'ready', 'published'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');
  const [filterHook, setFilterHook] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [ideas, setIdeas] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Load all data
  // ----------------------------
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ideasData, scriptsData, reviewsData] = await Promise.all([
          getUserIdeas(),
          getUserScripts(),
          getUserReviews(),
        ]);
        setIdeas(ideasData || []);
        setScripts(scriptsData || []);
        setReviews(reviewsData || []);
      } catch (e) {
        console.error('Failed to load search data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeFilters = [filterTopic, filterFormat, filterHook, filterStage].filter(f => f !== 'all').length;
  const clearFilters = () => {
    setFilterTopic('all');
    setFilterFormat('all');
    setFilterHook('all');
    setFilterStage('all');
  };

  const searchResults = useMemo(() => {
    const results = [];
    const q = query.toLowerCase();

    // ----------------------------
    // Ideas
    // ----------------------------
    ideas.forEach(i => {
      if ((filterTopic !== 'all' && i.topic !== filterTopic) ||
          (filterFormat !== 'all' && i.format !== filterFormat) ||
          (filterHook !== 'all' && i.hook_type !== filterHook) ||
          (filterStage !== 'all' && filterStage !== 'idea')) return;

      if (!q || i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)) {
        results.push({
          type: 'idea',
          id: i.id,
          title: i.title,
          description: i.description,
          date: i.created_date,
          link: '/idea-inbox',
        });
      }
    });

    // ----------------------------
    // Scripts
    // ----------------------------
    scripts.forEach(s => {
      if ((filterTopic !== 'all' && s.topic !== filterTopic) ||
          (filterFormat !== 'all' && s.format !== filterFormat) ||
          (filterHook !== 'all' && s.hook_type !== filterHook) ||
          (filterStage !== 'all' && s.stage !== filterStage)) return;

      const content = [s.title, s.hook_content, s.outline_content, s.script_content, s.notes_content].filter(Boolean).join(' ').toLowerCase();
      if (!q || content.includes(q)) {
        const review = reviews.find(r => r.script_id === s.id);
        results.push({
          type: 'script',
          id: s.id,
          title: s.title,
          description: s.hook_content?.substring(0, 150),
          stage: s.stage,
          date: s.created_date,
          link: `/script-workspace?id=${s.id}`,
          summaryLink: `/script-summary?id=${s.id}`,
          views: review?.views,
        });
      }
    });

    // ----------------------------
    // Reviews
    // ----------------------------
    reviews.forEach(r => {
      const s = scripts.find(sc => sc.id === r.script_id);
      if (!s) return;
      if ((filterTopic !== 'all' && s.topic !== filterTopic) ||
          (filterFormat !== 'all' && s.format !== filterFormat) ||
          (filterHook !== 'all' && s.hook_type !== filterHook) ||
          (filterStage !== 'all' && filterStage !== 'published')) return;

      const content = [r.what_worked, r.what_didnt_work, r.changes_for_next_time].filter(Boolean).join(' ').toLowerCase();
      if (q && content.includes(q)) {
        results.push({
          type: 'review',
          id: r.id,
          title: `Review: ${s.title}`,
          description: r.what_worked?.substring(0, 150),
          date: r.created_date,
          link: `/script-summary?id=${s.id}`,
        });
      }
    });

    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [ideas, scripts, reviews, query, filterTopic, filterFormat, filterHook, filterStage]);

  const typeIcons = { idea: Lightbulb, script: FileText, review: BarChart3 };
  const typeColors = { idea: 'bg-violet-100 text-violet-700', script: 'bg-blue-100 text-blue-700', review: 'bg-emerald-100 text-emerald-700' };
  const stageColors = { idea: 'bg-violet-100 text-violet-700', draft: 'bg-amber-100 text-amber-700', editing: 'bg-blue-100 text-blue-700', ready: 'bg-emerald-100 text-emerald-700', published: 'bg-stone-100 text-stone-700' };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Search</h1>
        <p className="text-stone-500 mb-6">Find ideas, scripts, notes, and performance data</p>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input placeholder="Search everything..." value={query} onChange={e => setQuery(e.target.value)} className="pl-11 h-12 text-lg" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={activeFilters > 0 ? 'border-violet-300 bg-violet-50' : ''}>
              <Filter className="w-4 h-4 mr-2" /> Filters {activeFilters > 0 && <Badge className="ml-2 bg-violet-600">{activeFilters}</Badge>}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 border-t border-stone-200 pt-4 flex flex-wrap gap-3">
                <Select value={filterTopic} onValueChange={setFilterTopic}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Topic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {TOPICS.map(t => <SelectItem key={t} value={t}>{formatLabel(t)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterFormat} onValueChange={setFilterFormat}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
                    {FORMATS.map(f => <SelectItem key={f} value={f}>{formatLabel(f)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterHook} onValueChange={setFilterHook}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Hook Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hooks</SelectItem>
                    {HOOK_TYPES.map(h => <SelectItem key={h} value={h}>{formatLabel(h)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {STAGES.map(s => <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
                {activeFilters > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-4 h-4 mr-1" /> Clear</Button>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <p className="text-sm text-stone-500 mb-4">{loading ? 'Searching...' : `${searchResults.length} results`}</p>
        {loading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <SearchIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No results found</p>
            <p className="text-sm text-stone-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {searchResults.map(r => {
                const Icon = typeIcons[r.type];
                return (
                  <motion.div key={`${r.type}-${r.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Link href={r.summaryLink || r.link}>
                      <div className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 transition-colors cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${typeColors[r.type]}`}><Icon className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-stone-900 truncate">{r.title}</h3>
                              {r.stage && <Badge className={`text-xs ${stageColors[r.stage]}`}>{r.stage}</Badge>}
                            </div>
                            {r.description && <p className="text-sm text-stone-600 line-clamp-2 mb-2">{r.description}</p>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
