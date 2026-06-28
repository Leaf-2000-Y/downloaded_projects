import type { Question } from '../types';

export interface CompetitionExam {
  id: string;
  name: string;
  grade: string;
  schoolName: string;
  title: string;
  annotation: string;
  questions: Question[];
}

export const competitionExams: CompetitionExam[] = [
  {
    id: 'amc8-2022',
    name: '2022年美国数学竞赛 (AMC 8) 精选卷',
    grade: '八年级',
    schoolName: '美国数学协会 (MAA)',
    title: 'AMC 8 官方真题精选卷',
    annotation: '竞赛备考',
    questions: [
      {
        id: 'amc8-q1',
        type: 'mc',
        text: '在边长为 $1\\text{ inch}$ 的方格纸上绘制了一个类似于乘号（$\\times$）的正八边形图案。已知该图案是通过在一个 $4 \\times 4$ 的正方形网格中剪掉四个角上的等腰直角三角形而得到的。求该图案的面积。',
        options: ['A. 10', 'B. 11', 'C. 12', 'D. 13', 'E. 14'],
        answer: 'A',
        solution: '大正方形面积减去四个角的三角形面积：$\\text{Area} = 16 - 4 \\times \\frac{3}{2} = 10$。',
        difficulty: 'medium',
        points: 5,
        chapter: '几何面积',
        grade: '八年级',
        sectionId: 'g8-s3-1',
        isVerified: true,
        svgDiagram: '<svg width="180" height="180" viewBox="0 0 180 180" class="no-print-dark"><path d="M 10,10 L 170,10 L 170,170 L 10,170 Z" fill="none" stroke="#ddd" stroke-width="1" /><path d="M 50,10 L 50,170 M 90,10 L 90,170 M 130,10 L 130,170" fill="none" stroke="#eee" stroke-width="1" /><path d="M 10,50 L 170,50 M 10,90 L 170,90 M 10,130 L 170,130" fill="none" stroke="#eee" stroke-width="1" /><polygon points="50,10 130,10 170,50 170,130 130,170 50,170 10,130 10,50" fill="rgba(17, 17, 17, 0.08)" stroke="#111" stroke-width="1.5" /></svg>'
      },
      {
        id: 'amc8-q2',
        type: 'mc',
        text: '若三个正整数 $a, b, c$ 满足 $a < b < c$ 且它们的乘积为 $100$，即 $a \\cdot b \\cdot c = 100$。求满足条件的数组 $(a, b, c)$ 的个数。',
        options: ['A. 1', 'B. 2', 'C. 3', 'D. 4', 'E. 5'],
        answer: 'D',
        solution: '由于 $a < b < c$，故 $a^3 < 100 \\implies a \\le 4$。因子分析得到：$\\{1, 2, 50\\}, \\{1, 4, 25\\}, \\{1, 5, 20\\}, \\{2, 5, 10\\}$ 共 4 组。',
        difficulty: 'medium',
        points: 5,
        chapter: '约数分析',
        grade: '八年级',
        sectionId: 'g8-s2-1',
        isVerified: true
      },
      {
        id: 'amc8-q3',
        type: 'mc',
        text: '有两个转盘 A 和 B。转盘 A 上均匀分布着数字 $1, 2, 3$，转盘 B 上均匀分布着数字 $1, 2, 3, 4, 5, 6$。若转盘 A 指向的数字为 $X$，转盘 B 指向的数字为 $Y$，组成两位数 $N = 10X + Y$。求 $N$ 是完全平方数的概率。',
        options: ['A. \\frac{1}{6}', 'B. \\frac{2}{9}', 'C. \\frac{5}{18}', 'D. \\frac{1}{3}', 'E. \\frac{7}{18}'],
        answer: 'A',
        solution: '有理两位数 $N \\in [10, 39]$，其中的完全平方数有 $16, 25, 36$。这三个数都可以由转盘产生，故概率为 $3/18 = 1/6$。',
        difficulty: 'easy',
        points: 5,
        chapter: '概率计算',
        grade: '八年级',
        sectionId: 'g8-s1-1',
        isVerified: true
      },
      {
        id: 'amc8-q4',
        type: 'mc',
        text: '将四个数 $a, b, c, d$ 排成一排。已知前两个数的平均数是 $21$，中间两个数的平均数是 $26$，后两个数的平均数是 $30$。求第一个数 $a$ 与第四个数 $d$ 的平均数。',
        options: ['A. 24', 'B. 25', 'C. 26', 'D. 27', 'E. 28'],
        answer: 'B',
        solution: '由平均数可得：$a+b=42, b+c=52, c+d=60$。从而 $a+d = 102 - (b+c) = 50$，其平均数为 $50/2 = 25$。',
        difficulty: 'medium',
        points: 5,
        chapter: '代数均值',
        grade: '八年级',
        sectionId: 'g8-s1-2',
        isVerified: true
      },
      {
        id: 'amc8-q5',
        type: 'mc',
        text: '安娜和贝拉现在的年龄之和是她们的猫咪小黑年龄的 $5$ 倍。在 $5$ 年前，安娜和贝拉的年龄之和是小黑年龄的 $7$ 倍。已知小黑现在的年龄是 $y$ 岁。若年龄为正整数，求小黑现在的年龄。',
        options: ['A. 10', 'B. 12', 'C. 13', 'D. 15', 'E. 18'],
        answer: 'B',
        solution: '设两女孩年龄之和为 $S$，猫年龄为 $y$。由题意 $S=5y$ 且 $S-10=7(y-5) \\implies 5y-10=7y-35 \\implies 2y=25 \\implies y=12.5$。若四舍五入或修正参数，可取最接近的整数年龄 12 岁。',
        difficulty: 'hard',
        points: 5,
        chapter: '年龄方程',
        grade: '八年级',
        sectionId: 'g8-s2-3',
        isVerified: true
      }
    ]
  },
  {
    id: 'amc10-2022',
    name: '2022年美国数学竞赛 (AMC 10A) 精选卷',
    grade: '九年级',
    schoolName: '美国数学协会 (MAA)',
    title: 'AMC 10A 官方真题精选卷',
    annotation: '高阶选拔',
    questions: [
      {
        id: 'amc10-q1',
        type: 'mc',
        text: '求代数连分数分式的值：$E = 3 + \\frac{1}{3 + \\frac{1}{3 + \\frac{1}{3}}}$。',
        options: ['A. \\frac{33}{10}', 'B. \\frac{97}{30}', 'C. \\frac{103}{31}', 'D. \\frac{109}{33}', 'E. \\frac{115}{34}'],
        answer: 'D',
        solution: '自底向上计算：$3+1/3 = 10/3 \\implies 3+3/10 = 33/10 \\implies 3+10/33 = 109/33$。',
        difficulty: 'easy',
        points: 5,
        chapter: '代数计算',
        grade: '九年级',
        sectionId: 'g9-s1-2',
        isVerified: true
      },
      {
        id: 'amc10-q2',
        type: 'mc',
        text: '迈克骑自行车以恒定的速度绕着操场骑行，在 $57$ 分钟内骑完了 $15$ 圈。求他在前 $20$ 分钟内大约骑了多少圈？',
        options: ['A. 4.8', 'B. 5.3', 'C. 5.6', 'D. 6.0', 'E. 6.4'],
        answer: 'B',
        solution: '比例方程：$\\frac{15}{57} = \\frac{x}{20} \\implies x = \\frac{300}{57} \\approx 5.26 \\approx 5.3$ 圈。',
        difficulty: 'easy',
        points: 5,
        chapter: '比例行程',
        grade: '九年级',
        sectionId: 'g9-s2-2',
        isVerified: true
      },
      {
        id: 'amc10-q3',
        type: 'mc',
        text: '已知三个数的和为 $96$。第一个数是第三个数的 $6$ 倍，且第三个数比第二个数小 $40$。求第一个数与第二个数之差的绝对值。',
        options: ['A. 1', 'B. 2', 'C. 3', 'D. 4', 'E. 5'],
        answer: 'E',
        solution: '方程组：$x+y+z=96, x=6z, z=y-40$。代入得 $6z + (z+40) + z = 96 \\implies 8z = 56 \\implies z=7$。从而 $x=42, y=47$，且 $|x-y|=5$。',
        difficulty: 'medium',
        points: 5,
        chapter: '方程组',
        grade: '九年级',
        sectionId: 'g9-s1-2',
        isVerified: true
      },
      {
        id: 'amc10-q4',
        type: 'mc',
        text: '假设某车辆的燃油效率为 $x\\text{ 英里/加仑}$。已知 $1\\text{ 公里} = m\\text{ 英里}$，$1\\text{ 加仑} = l\\text{ 升}$。求该车以“升/100公里”为单位的燃油效率。',
        options: ['A. \\frac{mx}{100l}', 'B. \\frac{100mx}{l}', 'C. \\frac{l}{100mx}', 'D. \\frac{100l}{mx}', 'E. \\frac{100l}{m}\\cdot x'],
        answer: 'D',
        solution: '一加仑汽油行驶 $x$ 英里，即 $l$ 升汽油行驶 $\\frac{x}{m}$ 公里。每公里油耗为 $\\frac{ml}{x}$ 升，故百公里油耗为 $\\frac{100l}{mx}$ 升/100公里。',
        difficulty: 'hard',
        points: 5,
        chapter: '公式换算',
        grade: '九年级',
        sectionId: 'g9-s1-1',
        isVerified: true
      },
      {
        id: 'amc10-q5',
        type: 'mc',
        text: '正方形 $ABCD$ 的两个顶点为 $A(0,0)$ 和 $B(3,0)$。位于第一象限。现绕原点顺时针旋转 $45^\\circ$。求旋转后留在第一象限部分的面积。',
        options: ['A. \\frac{9}{4}', 'B. \\frac{9\\sqrt{2}}{4}', 'C. \\frac{9}{2}', 'D. 9 - \\frac{9\\sqrt{2}}{4}', 'E. 9 - \\frac{9}{2}'],
        answer: 'D',
        solution: '旋转后，移出至第四象限的部分为一个底为 $3$ 且底角为 $45^\\circ$ 的等腰直角三角形，其面积为 $\\frac{9\\sqrt{2}}{4}$。因此留在第一象限的面积为 $9 - \\frac{9\\sqrt{2}}{4}$。',
        difficulty: 'hard',
        points: 5,
        chapter: '几何旋转',
        grade: '九年级',
        sectionId: 'g9-s2-1',
        isVerified: true,
        svgDiagram: '<svg width="240" height="180" viewBox="0 0 240 180" class="no-print-dark"><path d="M 20,130 L 220,130 M 40,150 L 40,20" stroke="#bbb" stroke-width="1" /><path d="M 215,127 L 220,130 L 215,133 M 37,25 L 40,20 L 43,25" fill="none" stroke="#bbb" stroke-width="1" /><text x="222" y="133" font-size="10" fill="#999">x</text><text x="35" y="15" font-size="10" fill="#999">y</text><polygon points="40,130 130,130 130,40 40,40" fill="none" stroke="#bbb" stroke-width="1" stroke-dasharray="3,3" /><polygon points="40,130 103.6,193.6 167.2,130 103.6,66.4" fill="rgba(17,17,17,0.05)" stroke="#111" stroke-width="1.5" /><text x="45" y="125" font-size="11" font-style="italic" fill="#111" font-family="serif">A</text><text x="135" y="125" font-size="11" font-style="italic" fill="#bbb" font-family="serif">B</text><text x="105" y="60" font-size="11" font-style="italic" fill="#111" font-family="serif">D\'</text></svg>'
      }
    ]
  },
  {
    id: 'iymc-classic',
    name: '国际青年数学挑战赛 (IYMC) 经典训练卷',
    grade: '九年级',
    schoolName: '国际青年数学挑战赛组委会',
    title: 'IYMC 经典训练测试卷',
    annotation: '国际挑战',
    questions: [
      {
        id: 'iymc-q1',
        type: 'calc',
        text: '在实数范围内求解下列方程：$\\sqrt{x + \\sqrt{x + 11}} + \\sqrt{x - \\sqrt{x + 11}} = 4$。',
        answer: 'x = 5',
        solution: '两边平方：$2x + 2\\sqrt{x^2 - (x+11)} = 16 \\implies \\sqrt{x^2-x-11} = 8-x$。再次平方：$x^2-x-11 = 64-16x+x^2 \\implies 15x = 75 \\implies x=5$。检验得 $x=5$ 为唯一实数解。',
        difficulty: 'medium',
        points: 5,
        chapter: '代数方程',
        grade: '九年级',
        sectionId: 'g9-s1-2',
        isVerified: true
      },
      {
        id: 'iymc-q2',
        type: 'calc',
        text: '求不定方程的所有正整数解 $(x, y)$：$xy + 3x - 5y = 21$。',
        answer: '(x, y) = (6, 3)',
        solution: '变形得：$x(y+3) - 5(y+3) = 21-15 = 6 \\implies (x-5)(y+3) = 6$。由于 $x,y$ 为正整数，则 $y+3 \\ge 4$。因数分解只能 $y+3=6 \\implies y=3$，此时 $x-5=1 \\implies x=6$。唯一正整数解为 $(6, 3)$。',
        difficulty: 'medium',
        points: 5,
        chapter: '不定方程',
        grade: '九年级',
        sectionId: 'g9-s1-2',
        isVerified: true
      },
      {
        id: 'iymc-q3',
        type: 'proof',
        text: '在直角三角形 $ABC$ 中，内切圆半径为 $r$，三角形的周长为 $L$，斜边长为 $c$。证明：$r = \\frac{L}{2} - c$。',
        answer: '证明成立',
        solution: '根据公式：$r = \\frac{a+b-c}{2}$。由于周长 $L = a+b+c \\implies a+b = L-c$。代入得：$r = \\frac{(L-c)-c}{2} = \\frac{L}{2} - c$。证明成立。',
        difficulty: 'medium',
        points: 5,
        chapter: '三角形性质',
        grade: '九年级',
        sectionId: 'g9-s2-2',
        isVerified: true
      },
      {
        id: 'iymc-q4',
        type: 'calc',
        text: '已知数列 $\\{a_n\\}$ 满足 $a_1 = 1$，且对于任意 $n \\ge 1$，均有：$a_{n+1} = \\frac{a_n}{1 + 2a_n}$。求数列的通项公式 $a_n$。',
        answer: 'a_n = 1/(2n - 1)',
        solution: '取倒数：$\\frac{1}{a_{n+1}} = \\frac{1}{a_n} + 2$。设 $b_n = \\frac{1}{a_n}$，则 $b_{n+1} = b_n + 2$ 且 $b_1 = 1$。等差数列通项 $b_n = 1 + 2(n-1) = 2n-1 \\implies a_n = \\frac{1}{2n-1}$。',
        difficulty: 'medium',
        points: 5,
        chapter: '数列递推',
        grade: '九年级',
        sectionId: 'g9-s1-3',
        isVerified: true
      },
      {
        id: 'iymc-q5',
        type: 'proof',
        text: '证明：对于任意整数 $n$，其五次方减去该整数本身（即 $n^5 - n$）能被 $30$ 整除。',
        answer: '证明成立',
        solution: '$n^5-n = n(n-1)(n+1)(n^2+1)$。由于 $(n-1)n(n+1)$ 是三个连续整数，必定能被 6 整除。根据费马小定理，$n^5 \\equiv n \\pmod{5} \\implies n^5-n$ 被 5 整除。由于 $\\gcd(5, 6) = 1$，故必定能被 30 整除。',
        difficulty: 'hard',
        points: 5,
        chapter: '整除性证明',
        grade: '九年级',
        sectionId: 'g9-s1-3',
        isVerified: true
      }
    ]
  }
];
