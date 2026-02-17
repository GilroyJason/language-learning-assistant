# 🎯 分词填空模式 - 完整功能文档

## ✨ 功能概述

分词填空（Sentence Builder）是一种高效的德语学习模式，灵感来源于 [句乐部](https://julebu.co) 的连词造句设计。

### 核心理念
- **逐词输入** - 每个德语单词对应一个独立输入框
- **即时反馈** - 输入后立即验证正确性
- **流畅交互** - 键盘快捷键支持，无需鼠标
- **视觉引导** - 紫色高亮当前输入位置

---

## 🎮 界面布局

```
┌─────────────────────────────────────────────────────────┐
│ [☰]    中文题干显示          [⚙️][🔊]                    │ Header
├─────────────────────────────────────────────────────────┤
│ █��██─────────────────────────────────── 60%              │ 进度条
└─────────────────────────────────────────────────────────┘

                    📊 120  |  8/15  |  05:23              状态区

┌─────────────────────────────────────────────────────────┐
│                                                         │
│                   中文翻译题目                          │
│            我今天早上吃了一个苹果                        │
│                                                         │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│    │  Heute  │  │   morgen │  │   habe  │  |   ich   │ │
│    └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
│       ← 紫色高亮 →                                      │
│                                                         │
│                  ✓ 正确！ / ✗ 再试试                    │ 反馈
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [<]  [Ctrl+P 播放] [Enter 提交] [Ctrl+; 答案]  [>]      │ 底部控制栏
│                                                  [?]      │
└─────────────────────────────────────────────────────────┘
```

---

## ⌨️ 键盘快捷键

### 核心快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `空格` / `Tab` | 下一个输入框 | 自动跳转并聚焦 |
| `Shift + Tab` | 上一个输入框 | 返回修改 |
| `Backspace` (空输入时) | 上一个输入框 | 快速返回 |
| `Enter` | 提交整句 | 校验所有输入 |
| `Ctrl + P` | 播放德语音频 | TTS朗读句子 |
| `Ctrl + ;` | 显示答案 | 填入正确答案 |

### 操作流程示例

```
1. 看到中文："我有一个待办清单和一个计划"
   └─ 自动聚焦第一个输入框（紫色高亮）

2. 输入 "Ich"，按空格
   └─ 自动跳到下一个输入框

3. 输入 "habe"，按空格
   └─ 继续跳到下一个

4. 输入完成后按 Enter
   └─ 提交整句校验

5. 正确 → 显示绿色，自动进入下一题
   错误 → 显示红色，可继续修改
```

---

## 🧠 状态机设计

### 组件状态

```javascript
{
  // 题目数据
  lessons: [
    {
      id: 'unique-id',
      promptZh: '我有一个待办清单和一个计划',
      answerDeTokens: [
        { text: 'Ich', hasPunctuation: false },
        { text: 'habe', hasPunctuation: false },
        { text: 'eine', hasPunctuation: false },
        { text: 'Todo Liste', hasPunctuation: false },
        { text: 'und', hasPunctuation: false },
        { text: 'einen', hasPunctuation: false },
        { text: 'Plan', hasPunctuation: true }  // 句号
      ],
      audioUrl: null,
      hints: '完整德语句子'
    }
  ],

  // 当前状态
  currentIndex: 0,          // 当前题目索引
  currentWordIndex: 0,      // 当前输入的词索引
  userInputs: [],           // 用户输入的单词数组

  // 反馈状态
  feedback: null,           // 'correct' | 'incorrect' | null
  score: 0,                 // 当前分数
  showAnswers: false,       // 是否显示答案
  isCompleted: false,       // 当前题是否完成

  // 时间
  elapsedTime: 0            // 经过秒数
}
```

### 状态转换流程

```
[初始状态]
    ↓
[聚焦第一个输入框]
    ↓
[用户输入]
    ↓
[空格/Tab] → [跳到下一个输入框]
    ↓
[到达最后一个输入框]
    ↓
[Enter] → [校验整句]
    ↓
[正确] → [显示绿色] → [+100分] → [1.5秒后下一题]
[错误] → [显示红色] → [2秒后清除反馈]
```

---

## 🔤 德语特殊字符容错

### 替换规则

| 用户输入 | 自动转换为 |
|----------|-----------|
| `ae` | `ä` |
| `oe` | `ö` |
| `ue` | `ü` |
| `ss` | `ß` |
| `Ae` | `Ä` |
| `Oe` | `Ö` |
| `Ue` | `Ü` |

### 示例

```javascript
// 用户输入
"userInputs = ['fuer', 'das', 'Auto']"

// 自动匹配
"['für', 'das', 'Auto']"  // ✓ 正确！

// 不需要输入特殊字符
"fuer" == "für"  // ✓ 通过
```

### 实现代码

```javascript
const getGermanReplacement = (text) => {
  return text
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .replace(/ss/g, 'ß')
    .replace(/Ae/g, 'Ä')
    .replace(/Oe/g, 'Ö')
    .replace(/Ue/g, 'Ü')
}

const normalizeInput = (input) => {
  let normalized = input.trim().toLowerCase()
  let withReplacement = getGermanReplacement(normalized)

  return { normalized, withReplacement }
}

// 校验时尝试两种方式
const isCorrect =
  normalized === correctAnswer.toLowerCase() ||
  withReplacement === correctAnswer.toLowerCase()
```

---

## 📝 标点符号处理

### 策略

1. **分离标点** - 标点符号与单词分开存储
   ```javascript
   "Auto." → { text: "Auto", hasPunctuation: true }
   ```

2. **自动显示** - 标点符号自动显示在输入框后
   ```html
   <input /> <span>.</span>
   ```

3. **校验时忽略** - 标点不影响正确性判断

---

## 🎨 视觉设计规范

### 颜色方案

```css
/* 背景色 */
--bg-primary: #000000;        /* 纯黑背景 */
--bg-secondary: #1a1a1a;      /* 输入框背景 */
--bg-hover: #2a2a2a;          /* 悬停背景 */

/* 文字色 */
--text-primary: #ffffff;      /* 主要文字白色 */
--text-secondary: #9ca3af;    /* 次要文字灰色 */
--text-muted: #6b7280;        /* 弱化文字 */

/* 强调色 */
--accent-purple: #8b5cf6;     /* 当前焦点紫色 */
--accent-purple-bg: rgba(139, 92, 246, 0.1);  /* 紫色半透明背景 */

/* 反馈色 */
--success-green: #10b981;     /* 正确绿色 */
--success-bg: rgba(16, 185, 129, 0.1);
--error-red: #ef4444;         /* 错误红色 */
--error-bg: rgba(239, 68, 68, 0.1);

/* 边框色 */
--border-default: #374151;    /* 默认边框 */
--border-current: #8b5cf6;    /* 当前焦点边框 */
--border-success: #10b981;    /* 正确边框 */
--border-error: #ef4444;      /* 错误边框 */
```

### 输入框样式

```css
.input-box {
  /* 尺寸 */
  min-width: 120px;
  padding: 12px 16px;
  font-size: 20px;

  /* 边框 */
  border-bottom: 4px solid;  /* 底部粗边框 */
  border-radius: 0;         /* 无圆角，现代感 */

  /* 背景 */
  background: transparent;
  transition: all 0.2s ease;

  /* 状态样式 */
  &.current {
    border-color: var(--accent-purple);
    background: var(--accent-purple-bg);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }

  &.correct {
    border-color: var(--success-green);
    background: var(--success-bg);
  }

  &.incorrect {
    border-color: var(--error-red);
    background: var(--error-bg);
  }
}
```

---

## 📊 数据结构扩展

### 当前数据结构

```javascript
const lesson = {
  id: string,
  promptZh: string,              // 中文提示
  answerDeTokens: Array<{        // 德语分词
    text: string,                // 单词文本
    hasPunctuation: boolean      // 是否有标点
  }>,
  audioUrl: string | null,       // 音频URL（可选）
  hints: string                  // 完整句子提示
}
```

### 未来可扩展字段

```javascript
const lesson = {
  // ... 现有字段

  // 难度控制
  difficulty: 1-5,               // 难度评级
  tags: ['日常', '工作'],        // 标签

  // 学习统计
  timesPracticed: 0,            // 练习次数
  timesCorrect: 0,              // 正确次数
  lastPracticed: timestamp,     // 最后练习时间
  masteryLevel: 0-100,          // 掌握程度

  // 用户标记
  userMarked: 'learning' | 'mastered' | 'difficult',

  // 个性化
  personalizedHints: [],        // 个性化提示
  wrongCount: 0,                // 错误次数
  commonMistakes: []            // 常见错误
}
```

---

## 🎯 核心算法详解

### 逐词校验算法

```javascript
const checkWord = (index) => {
  const userInput = userInputs[index]
  const correctAnswer = answerDeTokens[index].text

  // 1. 标准化输入（小写、去空格）
  const normalized = userInput.trim().toLowerCase()

  // 2. 应用德语字符替换
  const withReplacement = getGermanReplacement(normalized)

  // 3. 尝试两种匹配方式
  const directMatch = normalized === correctAnswer.toLowerCase()
  const replacementMatch = withReplacement === correctAnswer.toLowerCase()

  return directMatch || replacementMatch
}
```

### 整句校验算法

```javascript
const checkSentence = () => {
  return answerDeTokens.every((token, index) => {
    return checkWord(index)
  })
}
```

### 智能提示算法

```javascript
const getHint = (index) => {
  const correctAnswer = answerDeTokens[index].text
  const userInput = userInputs[index]

  // 显示首字母提示
  if (!userInput) {
    return correctAnswer[0] + '...'
  }

  // 显示正确/错误提示
  const isCorrect = checkWord(index)
  return isCorrect ? '✓' : `提示: ${correctAnswer}`
}
```

---

## 🚀 性能优化

### 1. Ref优化
```javascript
const inputRefs = useRef([])

// 避免重复创建ref
const setRef = (index, el) => {
  if (el) inputRefs.current[index] = el
}
```

### 2. 事件防抖
```javascript
const debouncedCheck = useMemo(
  () => debounce(handleInputChange, 300),
  []
)
```

### 3. 记忆化
```javascript
const normalizedInputs = useMemo(
  () => userInputs.map(normalizeInput),
  [userInputs]
)
```

---

## 🐛 常见问题

### Q1: 输入框无法聚焦？
**A**: 确保没有其他元素覆盖，检查 `z-index`

### Q2: 快捷键不生效？
**A**: 检查是否有全局事件拦截，确保 `e.preventDefault()` 在正确位置

### Q3: 德语特殊字符显示问题？
**A**: 确保文件保存为 UTF-8 编码

### Q4: 移动端适配？
**A**: 需要添加触摸事件支持和虚拟键盘处理

---

## 📱 响应式设计建议

```css
/* 移动端适配 */
@media (max-width: 768px) {
  .input-box {
    min-width: 80px;
    font-size: 16px;  /* 防止iOS自动缩放 */
  }

  .header {
    padding: 12px;
  }

  .shortcut-buttons {
    flex-wrap: wrap;
  }
}
```

---

## 🎓 使用建议

1. **初次使用** - 先用 `Ctrl+;` 查看答案，熟悉句子
2. **练习模式** - 逐词输入，使用空格快速跳转
3. **挑战模式** - 不看答案，尽量一次通过
4. **复习模式** - 专注于之前标记为"困难"的句子

---

## 🔮 未来功能规划

- [ ] 语音识别（STT）- 说出德语单词自动填入
- [ ] 智能纠错 - 显示常见错误提示
- [ ] 学习曲线 - 根据正确率调整难度
- [ ] 社交功能 - 与朋友对比进度
- [ ] 成就系统 - 解锁徽章和奖励
- [ ] 自定义句子 - 用户添加自己的学习内容

---

**状态**: ✅ 已完成
**版本**: 1.0.0
**最后更新**: 2026-02-16

**Enjoy learning German! Viel Spaß beim Deutschlernen!** 🇩🇪
