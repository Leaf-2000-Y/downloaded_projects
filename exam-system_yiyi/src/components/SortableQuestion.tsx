import React from 'react';
import type { Question } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MathRenderer } from './MathRenderer';

export const stripOptionPrefix = (opt: string): string => {
  return opt.replace(/^[A-E]\s*[.、:]\s*/i, '');
};

interface SortableQuestionProps {
  question: Question;
  index: number;
  viewMode: 'exam' | 'answer' | 'card';
  onRegenerateQuestion: (id: string) => void;
  onModifyPoints?: (id: string, points: number) => void;
  getOptionColumns: (options: string[]) => number;
  difficultyColor: (d: string) => string;
  difficultyLabel: (d: string) => string;
  showPointsInput?: boolean;
}

export const SortableQuestion: React.FC<SortableQuestionProps> = ({
  question,
  index,
  viewMode,
  onRegenerateQuestion,
  onModifyPoints,
  getOptionColumns,
  difficultyColor,
  difficultyLabel,
  showPointsInput
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`question-block sortable-item ${isDragging ? 'is-dragging' : ''}`}
    >
      {/* Hover Controls */}
      <div className="hover-controls no-print">
        {/* Drag Handle */}
        <span
          {...attributes}
          {...listeners}
          className="drag-handle text-slate-400 hover:text-blue-500 font-bold text-base select-none mr-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="拖动调整顺序"
        >
          ⋮⋮
        </span>
        {question.isVerified && (
          <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-blue-950 text-blue-400 border border-blue-900 select-none" title="DSVP 符号计算引擎 100% 求解验证通过">
            ✓ DSVP 验证
          </span>
        )}
        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${difficultyColor(question.difficulty)}`}>
          {difficultyLabel(question.difficulty)}
        </span>
        {showPointsInput && onModifyPoints && (
          <div className="flex items-center bg-slate-100 rounded border border-slate-200 px-1.5 text-xs">
            <label className="text-slate-500 mr-1 text-[10px]">分值:</label>
            <input
              type="number"
              className="w-8 text-center bg-white border border-slate-300 rounded font-semibold text-slate-700 focus:outline-none text-xs"
              value={question.points}
              onChange={e => onModifyPoints(question.id, parseInt(e.target.value) || 0)}
            />
          </div>
        )}
        <button
          onClick={() => onRegenerateQuestion(question.id)}
          className="p-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-200 cursor-pointer transition-colors"
          title="重新生成该题"
        >
          🔄 换题
        </button>
      </div>

      <div className="flex items-start gap-2">
        <span className="font-semibold flex-shrink-0 min-w-[1.25rem] text-right">{index}.</span>
        <div className="flex-1">
          <div className="inline-wrap">
            {showPointsInput && (
              <span className="font-semibold text-slate-500 mr-1 text-xs">
                （本小题满分 {question.points} 分）
              </span>
            )}
            <MathRenderer math={question.text} />
          </div>
          {question.svgDiagram && (
            <div 
              className="my-3 flex justify-center print:block print:my-2"
              dangerouslySetInnerHTML={{ __html: question.svgDiagram }}
            />
          )}
          {/* Adaptive Options Grid */}
          {question.options && question.options.length > 0 && (
            <div className={`options-grid cols-${getOptionColumns(question.options)}`}>
              {question.options.map((opt, oIdx) => (
                <span key={oIdx} className="font-mono text-xs flex items-center">
                  <span className="font-semibold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                  <MathRenderer math={stripOptionPrefix(opt)} />
                </span>
              ))}
            </div>
          )}
          {viewMode === 'exam' && (question.type === 'calc' || question.type === 'proof') && (
            <div className={`mt-3 ${question.points >= 10 ? 'h-36' : 'h-24'} border-b border-dashed border-slate-200 print:block`} />
          )}
          {viewMode === 'answer' && (
            <div className="answer-block font-sans whitespace-pre-line mt-2">
              <strong className="text-emerald-700">
                {question.type === 'mc' || question.type === 'fitb' ? '正确答案：' : '分步解析：'}
              </strong>
              {question.type === 'mc' || question.type === 'fitb' ? (
                <>
                  <span>{question.answer}</span>
                  <p className="mt-1"><strong className="text-emerald-700">解析：</strong><MathRenderer math={question.solution} /></p>
                </>
              ) : (
                <div className="mt-1">
                  <MathRenderer math={question.solution} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
