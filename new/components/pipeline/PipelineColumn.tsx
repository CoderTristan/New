'use client';


import { Droppable, Draggable } from '@hello-pangea/dnd';
import ScriptCard from './ScriptCard';

type Script = {
  id: string | number;
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

type PipelineColumnProps = {
  stage: Script['stage'];
  scripts: Script[];
  onScriptClick: (script: Script) => void;
};

const stageConfig = {
  idea: { label: 'Idea', color: 'bg-violet-500', bgColor: 'bg-violet-50' },
  draft: { label: 'Draft', color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  editing: { label: 'Editing', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  ready: { label: 'Ready', color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
  published: { label: 'Published', color: 'bg-stone-500', bgColor: 'bg-stone-50' },
};

export default function PipelineColumn({ stage, scripts, onScriptClick }: PipelineColumnProps) {
  const config = stageConfig[stage];

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      {/* Column header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <h3 className="font-semibold text-stone-900">{config.label}</h3>
        <span className="text-sm text-stone-500 ml-auto">{scripts.length}</span>
      </div>

      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? config.bgColor : 'bg-stone-100/50'
            }`}
          >
            {scripts.map((script, index) => (
              <Draggable key={script.id} draggableId={String(script.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ScriptCard
                      script={script}
                      onClick={() => onScriptClick(script)}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
