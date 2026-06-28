import React from 'react';
import type { Question, ExamConfig } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableQuestion } from './SortableQuestion';
import { MathRenderer } from './MathRenderer';

interface ExamCanvasProps {
  config: ExamConfig;
  questions: Question[];
  viewMode: 'exam' | 'answer' | 'card';
  onViewModeChange: (mode: 'exam' | 'answer' | 'card') => void;
  onRegenerateQuestion: (id: string) => void;
  onModifyPoints: (id: string, points: number) => void;
  onReorderQuestions: (newOrder: Question[]) => void;
  getOptionColumns: (options: string[]) => number;
  isSimulationMode: boolean;
}

export const ExamCanvas: React.FC<ExamCanvasProps> = ({
  config,
  questions,
  viewMode,
  onViewModeChange,
  onRegenerateQuestion,
  onModifyPoints,
  onReorderQuestions,
  getOptionColumns,
  isSimulationMode
}) => {
  const mcQuestions = questions.filter(q => q.type === 'mc');
  const fitbQuestions = questions.filter(q => q.type === 'fitb');
  const calcQuestions = questions.filter(q => q.type === 'calc' || q.type === 'proof');

  const difficultyLabel = (d: string) =>
    d === 'easy' ? '基础' : d === 'medium' ? '中档' : '拔高';

  const difficultyColor = (d: string) =>
    d === 'easy'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
      : d === 'medium'
        ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
        : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50';

  // Drag and Drop sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (type: 'mc' | 'fitb' | 'calc') => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const group = questions.filter(q => {
      if (type === 'calc') return q.type === 'calc' || q.type === 'proof';
      return q.type === type;
    });

    const oldIndex = group.findIndex(q => q.id === active.id);
    const newIndex = group.findIndex(q => q.id === over.id);
    const reorderedGroup = arrayMove(group, oldIndex, newIndex);

    let newQuestionsList: Question[] = [];
    if (type === 'mc') {
      newQuestionsList = [...reorderedGroup, ...questions.filter(q => q.type !== 'mc')];
    } else if (type === 'fitb') {
      newQuestionsList = [
        ...questions.filter(q => q.type === 'mc'),
        ...reorderedGroup,
        ...questions.filter(q => q.type !== 'mc' && q.type !== 'fitb'),
      ];
    } else {
      newQuestionsList = [
        ...questions.filter(q => q.type === 'mc' || q.type === 'fitb'),
        ...reorderedGroup,
      ];
    }

    onReorderQuestions(newQuestionsList);
  };

  // 📝 RENDERING INDEPENDENT ANSWER CARD (答题卡)
  if (viewMode === 'card') {
    return (
      <div className="flex-1 flex flex-col items-center overflow-y-auto p-8 relative">
        {/* View Mode Toggle */}
        <div className="flex bg-[#e8e6e3] p-0.5 rounded border border-[#d6d4d1] mb-6 no-print view-mode-toggle" style={{ fontFamily: 'var(--font-ui)' }}>
          <button
            onClick={() => onViewModeChange('exam')}
            className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer text-slate-500 hover:text-slate-900"
          >
            📄 试题卷模式
          </button>
          <button
            onClick={() => onViewModeChange('answer')}
            className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer text-slate-500 hover:text-slate-900"
          >
            🔑 答案解析卷
          </button>
          <button
            onClick={() => onViewModeChange('card')}
            className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer bg-white text-black shadow-sm font-semibold"
          >
            📝 标准答题卡
          </button>
        </div>

        {/* Simulated A4 Paper for Answer Card */}
        <div className={`a4-page relative print:mx-0 print:my-0 layout-${config.layoutTemplate || 'standard'} ${isSimulationMode ? 'simulation-mode' : ''}`}>
          {/* Paper Header */}
          <div className="text-center mb-6 pl-6 exam-header relative">
            {config.logoBase64 && (
              <img src={config.logoBase64} alt="校徽" className="absolute left-6 top-0 w-12 h-12 object-contain bg-white rounded shadow-sm border border-slate-100 no-print" />
            )}
            {config.annotation && (
              <span className="absolute right-0 top-0 border border-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-slate-800 tracking-wider">
                {config.annotation}
              </span>
            )}
            
            <h1 className="text-xl font-bold mb-1 tracking-wider">{config.schoolName}</h1>
            <h2 className="text-2xl font-bold mb-3 tracking-widest">
              {config.grade}数学{config.term}{config.title} - 答题卡
            </h2>
            
            {/* Student Info Block with Barcode Placeholder */}
            <div className="border border-slate-300 rounded p-3 mb-4 grid grid-cols-3 gap-2 text-xs text-slate-800 font-medium text-left">
              <div className="flex flex-col gap-2 border-r border-slate-200 pr-3">
                <span>班级：___________</span>
                <span>姓名：___________</span>
                <span>座号：___________</span>
              </div>
              <div className="flex flex-col justify-center items-center border-r border-slate-200 pr-3">
                <span className="text-[10px] text-slate-400 mb-1">准考证号条形码粘贴处</span>
                <div className="border border-dashed border-slate-300 w-32 h-10 flex items-center justify-center text-[9px] text-slate-300">
                  ( 贴此线内 )
                </div>
              </div>
              <div className="flex flex-col gap-1 justify-center pl-3">
                <div className="text-[10px] text-red-500 font-semibold mb-0.5">注意事项：</div>
                <div className="text-[9px] text-slate-500 leading-tight">
                  1. 答题前，考生先将自己的姓名、班级填写清楚。<br/>
                  2. 选择题部分必须使用 2B 铅笔填涂。
                </div>
              </div>
            </div>
            
            <div className="border-t-2 border-double border-slate-900 w-full" />
          </div>

          <div className="pl-6 text-slate-900 text-sm leading-relaxed text-left">
            {/* 1. Multiple Choice Area */}
            {mcQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2 text-base section-header">一、 选择题答题区（请用2B铅笔填涂）</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 border border-slate-200 p-3 rounded font-mono">
                  {mcQuestions.map((q, idx) => {
                    const optionCount = q.options ? q.options.length : 4;
                    const letters = Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i));
                    return (
                      <div key={q.id} className="flex items-center gap-3 py-1 border-b border-dashed border-slate-100 last:border-0">
                        <span className="font-bold text-xs w-6">{idx + 1}.</span>
                        <div className="flex gap-2">
                          {letters.map(letter => (
                            <span key={letter} className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-[10px] text-slate-500 font-bold select-none cursor-pointer hover:bg-slate-50">
                              [{letter}]
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Fill in the Blank Area */}
            {fitbQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2 text-base section-header">二、 填空题答题区</h3>
                <div className="grid grid-cols-2 gap-4">
                  {fitbQuestions.map((q, idx) => (
                    <div key={q.id} className="flex items-center gap-2 border border-slate-200 rounded p-2 font-mono">
                      <span className="font-bold text-xs w-6">{idx + 1 + mcQuestions.length}.</span>
                      <div className="flex-1 border-b border-slate-300 h-6"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Calculation Area */}
            {calcQuestions.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-base section-header">三、 解答题答题区（请写出必要的步骤）</h3>
                <div className="flex flex-col gap-4">
                  {calcQuestions.map((q, idx) => (
                    <div key={q.id} className="border border-slate-200 rounded p-4 h-48 flex flex-col justify-between">
                      <div className="font-semibold text-slate-700 text-xs">
                        第 {idx + 1 + mcQuestions.length + fitbQuestions.length} 题 （满分 {q.points} 分）
                      </div>
                      <div className="flex-1 mt-2 border-b border-dashed border-slate-200"></div>
                      <div className="text-right text-[10px] text-slate-300 font-mono mt-1">
                        【 得分：_______ 】
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 🔑 RENDERING INDEPENDENT ANSWER SHEET
  if (viewMode === 'answer') {
    return (
      <div className="flex-1 flex flex-col items-center overflow-y-auto p-8 relative">
        {/* View Mode Toggle */}
        <div className="flex bg-[#e8e6e3] p-0.5 rounded border border-[#d6d4d1] mb-6 no-print view-mode-toggle" style={{ fontFamily: 'var(--font-ui)' }}>
          <button
            onClick={() => onViewModeChange('exam')}
            className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer text-slate-500 hover:text-slate-900"
          >
            📄 试题卷模式
          </button>
          <button
            onClick={() => onViewModeChange('answer')}
            className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer bg-white text-black shadow-sm font-semibold"
          >
            🔑 答案解析卷
          </button>
          <button
            onClick={() => onViewModeChange('card')}
            className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer text-slate-500 hover:text-slate-900"
          >
            📝 标准答题卡
          </button>
        </div>

        {/* Simulated A4 Paper for Answer Sheet */}
        <div className={`a4-page relative print:mx-0 print:my-0 layout-${config.layoutTemplate || 'standard'} ${isSimulationMode ? 'simulation-mode' : ''}`}>
          {/* Paper Header */}
          <div className="text-center mb-6 pl-6 exam-header relative">
            {config.logoBase64 && (
              <img src={config.logoBase64} alt="校徽" className="absolute left-6 top-0 w-12 h-12 object-contain bg-white rounded shadow-sm border border-slate-100 no-print" />
            )}
            {config.annotation && (
              <span className="absolute right-0 top-0 border border-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-slate-800 tracking-wider">
                {config.annotation}
              </span>
            )}
            <h1 className="text-xl font-bold mb-1 tracking-wider">{config.schoolName}</h1>
            <h2 className="text-2xl font-bold mb-3 tracking-widest">
              {config.grade}数学{config.term}{config.title} - 参考答案与解析
            </h2>
            <div className="border-t-2 border-double border-slate-900 w-full" />
          </div>

          <div className="pl-6 text-slate-900 text-sm leading-relaxed text-left">
            {/* 1. Multiple Choice Answers */}
            {mcQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2 text-base section-header">一、 选择题答案</h3>
                <div className="grid grid-cols-5 gap-3 border border-slate-200 p-3 rounded mb-4 font-mono text-center">
                  {mcQuestions.map((q, idx) => (
                    <div key={q.id} className="border-r border-slate-100 last:border-0">
                      <div className="text-slate-500 text-[10px]">第 {idx + 1} 题</div>
                      <div className="font-bold text-base text-blue-700">{q.answer}</div>
                    </div>
                  ))}
                </div>
                {/* Explanations */}
                <h4 className="font-semibold text-xs text-slate-500 mb-2">【选择题详细解析】</h4>
                <div className="flex flex-col gap-3">
                  {mcQuestions.map((q, idx) => (
                    <div key={q.id} className="text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                      <div className="font-medium text-slate-800">
                        <strong className="text-slate-700">{idx + 1}. </strong>
                        <MathRenderer math={q.text} />
                      </div>
                      <div className="mt-1.5 text-emerald-800">
                        <strong>解析：</strong><MathRenderer math={q.solution} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Fill in the Blank Answers */}
            {fitbQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2 text-base section-header">二、 填空题答案</h3>
                <div className="grid grid-cols-4 gap-3 border border-slate-200 p-3 rounded mb-4 font-mono text-center">
                  {fitbQuestions.map((q, idx) => (
                    <div key={q.id} className="border-r border-slate-100 last:border-0">
                      <div className="text-slate-500 text-[10px]">第 {idx + 1 + mcQuestions.length} 题</div>
                      <div className="font-bold text-sm text-blue-700">{q.answer}</div>
                    </div>
                  ))}
                </div>
                {/* Explanations */}
                <h4 className="font-semibold text-xs text-slate-500 mb-2">【填空题详细解析】</h4>
                <div className="flex flex-col gap-3">
                  {fitbQuestions.map((q, idx) => (
                    <div key={q.id} className="text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                      <div className="font-medium text-slate-800">
                        <strong className="text-slate-700">{idx + 1 + mcQuestions.length}. </strong>
                        <MathRenderer math={q.text} />
                      </div>
                      <div className="mt-1.5 text-emerald-800">
                        <strong>解析：</strong><MathRenderer math={q.solution} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Calculation & Proof Answers */}
            {calcQuestions.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-base section-header">三、 解答题答案与步骤解析</h3>
                <div className="flex flex-col gap-4">
                  {calcQuestions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-50 p-4 rounded border border-slate-200">
                      <div className="font-semibold text-slate-800 mb-1">
                        第 {idx + 1 + mcQuestions.length + fitbQuestions.length} 题 （满分 {q.points} 分）
                      </div>
                      <div className="text-xs text-slate-600 mb-2">
                        <MathRenderer math={q.text} />
                      </div>
                      <div className="border-t border-slate-200 pt-2 text-xs leading-relaxed">
                        <strong className="text-emerald-700 block mb-1">【规范解答与步骤评分】</strong>
                        <div className="whitespace-pre-line text-slate-800 bg-white p-3 rounded border border-slate-155 font-mono">
                          <MathRenderer math={q.solution} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 📝 RENDERING EXAM PAPER
  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto p-8 relative">
      {/* View Mode Toggle */}
      <div className="flex bg-[#e8e6e3] p-0.5 rounded border border-[#d6d4d1] mb-6 no-print view-mode-toggle" style={{ fontFamily: 'var(--font-ui)' }}>
        <button
          onClick={() => onViewModeChange('exam')}
          className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer bg-white text-black shadow-sm font-semibold"
        >
          📄 试题卷模式
        </button>
        <button
          onClick={() => onViewModeChange('answer')}
          className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer text-slate-500 hover:text-slate-900"
        >
          🔑 答案解析卷
        </button>
        <button
          onClick={() => onViewModeChange('card')}
          className="px-4 py-1 rounded text-xs font-medium transition-all cursor-pointer text-slate-500 hover:text-slate-900"
        >
          📝 标准答题卡
        </button>
      </div>

      {/* Simulated A4 Paper */}
      <div className={`a4-page relative print:mx-0 print:my-0 layout-${config.layoutTemplate || 'standard'} ${isSimulationMode ? 'simulation-mode' : ''}`}>

        {/* Sealing Line (密封线) — Authentic Vertical Layout */}
        {(config.layoutTemplate === 'standard' || !config.layoutTemplate) && (
          <div className="sealing-line-container">
            <span className="seal-text">密</span>
            <span className="seal-dash" />
            <span className="seal-text">封</span>
            <span className="seal-dash" />
            <span className="seal-text">线</span>
            <span className="seal-dash" />
            <span className="seal-notice">请勿在此线内答题</span>
          </div>
        )}

        {/* Paper Header */}
        <div className="text-center mb-6 pl-6 exam-header relative">
          {config.logoBase64 && (
            <img src={config.logoBase64} alt="校徽" className="absolute left-6 top-0 w-12 h-12 object-contain bg-white rounded shadow-sm border border-slate-100 no-print" />
          )}
          {config.annotation && (
            <span className="absolute right-0 top-0 border border-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-slate-800 tracking-wider">
              {config.annotation}
            </span>
          )}
          <h1 className="text-xl font-bold mb-1 tracking-wider">{config.schoolName}</h1>
          <h2 className="text-2xl font-bold mb-3 tracking-widest">
            {config.grade}数学{config.term}{config.title}
          </h2>

          {/* Student Info Block */}
          <div className="flex justify-center gap-8 text-sm text-slate-800 font-medium mb-4 print:mb-3">
            <span>班级：___________</span>
            <span>姓名：___________</span>
            <span>学号：___________</span>
            <span>得分：___________</span>
          </div>

          <div className="border-t-2 border-double border-slate-900 w-full" />
        </div>

        {/* Paper Content */}
        <div className="pl-6 text-slate-900 text-sm leading-relaxed text-left">
          {/* Section 1: Multiple Choice */}
          {mcQuestions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-base section-header">
                一、 选择题（本大题共 {mcQuestions.length} 小题，每小题 3 分，共 {mcQuestions.length * 3} 分）
              </h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('mc')}>
                <SortableContext items={mcQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3">
                    {mcQuestions.map((q, idx) => (
                      <SortableQuestion
                        key={q.id}
                        question={q}
                        index={idx + 1}
                        viewMode={viewMode}
                        onRegenerateQuestion={onRegenerateQuestion}
                        getOptionColumns={getOptionColumns}
                        difficultyColor={difficultyColor}
                        difficultyLabel={difficultyLabel}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Section 2: Fill-in-the-Blank */}
          {fitbQuestions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-base section-header">
                二、 填空题（本大题共 {fitbQuestions.length} 小题，每小题 4 分，共 {fitbQuestions.length * 4} 分）
              </h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('fitb')}>
                <SortableContext items={fitbQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3">
                    {fitbQuestions.map((q, idx) => (
                      <SortableQuestion
                        key={q.id}
                        question={q}
                        index={idx + 1 + mcQuestions.length}
                        viewMode={viewMode}
                        onRegenerateQuestion={onRegenerateQuestion}
                        getOptionColumns={getOptionColumns}
                        difficultyColor={difficultyColor}
                        difficultyLabel={difficultyLabel}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Section 3: Calculations & Proofs */}
          {calcQuestions.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 text-base section-header">
                三、 解答题（本大题共 {calcQuestions.length} 小题，共 {calcQuestions.reduce((acc, curr) => acc + curr.points, 0)} 分。解答应写出文字说明、证明过程或演算步骤）
              </h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd('calc')}>
                <SortableContext items={calcQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-5">
                    {calcQuestions.map((q, idx) => (
                      <SortableQuestion
                        key={q.id}
                        question={q}
                        index={idx + 1 + mcQuestions.length + fitbQuestions.length}
                        viewMode={viewMode}
                        onRegenerateQuestion={onRegenerateQuestion}
                        onModifyPoints={onModifyPoints}
                        getOptionColumns={getOptionColumns}
                        difficultyColor={difficultyColor}
                        difficultyLabel={difficultyLabel}
                        showPointsInput
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
