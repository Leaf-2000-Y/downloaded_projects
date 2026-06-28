import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExamCanvas } from './components/ExamCanvas';
import { stripOptionPrefix } from './components/SortableQuestion';
import type { ExamConfig, Question } from './types';
import { mockQuestions } from './data/mockQuestions';
import { competitionExams } from './data/competitionExams';
import katex from 'katex';
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Packer,
  AlignmentType,
  BorderStyle,
  WidthType,
  Math as DocxMath,
  MathFraction,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
  MathRadical,
  MathRun
} from 'docx';

const DEFAULT_CONFIG: ExamConfig = {
  schoolName: '繁荣第一实验学校',
  title: '期末考试模拟测试卷',
  grade: '八年级',
  term: '上学期',
  curriculum: '人教版',
  timeLimit: 120,
  difficultyEasy: 60,
  difficultyMedium: 30,
  difficultyHard: 10,
  mcCount: 3,
  fitbCount: 2,
  calcCount: 3,
  layoutTemplate: 'standard'
};

// Helper: determine the optimal column count for MC options
function getOptionColumns(options: string[]): number {
  if (!options || options.length === 0) return 4;
  const maxLen = Math.max(...options.map(o => o.replace(/\$[^$]+\$/g, 'XX').length));
  if (maxLen > 40) return 1;
  if (maxLen > 18) return 2;
  return 4;
}



// Helper: recursively parse MathML nodes into docx MathComponent structures
function parseMathMLToMathComponents(mathmlStr: string): any[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mathmlStr, 'application/xml');
    
    // Check for parser errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('XML Parser Error:', parserError.textContent);
      return [];
    }

    const root = doc.documentElement;

    const parseNode = (node: Node): any[] => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        return text ? [new MathRun(text)] : [];
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return [];
      }

      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      if (tagName === 'math' || tagName === 'mrow' || tagName === 'semantics' || tagName === 'mstyle') {
        const childrenComponents: any[] = [];
        Array.from(el.childNodes).forEach(child => {
          childrenComponents.push(...parseNode(child));
        });
        return childrenComponents;
      }

      if (tagName === 'mfrac') {
        const childrenNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE);
        if (childrenNodes.length >= 2) {
          const num = parseNode(childrenNodes[0]);
          const den = parseNode(childrenNodes[1]);
          return [new MathFraction({ numerator: num, denominator: den })];
        }
      }

      if (tagName === 'msup') {
        const childrenNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE);
        if (childrenNodes.length >= 2) {
          const base = parseNode(childrenNodes[0]);
          const exp = parseNode(childrenNodes[1]);
          return [new MathSuperScript({ children: base, superScript: exp })];
        }
      }

      if (tagName === 'msub') {
        const childrenNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE);
        if (childrenNodes.length >= 2) {
          const base = parseNode(childrenNodes[0]);
          const sub = parseNode(childrenNodes[1]);
          return [new MathSubScript({ children: base, subScript: sub })];
        }
      }

      if (tagName === 'msubsup') {
        const childrenNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE);
        if (childrenNodes.length >= 3) {
          const base = parseNode(childrenNodes[0]);
          const sub = parseNode(childrenNodes[1]);
          const sup = parseNode(childrenNodes[2]);
          return [new MathSubSuperScript({ children: base, subScript: sub, superScript: sup })];
        }
      }

      if (tagName === 'msqrt') {
        const childrenComponents: any[] = [];
        Array.from(el.childNodes).forEach(child => {
          childrenComponents.push(...parseNode(child));
        });
        return [new MathRadical({ children: childrenComponents })];
      }

      if (tagName === 'mi' || tagName === 'mn' || tagName === 'mo') {
        const text = el.textContent || '';
        return [new MathRun(text)];
      }

      // Fallback
      const fallbackComponents: any[] = [];
      Array.from(el.childNodes).forEach(child => {
        fallbackComponents.push(...parseNode(child));
      });
      return fallbackComponents;
    };

    return parseNode(root);
  } catch (err) {
    console.error('MathML parsing failed:', err);
    return [];
  }
}

