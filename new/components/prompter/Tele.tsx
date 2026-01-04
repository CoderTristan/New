'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Settings, X, 
  ChevronUp, ChevronDown, Maximize2, Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';

export default function Teleprompter({ scriptReal, scriptId }: { scriptReal: string, scriptId: string }) {
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [fontSize, setFontSize] = useState(32);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load script
  useEffect(() => {
    setLoading(true);
    setScript(scriptReal);
    setLoading(false);
  }, [scriptReal]);

  console.log(script);

  // Auto-scroll
  useEffect(() => {
    if (!isPlaying || !contentRef.current) return;

    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const maxScroll = contentRef.current!.scrollHeight - contentRef.current!.clientHeight;
        const newPos = prev + scrollSpeed / 100;
        if (newPos >= maxScroll) {
          setIsPlaying(false);
          return maxScroll;
        }
        return newPos;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, scrollSpeed]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  const handleReset = () => {
    setScrollPosition(0);
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const prepareContent = () => {
    if (!script) return '';
    const hook = script.hook_content || '';
    const main = script.script_content || '';
    const combined = hook + '\n\n' + main;
    return combined.replace(/\[ACTION:.*?\]/g, '').trim();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      setIsPlaying(!isPlaying);
    } else if (e.key === 'ArrowUp') {
      setScrollSpeed(prev => Math.min(100, prev + 10));
    } else if (e.key === 'ArrowDown') {
      setScrollSpeed(prev => Math.max(10, prev - 10));
    } else if (e.key === 'Escape') {
      router.push(`/dashboard/${scriptId}/workspace`);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, scrollSpeed]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-black text-white rounded-lg">
        <Skeleton className="h-32 w-96 bg-stone-800" />
      </div>
    );
  }

  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black text-white rounded-lg">
        <p className="mb-4 text-white">Script not found</p>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/dashboard/${scriptId}/workspace`)}
          className="border-white text-white hover:bg-white/10"
        >
          Back to Script
        </Button>
      </div>
    );
  }

  const scriptContent = prepareContent();

  return (
    <div 
      ref={containerRef}
      className="relative bg-black text-white overflow-hidden rounded-lg p-4 min-h-screen"
    >
      {/* Top Control Bar */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-50 bg-black/80 p-2 rounded-b-lg flex justify-between items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/${scriptId}/workspace`)}
          className="text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>

        <h1 className="text-sm font-medium text-white/80">{script.title}</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          className="absolute top-12 right-2 z-50 bg-stone-900 text-white rounded-xl p-4 w-64 border border-stone-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/70 mb-2 block">Scroll Speed</label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[scrollSpeed]}
                  onValueChange={([value]) => setScrollSpeed(value)}
                  min={10}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm w-8 text-right">{scrollSpeed}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/70 mb-2 block">Font Size</label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]) => setFontSize(value)}
                  min={20}
                  max={60}
                  step={2}
                  className="flex-1"
                />
                <span className="text-sm w-8 text-right">{fontSize}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Script Content */}
      <div 
        ref={contentRef}
        className="overflow-y-auto px-4 py-16 max-h-[600px]"
        style={{ scrollBehavior: 'auto' }}
      >
        <div 
          className="max-w-3xl mx-auto whitespace-pre-wrap leading-relaxed text-white"
          style={{ fontSize: `${fontSize}px` }}
        >
          {scriptContent}
        </div>
      </div>

      {/* Center Guide Line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="h-[2px] bg-white/30" />
      </div>

      {/* Bottom Control Bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-50 bg-black/80 p-2 rounded-t-lg flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-white hover:bg-white/10 h-10 w-10"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`h-12 w-12 rounded-full ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-white hover:bg-white/90'}`}
          >
            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-black ml-0.5" />}
          </Button>

          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setScrollSpeed(prev => Math.min(100, prev + 10))}
              className="text-white hover:bg-white/10 h-5 w-12"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setScrollSpeed(prev => Math.max(10, prev - 10))}
              className="text-white hover:bg-white/10 h-5 w-12"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-1">Space to play/pause • ↑↓ to adjust speed • Esc to exit</p>
      </motion.div>
    </div>
  );
}
