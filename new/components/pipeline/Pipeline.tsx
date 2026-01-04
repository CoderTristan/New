'use client';

import { useEffect, useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PipelineColumn from './PipelineColumn';
import ScriptModal from '../dashboard-files/ScriptModal';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { getUserScripts, updateScriptStage } from '@/lib/db/dbCalls';
import { useRouter } from 'next/navigation';

type Script = {
  id: string;
  title: string;
  stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published';
  hook_type?: string;
  target_length_minutes?: number;
  script_content?: string;
  words_per_minute?: number;
  checklist_intro?: boolean;
  checklist_body?: boolean;
  checklist_cta?: boolean;
};

const STAGES: Script['stage'][] = ['idea', 'draft', 'editing', 'ready', 'published'];

export default function Pipeline() {
  const router = useRouter();

  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [validationError, setValidationError] = useState<{ title: string; errors: string[]; scriptId?: string } | null>(null);

  // ----------------------------
  // Load scripts
  // ----------------------------
  useEffect(() => {
    async function loadScripts() {
      setIsLoading(true);
      try {
        const fetchedScripts = await getUserScripts();
        setScripts(fetchedScripts);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadScripts();
  }, []);

  // ----------------------------
  // Validate Ready Gate
  // ----------------------------
  const validateReadyGate = (script: Script) => {
    const errors: string[] = [];
    if (!script.hook_type) errors.push('Hook type must be classified');
    if (!script.target_length_minutes || script.target_length_minutes <= 0) errors.push('Target length must be declared');
    if (!script.checklist_intro || !script.checklist_body || !script.checklist_cta) errors.push('All checklist items must be completed (Intro, Body, CTA)');

    const content = script.script_content || '';
    const words = content.split(/\s+/).filter(Boolean);
    const wpm = script.words_per_minute || 150;
    const minutes = words.length / wpm;
    const actionCues = (content.match(/\[ACTION:.*?\]/g) || []).length;
    const requiredCues = Math.floor(minutes / 2);
    if (minutes > 2 && actionCues < requiredCues) {
      errors.push(`Need at least ${requiredCues} action cues for ~${Math.round(minutes)} minute script`);
    }

    const paragraphs = content.split(/\n\n+/);
    const hasLongSegment = paragraphs.some(p => p.replace(/\[ACTION:.*?\]/g, '').split(/\s+/).filter(Boolean).length > 300);
    if (hasLongSegment) errors.push('Script contains segments over 300 words without breaks');

    return errors;
  };

  const handleDragEnd = async (result: DropResult) => {
  const { destination, source, draggableId } = result;
  if (!destination) return;
  if (destination.droppableId === source.droppableId && destination.index === source.index) return;

  const newStage = destination.droppableId as Script['stage'];

  // Normalize ID comparison
  const script = scripts.find(s => String(s.id) === draggableId);
  if (!script) {
    console.warn('Script not found for draggableId:', draggableId);
    return;
  }

  if (newStage === 'ready') {
    const errors = validateReadyGate(script);
    if (errors.length) {
      setValidationError({ title: 'Cannot move to Ready', errors, scriptId: String(script.id) });
      return;
    }
  }

  // Update local state
  setScripts(prev =>
    prev.map(s => (String(s.id) === draggableId ? { ...s, stage: newStage, last_edited: new Date().toISOString() } : s))
  );

  // Call DB
  try {
    await updateScriptStage(script.id, newStage);
    console.log('DB updated for script', script.id, 'to stage', newStage);
  } catch (e) {
    console.error('Failed to update script stage', e);
  }
};


  const scriptsByStage = STAGES.reduce<Record<Script['stage'], Script[]>>((acc, stage) => {
    acc[stage] = scripts.filter(s => s.stage === stage);
    return acc;
  }, {} as Record<Script['stage'], Script[]>);

  // ----------------------------
  // Render
  // ----------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="flex gap-4 overflow-x-auto">
          {STAGES.map(stage => (
            <div key={stage} className="flex-1 min-w-[280px]">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="px-8 py-8 max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Pipeline</h1>
            <p className="text-stone-500 mt-1">Drag scripts through fixed stages</p>
          </div>
          <Button onClick={() => setShowScriptModal(true)} className="bg-stone-900 hover:bg-stone-800">
            <Plus className="w-4 h-4 mr-2" /> New Script
          </Button>
        </div>

        {/* Info box */}
        <div className="mb-6 p-4 bg-stone-100 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-600">
            <strong>Readiness enforcement is active.</strong> Scripts must meet structural, pacing, and checklist requirements before entering Ready.
          </p>
        </div>

        {/* Drag & Drop Pipeline */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => (
              <PipelineColumn
                key={stage}
                stage={stage}
                scripts={scriptsByStage[stage]}
                onScriptClick={script => router.push(`/dashboard/${script.id}/workspace`)}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {showScriptModal && (
        <ScriptModal
          onClose={() => setShowScriptModal(false)}
          onSave={script => router.push(`/dashboard/${script.id}/workspace`)}
        />
      )}

      <Dialog open={!!validationError} onOpenChange={() => setValidationError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" /> {validationError?.title}
            </DialogTitle>
            <DialogDescription className="pt-4">
              <ul className="space-y-2">
                {validationError?.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    {err}
                  </li>
                ))}
              </ul>
              {validationError?.scriptId && (
                <Button
                  className="mt-6 w-full"
                  onClick={() => router.push(`/dashboard/${validationError.scriptId}/workspace`)}
                >
                  Open Script to Fix
                </Button>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