// Helper: parse mixed text into docx runs and math elements
function parseMixedTextToDocxRuns(text: string): any[] {
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map(part => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const rawMath = part.slice(1, -1);
      try {
        const mathml = katex.renderToString(rawMath, {
          output: 'mathml',
          throwOnError: false
        });
        const match = mathml.match(/<math[^]*<\/math>/);
        if (match) {
          const components = parseMathMLToMathComponents(match[0]);
          if (components.length > 0) {
            return new DocxMath({ children: components });
          }
        }
      } catch (e) {
        console.error('KaTeX to MathML conversion failed for docx:', rawMath, e);
      }
      return new TextRun({ text: part, font: 'Times New Roman' });
    }
    return new TextRun({ text: part, font: 'SimSun' });
  });
}

// Helper: split mixed text on newline and map to Paragraphs
function createParagraphsFromMixedText(text: string, options?: { prefix?: string; points?: number }): Paragraph[] {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const runs = parseMixedTextToDocxRuns(line);
    const finalRuns = [...runs];
    
    if (lineIdx === 0 && options) {
      if (options.prefix) {
        finalRuns.unshift(new TextRun({ text: options.prefix, bold: true, font: 'SimSun' }));
      }
      if (options.points !== undefined) {
        finalRuns.unshift(new TextRun({ text: `（本小题满分 ${options.points} 分） `, font: 'SimSun' }));
      }
    }
    
    return new Paragraph({
      children: finalRuns,
      spacing: { after: 120 }
    });
  });
}


