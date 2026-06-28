export interface Section {
  id: string;
  name: string;
  concepts?: string[];
}

export interface Chapter {
  id: string;
  name: string;
  sections: Section[];
}

export interface GradeCurriculum {
  grade: string;
  term: string;
  chapters: Chapter[];
}

export const curriculumData: GradeCurriculum[] = [
  // ==========================================
  // 七年级上学期
  // ==========================================
  {
    grade: '七年级',
    term: '上学期',
    chapters: [
      {
        id: 'g7-ch1',
        name: '第一章 有理数',
        sections: [
          { id: 'g7-s1-1', name: '1.1 正数和负数', concepts: ['正数', '负数'] },
          { id: 'g7-s1-2', name: '1.2 有理数', concepts: ['数轴', '相反数', '绝对值'] },
          { id: 'g7-s1-3', name: '1.3 有理数的加减法', concepts: ['加法法则', '减法法则'] }
        ]
      },
      {
        id: 'g7-ch2',
        name: '第二章 一元一次方程',
        sections: [
          { id: 'g7-s2-1', name: '2.1 等式的性质', concepts: ['等式性质'] },
          { id: 'g7-s2-2', name: '2.2 解一元一次方程', concepts: ['合并同类项', '移项', '去括号', '去分母'] }
        ]
      }
    ]
  },
  // ==========================================
  // 八年级上学期
  // ==========================================
  {
    grade: '八年级',
    term: '上学期',
    chapters: [
      {
        id: 'g8-ch1',
        name: '第一章 整式的乘法与因式分解',
        sections: [
          { id: 'g8-s1-1', name: '1.1 整式的乘法', concepts: ['幂的运算', '整式乘法'] },
          { id: 'g8-s1-2', name: '1.2 乘法公式', concepts: ['平方差公式', '完全平方公式'] },
          { id: 'g8-s1-3', name: '1.3 因式分解', concepts: ['提公因式法', '公式法'] }
        ]
      },
      {
        id: 'g8-ch2',
        name: '第二章 分式',
        sections: [
          { id: 'g8-s2-1', name: '2.1 分式及其基本性质', concepts: ['分式概念', '基本性质'] },
          { id: 'g8-s2-2', name: '2.2 分式的运算', concepts: ['乘除运算', '加减运算', '混合运算'] },
          { id: 'g8-s2-3', name: '2.3 分式方程', concepts: ['解分式方程', '实际应用'] }
        ]
      },
      {
        id: 'g8-ch3',
        name: '第三章 勾股定理与直角三角形',
        sections: [
          { id: 'g8-s3-1', name: '3.1 勾股定理', concepts: ['勾股定理计算'] },
          { id: 'g8-s3-2', name: '3.2 勾股定理的逆定理', concepts: ['直角三角形判定'] }
        ]
      },
      {
        id: 'g8-ch4',
        name: '第四章 数据的分析与统计',
        sections: [
          { id: 'g8-s4-1', name: '4.1 数据的平均水平与集中趋势', concepts: ['平均数', '中位数', '众数'] },
          { id: 'g8-s4-2', name: '4.2 数据的波动程度', concepts: ['极差', '方差', '标准差'] }
        ]
      },
      {
        id: 'g8-ch5',
        name: '第五章 几何证明与多边形',
        sections: [
          { id: 'g8-s5-1', name: '5.1 平行四边形的性质与判定', concepts: ['平行四边形性质', '平行四边形判定'] },
          { id: 'g8-s5-2', name: '5.2 特殊的平行四边形', concepts: ['矩形', '菱形', '正方形'] }
        ]
      }
    ]
  },
  // ==========================================
  // 九年级上学期
  // ==========================================
  {
    grade: '九年级',
    term: '上学期',
    chapters: [
      {
        id: 'g9-ch1',
        name: '第一章 一元二次方程',
        sections: [
          { id: 'g9-s1-1', name: '1.1 一元二次方程概念', concepts: ['标准形式'] },
          { id: 'g9-s1-2', name: '1.2 解一元二次方程', concepts: ['配方法', '公式法', '因式分解法'] },
          { id: 'g9-s1-3', name: '1.3 根的判别式与韦达定理', concepts: ['判别式', '韦达定理'] }
        ]
      },
      {
        id: 'g9-ch2',
        name: '第二章 二次函数',
        sections: [
          { id: 'g9-s2-1', name: '2.1 二次函数的图象与性质', concepts: ['解析式', '对称轴', '顶点'] },
          { id: 'g9-s2-2', name: '2.2 二次函数与一元二次方程', concepts: ['交点问题', '最值应用'] }
        ]
      }
    ]
  }
];
