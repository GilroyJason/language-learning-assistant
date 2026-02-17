# 🤖 德语学习助手 - AGENTS.md

> **为AI Agent提供项目操作手册，确保行为可控、可复现**

---

## 1. Mission & Scope（目标与边界）

### ✅ 允许的操作
- 修改 `src/` 目录下的组件代码
- 修改 `public/` 目录下的JSON数据
- 读取 `src/utils/` 工具函数
- 更新 `src/components/` React组件
- 提交符合规范的commit

### ❌ 禁止的操作
- 修改 `vite.config.js` 配置（除非明确要求）
- 删除现有组件（除非明确要求）
- 修改 `tailwind.config.js` 配置
- 修改 `.env` 文件
- 删除数据文件

### ⚠️ 敏感区域
- `german-sentences-sample.json` - 主数据文件（小心修改）
- `courses-data.json` - 教材配置
- `testdaf-sentences.json` - 德福数据
- `business-german-sentences.json` - 商务德语数据

---

## 2. Golden Path（推荐执行路径）

```bash
# 1. 查看项目状态
git status

# 2. 执行任务（如添加新组件）
# ...

# 3. 测试更改
npm run dev

# 4. 提交变更
git add .
git commit -m "feat(component): add XYZ feature"

# 5. 推送更改
git push
```

---

## 3. 技术栈

### 前端
- React 18.3.1
- Vite 5.2.8
- TailwindCSS 3.4.3

### 核心组件
- `App.jsx` - 主应用
- `QuickStart.jsx` - 快速启动页
- `CourseSelector.jsx` - 教材选择
- `SentenceBuilderEnhanced.jsx` - 分词练习

### 数据文件
- `public/german-sentences-sample.json` - 主句子库（314句）
- `public/courses-data.json` - 教材配置
- `public/testdaf-sentences.json` - 德福句子（45句）
- `public/business-german-sentences.json` - 商务德语（36句）

---

## 4. 架构原则

### 文件结构
```
src/
├── components/        # UI组件
├── utils/             # 工具函数
├── data/              # 静态数据
└── services/          # 服务层（courseLoader）
```

### 数据流
```
用户选择教材
  ↓
CourseLoader 加载句子
  ↓
SentenceBuilderEnhanced 练习
  ↓
ProgressTracker 记录进度
  ↓
LocalStorage 持久化
```

---

## 5. 开发流程（Vibe Coding模式）

### ✅ 推荐流程

#### 1. 理解需求
```
用户："我想要XXX功能"
分析：是否需要新组件？还是修改现有组件？
```

#### 2. 搜索现有方案
```
优先级：
1. 检查项目内是否已有类似功能
2. 搜索Tailwind UI组件模式
3. 搜索React组件库
4. 最后考虑自己开发
```

#### 3. 胶水编程实施
```
如果有成熟组件：
- "使用 [组件名] 实现这个功能"
- "集成到现有的 [页面/组件] 中"

如果是新功能：
- "复用 [CourseSelector] 的轮播模式"
- "使用现有的 [ProgressTracker] 记录进度"
- "参考 [SentenceBuilderEnhanced] 的布局结构"
```

#### 4. 代码生成
```
明确要求：
1. 使用现有的样式系统（TailwindCSS + 自定义）
2. 遵循现有的命名规范
3. 集成现有的进度追踪系统
4. 保持全屏/暗黑模式一致性
```

---

## 6. 编码规范

### 文件命名
- React组件：`PascalCase.jsx`（如 `QuickStart.jsx`）
- 工具函数：`camelCase.js`（如 `progressTracker.js`）
- 数据文件：`kebab-case.json`（如 `courses-data.json`）

### Commit Message规范
```
<type>(<scope>): <subject>

类型：
feat: 新功能
fix: 修复bug
docs: 文档更新
refactor: 重构
style: 样式调整
test: 测试
chore: 构建/工具

示例：
feat(quickstart): add daily progress tracking
fix(course): resolve sentence loading issue
docs(readme): update setup instructions
```

### 代码质量
- 单一职责原则
- DRY（不重复）
- 清晰的命名
- 适当的注释

---

## 7. Vibe Coding 示例

### ❌ 错误示例
```
"帮我写一个复习功能的组件，从零开始"
```

### ✅ 正确示例（胶水编程）
```
"我要添加复习功能：
1. 参考 ReviewPractice 组件的结构
2. 使用 progressTracker 获取需要复习的句子
3. 复用 SentenceBuilderEnhanced 的全屏布局
4. 添加到 Header 导航中
5. 集成现有的暗黑模式切换"
```

---

## 8. 常见问题

### Q1: 如何添加新教材？
```bash
1. 在 public/ 创建 [name]-sentences.json
2. 在 courses-data.json 添加教材配置
3. 在 courseLoader.js 添加加载逻辑
```

### Q2: 如何修改每日目标？
```javascript
// QuickStart.jsx 中修改
const [dailyGoal, setDailyGoal] = useState({
  sentences: 50,  // 改为其他数字
  completed: 0,
  timeSpent: 0,
  date: new Date().toDateString()
})
```

### Q3: 如何添加新的快捷键？
```javascript
// SentenceBuilderEnhanced.jsx 中的 useEffect
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'k') {  // Ctrl+K
      e.preventDefault()
      // 你的功能
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

---

## 9. 质量检查清单

### 提交前检查
- [ ] 代码可以在浏览器中正常运行
- [ ] 无console错误
- [ ] 无明显的性能问题
- [ ] 移动端响应式正常
- [ ] 暗黑/亮模式切换正常
- [ ] 进度追踪正常工作

### 代码审查要点
- 是否复用了现有组件？
- 是否遵循了命名规范？
- 是否有明显的代码重复？
- 错误处理是否完善？
- 注释是否清晰？

---

## 10. 扩展指南

### 添加新的学习模式
1. 在 `courses-data.json` 添加新课程
2. 创建对应的句子JSON文件
3. 在 `courseLoader.js` 添加加载逻辑
4. 更新 `App.jsx` 传递正确的props

### 自定义样式
- 优先使用TailwindCSS类
- 新增样式添加到 `tailwind.config.js`
- 全局样式在 `index.css`
- 组件级样式使用 `style` 属性或内联样式

### 数据持久化
- 使用 `localStorage` 保存用户进度
- 使用 `progressTracker` 记录学习历史
- 所有数据保存在浏览器本地

---

**Sources:**
- [tukuaiai/vibe-coding-cn AGENTS.md](https://github.com/tukuaiai/vibe-coding-cn/blob/main/AGENTS.md)
- [Vibe Coding 核心理念](https://github.com/tukuaiai/vibe-coding-cn/blob/main/documents/00-基础指南/胶水编程.md)
- [项目架构文档](D:\german-learning-assistant\README.md)