export default function App() {
  const [config, setConfig] = useState<ExamConfig>(() => {
    // P2.5: Load from localStorage if available
    const saved = localStorage.getItem('exam_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(() => {
    // P2.5: Load selected questions from localStorage if available
    const saved = localStorage.getItem('selected_questions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'exam' | 'answer' | 'card'>('exam');
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  // P2.5: Persist config to localStorage
  useEffect(() => {
    localStorage.setItem('exam_config', JSON.stringify(config));
  }, [config]);

  // P2.5: Persist selectedQuestions to localStorage
  useEffect(() => {
    localStorage.setItem('selected_questions', JSON.stringify(selectedQuestions));
  }, [selectedQuestions]);

  // P1.1 FIX: Proper useEffect for initial question selection (was incorrectly using useState)
  useEffect(() => {
    const saved = localStorage.getItem('selected_questions');
    if (!saved || JSON.parse(saved).length === 0) {
      selectQuestions(config);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Centralized question selection logic with grade and chapter filtering
  const selectQuestions = useCallback((cfg: ExamConfig) => {
    const filterByDifficulty = (type: string, count: number) => {
      const pool = mockQuestions.filter(q => {
        const matchesGrade = !q.grade || q.grade === cfg.grade;
        const matchesType = type === 'calc' ? (q.type === 'calc' || q.type === 'proof') : q.type === type;
        const matchesChapter = !cfg.selectedChapters || cfg.selectedChapters.length === 0 || (q.sectionId && cfg.selectedChapters.includes(q.sectionId));
        return matchesGrade && matchesType && matchesChapter;
      });

      // Try to respect difficulty distribution
      const easyRatio = cfg.difficultyEasy / 100;
      const mediumRatio = cfg.difficultyMedium / 100;

      const easyCount = Math.round(count * easyRatio);
      const mediumCount = Math.round(count * mediumRatio);
      const hardCount = count - easyCount - mediumCount;

      const easy = pool.filter(q => q.difficulty === 'easy').slice(0, easyCount);
      const medium = pool.filter(q => q.difficulty === 'medium').slice(0, mediumCount);
      const hard = pool.filter(q => q.difficulty === 'hard').slice(0, hardCount);

      // Fill remaining from any difficulty
      const selected = [...easy, ...medium, ...hard];
      if (selected.length < count) {
        const remaining = pool.filter(q => !selected.includes(q));
        selected.push(...remaining.slice(0, count - selected.length));
      }
      return selected.slice(0, count);
    };

    const mc = filterByDifficulty('mc', cfg.mcCount);
    const fitb = filterByDifficulty('fitb', cfg.fitbCount);
    const calc = filterByDifficulty('calc', cfg.calcCount).map((q, idx, arr) => ({
      ...q,
      points: idx === arr.length - 1 ? 10 : 8
    }));

    setSelectedQuestions([...mc, ...fitb, ...calc]);
  }, []);

  // Total points calculation (fixed to use actual selected questions)
  const totalPoints = useMemo(() => {
    return selectedQuestions.reduce((sum, q) => {
      if (q.type === 'mc') return sum + 3;
      if (q.type === 'fitb') return sum + 4;
      return sum + q.points;
    }, 0);
  }, [selectedQuestions]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      selectQuestions(config);
      setIsGenerating(false);
    }, 800);
  };

  const handleConfigChange = (updates: Partial<ExamConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Replace a single question with a random alternative of the same type
  const handleRegenerateQuestion = (id: string) => {
    const targetIndex = selectedQuestions.findIndex(q => q.id === id);
    if (targetIndex === -1) return;

    const targetType = selectedQuestions[targetIndex].type;
    const currentIds = selectedQuestions.map(q => q.id);

    const alternatives = mockQuestions.filter(
      q => q.type === targetType && !currentIds.includes(q.id)
    );

    if (alternatives.length > 0) {
      const replacement = {
        ...alternatives[Math.floor(Math.random() * alternatives.length)],
        points: selectedQuestions[targetIndex].points
      };
      const updated = [...selectedQuestions];
      updated[targetIndex] = replacement;
      setSelectedQuestions(updated);
    } else {
      alert('题库中无其他可选同题型题目！');
    }
  };

  const handleModifyPoints = (id: string, points: number) => {
    setSelectedQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, points } : q))
    );
  };

  // Reorder questions (for drag-and-drop)
  const handleReorderQuestions = (newOrder: Question[]) => {
    setSelectedQuestions(newOrder);
  };

  const handleLoadCompetitionExam = (examId: string) => {
    const exam = competitionExams.find(e => e.id === examId);
    if (exam) {
      setConfig(prev => ({
        ...prev,
        schoolName: exam.schoolName,
        title: exam.title,
        grade: exam.grade,
        annotation: exam.annotation,
        mcCount: exam.questions.filter(q => q.type === 'mc').length,
        fitbCount: exam.questions.filter(q => q.type === 'fitb').length,
        calcCount: exam.questions.filter(q => q.type === 'calc' || q.type === 'proof').length
      }));
      setSelectedQuestions(exam.questions);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  // P1.2 & P3.2 FIX: Professional OOXML-compliant DOCX exporter with native editable Word math formulas
  const handleExportWord = () => {
    const mcQuestions = selectedQuestions.filter(q => q.type === 'mc');
    const fitbQuestions = selectedQuestions.filter(q => q.type === 'fitb');
    const calcQuestions = selectedQuestions.filter(q => q.type === 'calc' || q.type === 'proof');

    const examChildren: any[] = [
      // School name header
      new Paragraph({
        children: [new TextRun({ text: config.schoolName, bold: true, font: 'SimSun', size: 32 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 }
      }),
      // Title
      new Paragraph({
        children: [new TextRun({ text: `${config.grade}数学${config.term}${config.title}`, bold: true, font: 'SimSun', size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 }
      }),
      // Student details line
      new Paragraph({
        children: [
          new TextRun({ text: "班级：___________    姓名：___________    学号：___________    得分：___________", font: 'SimSun', size: 22 })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 }
      }),
    ];

    // 1. Multiple Choice Questions
    if (mcQuestions.length > 0) {
      examChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `一、 选择题（本大题共 ${mcQuestions.length} 小题，每小题 3 分，共 ${mcQuestions.length * 3} 分）`,
              bold: true,
              font: 'SimSun',
              size: 24
            })
          ],
          spacing: { before: 240, after: 180 }
        })
      );

      mcQuestions.forEach((q, idx) => {
        // Render question text
        examChildren.push(...createParagraphsFromMixedText(q.text, { prefix: `${idx + 1}. ` }));

        if (q.svgDiagram) {
          examChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "（请参考试卷网页版或PDF版本中的几何图形）",
                  italics: true,
                  color: "666666",
                  font: 'SimSun',
                  size: 20
                })
              ],
              spacing: { before: 60, after: 120 }
            })
          );
        }

        // Render options table
        if (q.options && q.options.length > 0) {
          const cols = getOptionColumns(q.options);
          
          if (cols === 4) {
            examChildren.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" }
                },
                rows: [
                  new TableRow({
                    children: q.options.map((opt, oIdx) => (
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: `${String.fromCharCode(65 + oIdx)}. `, bold: true, font: 'SimSun' }),
                              ...parseMixedTextToDocxRuns(stripOptionPrefix(opt))
                            ]
                          })
                        ],
                        width: { size: 25, type: WidthType.PERCENTAGE }
                      })
                    ))
                  })
                ]
              })
            );
          } else if (cols === 2) {
            examChildren.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" }
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "A. ", bold: true, font: 'SimSun' }),
                              ...parseMixedTextToDocxRuns(stripOptionPrefix(q.options[0]))
                            ]
                          })
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "B. ", bold: true, font: 'SimSun' }),
                              ...parseMixedTextToDocxRuns(stripOptionPrefix(q.options[1]))
                            ]
                          })
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                      })
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "C. ", bold: true, font: 'SimSun' }),
                              ...parseMixedTextToDocxRuns(stripOptionPrefix(q.options[2]))
                            ]
                          })
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({ text: "D. ", bold: true, font: 'SimSun' }),
                              ...parseMixedTextToDocxRuns(stripOptionPrefix(q.options[3]))
                            ]
                          })
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                      })
                    ]
                  })
                ]
              })
            );
          } else {
            q.options.forEach((opt, oIdx) => {
              examChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `${String.fromCharCode(65 + oIdx)}. `, bold: true, font: 'SimSun' }),
                    ...parseMixedTextToDocxRuns(stripOptionPrefix(opt))
                  ],
                  spacing: { after: 60 }
                })
              );
            });
          }
        }
      });
    }

    // 2. Fill-in-the-Blank Questions
    if (fitbQuestions.length > 0) {
      examChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `二、 填空题（本大题共 ${fitbQuestions.length} 小题，每小题 4 分，共 ${fitbQuestions.length * 4} 分）`,
              bold: true,
              font: 'SimSun',
              size: 24
            })
          ],
          spacing: { before: 240, after: 180 }
        })
      );

      fitbQuestions.forEach((q, idx) => {
        examChildren.push(...createParagraphsFromMixedText(q.text, { prefix: `${idx + 1 + mcQuestions.length}. ` }));
        if (q.svgDiagram) {
          examChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "（请参考试卷网页版或PDF版本中的几何图形）",
                  italics: true,
                  color: "666666",
                  font: 'SimSun',
                  size: 20
                })
              ],
              spacing: { before: 60, after: 120 }
            })
          );
        }
      });
    }

    // 3. Calculation & Proof Questions
    if (calcQuestions.length > 0) {
      const calcScore = calcQuestions.reduce((s, q) => s + q.points, 0);
      examChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `三、 解答题（本大题共 ${calcQuestions.length} 小题，共 ${calcScore} 分。解答应写出文字说明、证明过程或演算步骤）`,
              bold: true,
              font: 'SimSun',
              size: 24
            })
          ],
          spacing: { before: 240, after: 180 }
        })
      );

      calcQuestions.forEach((q, idx) => {
        examChildren.push(...createParagraphsFromMixedText(q.text, {
          prefix: `${idx + 1 + mcQuestions.length + fitbQuestions.length}. `,
          points: q.points
        }));

        if (q.svgDiagram) {
          examChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "（请参考试卷网页版或PDF版本中的几何图形）",
                  italics: true,
                  color: "666666",
                  font: 'SimSun',
                  size: 20
                })
              ],
              spacing: { before: 60, after: 120 }
            })
          );
        }

        const blankLines = q.points >= 10 ? 5 : 3;
        for (let i = 0; i < blankLines; i++) {
          examChildren.push(new Paragraph({ text: "", spacing: { after: 240 } }));
        }
      });
    }

    // 🔑 ANSWER & SOLUTIONS SECTION
    const answerChildren: any[] = [
      new Paragraph({
        children: [new TextRun({ text: `${config.schoolName}`, bold: true, font: 'SimSun', size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 }
      }),
      new Paragraph({
        children: [new TextRun({ text: `${config.grade}数学${config.term}${config.title} - 参考答案与解析`, bold: true, font: 'SimSun', size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 }
      }),
    ];

    if (mcQuestions.length > 0) {
      answerChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "一、 选择题答案", bold: true, font: 'SimSun', size: 20 })],
          spacing: { before: 180, after: 120 }
        })
      );

      const mcRuns: any[] = [];
      mcQuestions.forEach((q, idx) => {
        mcRuns.push(new TextRun({ text: `${idx + 1}. `, bold: true, font: 'SimSun' }));
        mcRuns.push(new TextRun({ text: `${q.answer}      `, color: "0000FF", font: 'SimSun' }));
      });
      answerChildren.push(new Paragraph({ children: mcRuns, spacing: { after: 240 } }));

      mcQuestions.forEach((q, idx) => {
        answerChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `【解析 ${idx + 1}】`, bold: true, font: 'SimSun', color: "007f5f" }),
              ...parseMixedTextToDocxRuns(q.solution)
            ],
            spacing: { after: 120 }
          })
        );
      });
    }

    if (fitbQuestions.length > 0) {
      answerChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "二、 填空题答案", bold: true, font: 'SimSun', size: 20 })],
          spacing: { before: 180, after: 120 }
        })
      );

      const fitbRuns: any[] = [];
      fitbQuestions.forEach((q, idx) => {
        fitbRuns.push(new TextRun({ text: `${idx + 1 + mcQuestions.length}. `, bold: true, font: 'SimSun' }));
        fitbRuns.push(new TextRun({ text: `${q.answer}      `, color: "0000FF", font: 'SimSun' }));
      });
      answerChildren.push(new Paragraph({ children: fitbRuns, spacing: { after: 240 } }));

      fitbQuestions.forEach((q, idx) => {
        answerChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `【解析 ${idx + 1 + mcQuestions.length}】`, bold: true, font: 'SimSun', color: "007f5f" }),
              ...parseMixedTextToDocxRuns(q.solution)
            ],
            spacing: { after: 120 }
          })
        );
      });
    }

    if (calcQuestions.length > 0) {
      answerChildren.push(
        new Paragraph({
          children: [new TextRun({ text: "三、 解答题答案与步骤解析", bold: true, font: 'SimSun', size: 20 })],
          spacing: { before: 180, after: 120 }
        })
      );

      calcQuestions.forEach((q, idx) => {
        answerChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `第 ${idx + 1 + mcQuestions.length + fitbQuestions.length} 题 （满分 ${q.points} 分）`,
                bold: true,
                font: 'SimSun'
              })
            ],
            spacing: { before: 120, after: 60 }
          })
        );
        answerChildren.push(...createParagraphsFromMixedText(q.solution));
      });
    }

    // Build true Document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440
              }
            }
          },
          children: examChildren
        },
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440
              }
            }
          },
          children: answerChildren
        }
      ]
    });

    Packer.toBlob(doc).then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.schoolName}_${config.grade}_数学_${config.title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }).catch(err => {
      console.error('Word export error:', err);
      alert('导出 Word 文件失败，请查看控制台！');
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f2f0ed]" style={{ fontFamily: 'var(--font-ui)' }}>
      <Sidebar
        config={config}
        onChange={handleConfigChange}
        onGenerate={handleGenerate}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
        isGenerating={isGenerating}
        totalPoints={totalPoints}
        onLoadCompetitionExam={handleLoadCompetitionExam}
      />
      <main className="flex-1 flex flex-col overflow-hidden editor-canvas-bg">
        {/* Top Control Bar — hairline bottom border */}
        <div className="h-12 border-b px-6 flex items-center justify-between no-print z-20" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--toolbar-bg)' }}>
          <div className="flex items-center gap-4">
            <span className="jp-section-title">视图</span>
            <div className="h-3 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <button
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className={`jp-toolbar-btn ${isSimulationMode ? 'active' : ''}`}
            >
              仿真排版 {isSimulationMode ? '·  ON' : '·  OFF'}
            </button>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)' }}>
            <span>草稿自动同步</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
          </div>
        </div>

        <ExamCanvas
          config={config}
          questions={selectedQuestions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRegenerateQuestion={handleRegenerateQuestion}
          onModifyPoints={handleModifyPoints}
          onReorderQuestions={handleReorderQuestions}
          getOptionColumns={getOptionColumns}
          isSimulationMode={isSimulationMode}
        />
      </main>
    </div>
  );
}
