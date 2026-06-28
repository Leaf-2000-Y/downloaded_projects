import React from 'react';
import type { ExamConfig } from '../types';
import { curriculumData } from '../data/curriculumData';
import { competitionExams } from '../data/competitionExams';

interface SidebarProps {
  config: ExamConfig;
  onChange: (updates: Partial<ExamConfig>) => void;
  onGenerate: () => void;
  onExportPDF: () => void;
  onExportWord: () => void;
  isGenerating: boolean;
  totalPoints: number;
  onLoadCompetitionExam: (examId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  onChange,
  onGenerate,
  onExportPDF,
  onExportWord,
  isGenerating,
  totalPoints,
  onLoadCompetitionExam
}) => {
  // Find current curriculum matching selected grade & term
  const activeCurriculum = React.useMemo(() => {
    return curriculumData.find(
      c => c.grade === config.grade && c.term === config.term
    ) || curriculumData.find(c => c.grade === '八年级' && c.term === '上学期') || curriculumData[0];
  }, [config.grade, config.term]);

  const allActiveSectionIds = React.useMemo(() => {
    const ids: string[] = [];
    activeCurriculum.chapters.forEach(ch => {
      ch.sections.forEach(s => ids.push(s.id));
    });
    return ids;
  }, [activeCurriculum]);

  // Sync selected chapters if grade/term changes or if none are selected
  React.useEffect(() => {
    if (!config.selectedChapters) {
      onChange({ selectedChapters: allActiveSectionIds });
    } else {
      // Check if current selection contains only sections from active curriculum
      const validSections = config.selectedChapters.filter(id => allActiveSectionIds.includes(id));
      // If we switched grade and none of the selected sections are valid, reset to all
      if (validSections.length !== config.selectedChapters.length) {
        onChange({ selectedChapters: allActiveSectionIds });
      }
    }
  }, [allActiveSectionIds, config.selectedChapters, onChange]);

  const selectedSections = config.selectedChapters || allActiveSectionIds;

  // Local state for expanded chapters
  const [expandedChapters, setExpandedChapters] = React.useState<Record<string, boolean>>({});

  const toggleChapterExpand = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const isChapterChecked = (chapter: any) => {
    const sectionIds = chapter.sections.map((s: any) => s.id);
    return sectionIds.every((id: string) => selectedSections.includes(id));
  };

  const handleSectionToggle = (sectionId: string) => {
    let updated: string[];
    if (selectedSections.includes(sectionId)) {
      updated = selectedSections.filter(id => id !== sectionId);
    } else {
      updated = [...selectedSections, sectionId];
    }
    onChange({ selectedChapters: updated });
  };

  const handleChapterToggle = (chapter: any) => {
    const sectionIds = chapter.sections.map((s: any) => s.id);
    const allSelected = sectionIds.every((id: string) => selectedSections.includes(id));
    
    let updated: string[];
    if (allSelected) {
      updated = selectedSections.filter(id => !sectionIds.includes(id));
    } else {
      updated = Array.from(new Set([...selectedSections, ...sectionIds]));
    }
    onChange({ selectedChapters: updated });
  };

  // Logo upload handlers
  const [dragActive, setDragActive] = React.useState(false);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onChange({ logoBase64: undefined });
  };

  const difficultySum = config.difficultyEasy + config.difficultyMedium + config.difficultyHard;
  const isSumValid = difficultySum === 100;

  return (
    <aside className="w-80 border-r p-6 flex flex-col gap-5 overflow-y-auto no-print" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--color-border-light)', color: 'var(--color-ink)' }}>
      {/* Brand Title — Serif heading */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, letterSpacing: '0.02em', color: 'var(--color-ink)' }}>
          智审命题系统
        </h2>
        <p style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginTop: '4px', letterSpacing: '0.06em' }}>精确校验 · 标准排版 · 一键出卷</p>
      </div>

      <hr className="jp-divider" />

      {/* Basic Settings */}
      <div className="flex flex-col gap-4">
        <h3 className="jp-section-title">基础配置</h3>
        
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px', letterSpacing: '0.04em' }}>快捷加载竞赛真题</label>
          <select
            className="jp-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onLoadCompetitionExam(e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="" disabled>— 选择试卷 —</option>
            {competitionExams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px' }}>学校名称 / 副标题</label>
          <input
            type="text"
            className="jp-input"
            value={config.schoolName}
            onChange={(e) => onChange({ schoolName: e.target.value })}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px' }}>考试标题</label>
          <input
            type="text"
            className="jp-input"
            value={config.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px' }}>年级</label>
            <select
              className="jp-select"
              value={config.grade}
              onChange={(e) => onChange({ grade: e.target.value })}
            >
              <option value="七年级">七年级</option>
              <option value="八年级">八年级</option>
              <option value="九年级">九年级</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px' }}>学段</label>
            <select
              className="jp-select"
              value={config.term}
              onChange={(e) => onChange({ term: e.target.value })}
            >
              <option value="上学期">上学期</option>
              <option value="下学期">下学期</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px' }}>批注</label>
            <input
              type="text"
              placeholder="如：机密"
              className="jp-input"
              value={config.annotation || ''}
              onChange={(e) => onChange({ annotation: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px' }}>教材</label>
            <select
              className="jp-select"
              value={config.curriculum}
              onChange={(e) => onChange({ curriculum: e.target.value })}
            >
              <option value="人教版">人教版</option>
              <option value="北师大版">北师大版</option>
              <option value="苏教版">苏教版</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '2px' }}>排版格式模板</label>
          <select
            className="jp-select"
            value={config.layoutTemplate || 'standard'}
            onChange={(e) => onChange({ layoutTemplate: e.target.value as any })}
          >
            <option value="standard">🏫 标准中考模考卷（含密封线）</option>
            <option value="minimal">📝 简约作业报告版（无密封线）</option>
            <option value="art">🎨 文艺艺术测试版（宽边距宋体）</option>
          </select>
        </div>

        {/* Logo Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>校徽 / Logo</label>
          {config.logoBase64 ? (
            <div className="flex items-center gap-3" style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <img src={config.logoBase64} alt="校徽" className="w-8 h-8 object-contain" />
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>已上传</p>
                <button
                  onClick={removeLogo}
                  style={{ fontSize: '10px', color: 'var(--color-ink-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  移除
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `1px dashed ${dragActive ? 'var(--color-ink)' : 'var(--color-border)'}`,
                padding: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 300ms ease',
              }}
              onClick={() => document.getElementById('logo-upload-input')?.click()}
            >
              <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>拖拽或点击上传</span>
              <input
                id="logo-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          )}
        </div>
      </div>

      <hr className="jp-divider" />

      {/* Chapter Selection Tree */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="jp-section-title">章节范围</h3>
          <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>
            ({selectedSections.length} 已选)
          </span>
        </div>

        <div className="jp-scroll-container flex flex-col gap-2">
          {activeCurriculum.chapters.map(chapter => {
            const chChecked = isChapterChecked(chapter);
            const isExpanded = expandedChapters[chapter.id] ?? true;
            
            return (
              <div key={chapter.id} className="flex flex-col gap-1" style={{ paddingBottom: '6px', borderBottom: '1px solid var(--color-border-light)' }}>
                <div className="flex items-center gap-1.5" style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  <button
                    onClick={() => toggleChapterExpand(chapter.id)}
                    style={{ color: 'var(--color-ink-tertiary)', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'monospace', fontSize: '8px', background: 'none', border: 'none' }}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                  <input
                    type="checkbox"
                    checked={chChecked}
                    className="jp-checkbox"
                    onChange={() => handleChapterToggle(chapter)}
                  />
                  <span
                    onClick={() => toggleChapterExpand(chapter.id)}
                    style={{ cursor: 'pointer', userSelect: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {chapter.name}
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ paddingLeft: '20px', marginLeft: '6px', borderLeft: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                    {chapter.sections.map(sec => {
                      const secChecked = selectedSections.includes(sec.id);
                      return (
                        <label key={sec.id} className="flex items-start gap-1.5" style={{ fontSize: '11px', color: secChecked ? 'var(--color-ink)' : 'var(--color-ink-tertiary)', cursor: 'pointer', userSelect: 'none', transition: 'color 300ms ease' }}>
                          <input
                            type="checkbox"
                            checked={secChecked}
                            className="jp-checkbox"
                            style={{ marginTop: '2px' }}
                            onChange={() => handleSectionToggle(sec.id)}
                          />
                          <span>{sec.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-3 justify-end" style={{ fontSize: '10px', color: 'var(--color-ink-secondary)' }}>
          <button
            onClick={() => onChange({ selectedChapters: allActiveSectionIds })}
            style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '10px', color: 'var(--color-ink-secondary)', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}
          >
            全选
          </button>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <button
            onClick={() => onChange({ selectedChapters: [] })}
            style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '10px', color: 'var(--color-ink-secondary)', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}
          >
            清空
          </button>
        </div>
      </div>

      <hr className="jp-divider" />

      {/* Target Distribution */}
      <div className="flex flex-col gap-3">
        <h3 className="jp-section-title">题型数量</h3>
        
        <div>
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>
            <span>选择题 · 每题 3 分</span>
            <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{config.mcCount}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            className="jp-range"
            value={config.mcCount}
            onChange={(e) => onChange({ mcCount: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>
            <span>填空题 · 每题 4 分</span>
            <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{config.fitbCount}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            className="jp-range"
            value={config.fitbCount}
            onChange={(e) => onChange({ fitbCount: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>
            <span>解答题</span>
            <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{config.calcCount}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            className="jp-range"
            value={config.calcCount}
            onChange={(e) => onChange({ calcCount: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <hr className="jp-divider" />

      {/* Difficulty Distribution */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="jp-section-title">难度分布</h3>
          <span style={{
            fontSize: '10px',
            fontWeight: 500,
            padding: '1px 6px',
            color: isSumValid ? 'var(--color-success)' : '#b91c1c',
            borderBottom: `1px solid ${isSumValid ? 'var(--color-success)' : '#b91c1c'}`,
          }}>
            {difficultySum}% {isSumValid ? '✓' : '≠100%'}
          </span>
        </div>

        <div>
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>
            <span>基础 Easy</span>
            <span style={{ color: 'var(--color-ink)' }}>{config.difficultyEasy}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="jp-range"
            value={config.difficultyEasy}
            onChange={(e) => onChange({ difficultyEasy: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>
            <span>中档 Medium</span>
            <span style={{ color: 'var(--color-ink)' }}>{config.difficultyMedium}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="jp-range"
            value={config.difficultyMedium}
            onChange={(e) => onChange({ difficultyMedium: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>
            <span>拔高 Hard</span>
            <span style={{ color: 'var(--color-ink)' }}>{config.difficultyHard}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="jp-range"
            value={config.difficultyHard}
            onChange={(e) => onChange({ difficultyHard: parseInt(e.target.value) })}
          />
        </div>
      </div>

      {/* Total Points */}
      <div className="flex justify-between items-baseline" style={{ padding: '8px 0', borderTop: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)', marginTop: '4px' }}>
        <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', letterSpacing: '0.04em' }}>预测总分</span>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>{totalPoints}<span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--color-ink-tertiary)', marginLeft: '2px' }}>分</span></span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !isSumValid}
          className="jp-btn w-full flex items-center justify-center gap-2"
          style={{ opacity: (isGenerating || !isSumValid) ? 0.4 : 1, cursor: (isGenerating || !isSumValid) ? 'not-allowed' : 'pointer' }}
        >
          {isGenerating ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              求解校验中...
            </>
          ) : (
            '一键命题与校验'
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportPDF}
            className="jp-btn-ghost"
          >
            导出 PDF
          </button>
          <button
            onClick={onExportWord}
            className="jp-btn-ghost"
          >
            导出 Word
          </button>
        </div>
      </div>
    </aside>
  );
};

