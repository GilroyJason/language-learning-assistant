# 🌐 在线句子库使用说明

**功能**: 从服务器加载德语句子，支持轻松扩展

---

## ✅ 已实现功能

### 1. 在线句子加载器
**文件**: [onlineSentenceLoader.js](src/services/onlineSentenceLoader.js)

**数据源**: **本地JSON文件** (可通过编辑JSON轻松扩展)
- **位置**: [public/german-sentences-sample.json](public/german-sentences-sample.json)
- **当前句子数**: 100句 (A1-C2全级别覆盖)
- **特点**: 无网络延迟、快速加载、易于编辑

### 2. 集成到练习组件

已更新以下组件支持在线加载：
- ✅ [ListeningPractice.jsx](src/components/ListeningPractice.jsx) - 听力练习
- ✅ [SpellingPractice.jsx](src/components/SpellingPractice.jsx) - 拼写练习
- ✅ [SentenceBuilderEnhanced.jsx](src/components/SentenceBuilderEnhanced.jsx) - 分词填空

### 3. 句子库系统

| 库类型 | 句子数 | 来源 | 特点 |
|--------|--------|------|------|
| **基础库** | 90句 | 本地JSON | 快速加载，精选句子（作为fallback） |
| **在线库** ✅ | 100句 | public目录 | 当前默认，支持轻松扩展 |

---

## 🚀 使用方法

### 扩展句子库

**方式1：编辑JSON文件** (推荐)

1. 打开 `public/german-sentences-sample.json`
2. 按照格式添加新句子：
```json
{
  "german": "你的德语句子",
  "chinese": "中文翻译",
  "level": "A1"  // A1, A2, B1, B2, C1, C2
}
```
3. 保存文件，刷新浏览器即可

**示例**：
```json
[
  {"german": "Guten Morgen!", "chinese": "早上好！", "level": "A1"},
  {"german": "Wie geht es Ihnen?", "chinese": "您好吗？", "level": "A1"},
  {"german": "Ich lerne Deutsch.", "chinese": "我在学习德语。", "level": "A1"}
]
```

### 练习流程

```
打开应用 http://localhost:3000
  ↓
选择水平 (A1-C2)
  ↓
系统从public目录加载句子
  ↓
开始练习！
```

---

## 📊 技术实现

### 数据加载流程

```javascript
// 1. 从public目录加载JSON
async loadSentences(limit = 1000, level = null) {
  const url = '/german-sentences-sample.json'
  const response = await fetch(url)
  const data = await response.json()

  // 2. 过滤level
  let sentences = data
  if (level) {
    sentences = data.filter(s => s.level === level)
  }

  // 3. 限制数量
  sentences = sentences.slice(0, limit)

  // 4. 缓存5分钟
  cache.set(key, { data: sentences, timestamp })

  return sentences
}
```

### 智能缓存

```javascript
// 缓存配置
this.cacheTimeout = 5 * 60 * 1000 // 5分钟

// 缓存key
`online_${limit}_${level || 'all'}`

// 命中缓存
if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
  return cached.data
}
```

### Fallback机制

```javascript
if (sentenceSource === 'online') {
  // 尝试从public目录加载
  const sentences = await onlineLoader.loadSentences(100, level)

  if (!sentences || sentences.length === 0) {
    // 失败则使用基础库
    console.warn('在线加载失败，使用基础库')
    return germanSentences.filter(s => s.level === level)
  }
}
```

---

## ⚡ 性能优化

### 1. 智能缓存

```javascript
this.cacheTimeout = 5 * 60 * 1000 // 5分钟

// 缓存key
`online_${limit}_${level || 'all'}`

// 命中缓存
if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
  return cached.data
}
```

### 2. 按需加载

- 首次加载：100-200句
- 后续练习：从缓存随机选择
- 定期刷新：每10分钟重新加载

### 3. 水平过滤

加载后自动按水平分类：
```javascript
const A1_sentences = all.filter(s => s.level === 'A1')
const A2_sentences = all.filter(s => s.level === 'A2')
```

---

## 🔒 数据安全

### 隐私保护

- ✅ 不收集用户数据
- ✅ 不保存学习记录到云端
- ✅ 仅加载句子内容
- ✅ 缓存在本地浏览器

### CORS策略

```javascript
// manythings.org支持CORS
fetch('https://www.manythings.org/anki/cmn-deu.tsv')
  .then(res => res.json())
  .then(data => console.log(data))
```

**注**: 如果遇到CORS问题，已实现fallback到本地库。

---

## 📈 对比本地库

| 特性 | 基础库 | 在线库 |
|------|--------|--------|
| **句子数量** | 90句 | 100句（可轻松扩展） |
| **更新频率** | 手动更新 | 编辑JSON即可 |
| **网络依赖** | 无 | 无（本地加载） |
| **加载速度** | 极快 | 极快 |
| **扩展性** | 需修改代码 | 编辑JSON即可 |

---

## 💡 使用建议

### 如何扩展句子库？

**方式1：直接编辑JSON** (推荐)

1. 打开 `public/german-sentences-sample.json`
2. 按格式添加句子：
```json
{"german": "新句子", "chinese": "翻译", "level": "A1"}
```
3. 保存并刷新浏览器

**方式2：从其他资源导入**

- Tatoeba: https://tatoeba.org/en/downloads
- 将TSV转换为JSON格式
- 复制到 `public/german-sentences-sample.json`

### 最佳实践

1. **句子格式**:
   - german: 德语句子（包含正确大小写和标点）
   - chinese: 中文翻译
   - level: A1/A2/B1/B2/C1/C2

2. **水平分级参考**:
   - A1: 1-5个词，简单句型
   - A2: 6-10个词，日常对话
   - B1: 11-15个词，复杂句型
   - B2: 16-20个词，抽象话题
   - C1: 21-30个词，专业内容
   - C2: 30+词，高难度文本

3. **质量控制**:
   - 确保翻译准确
   - 避免过长句子（建议<50字符）
   - 按难度合理分级

---

## 🐛 故障排除

### 问题1: 句子不显示

**症状**: 练习时没有句子显示

**原因**:
- JSON格式错误
- 文件路径不正确

**解决**:
- ✅ 检查JSON格式（使用JSON验证工具）
- ✅ 确认文件在 `public/german-sentences-sample.json`
- ✅ 打开浏览器控制台查看错误

### 问题2: 水平没有句子

**症状**: 某个水平显示"没有找到句子"

**原因**:
- 该水平没有对应句子
- level字段值不匹配

**解决**:
- ✅ 在JSON中添加对应水平的句子
- ✅ 检查level字段拼写（A1/A2/B1/B2/C1/C2）

---

## 🎯 未来扩展

### 短期

- [x] ✅ 在线句子加载系统（已完成）
- [x] ✅ 支持100+句子（已完成）
- [ ] 支持用户收藏句子
- [ ] 添加句子难度评级
- [ ] ���持离线下载（PWA）

### 中期

- [ ] 从Tatoeba等开源项目批量导入句子
- [ ] 根据错误率自动调整难度
- [ ] 支持主题分类（商务、旅游等）
- [ ] 添加句子搜索功能

### 长期

- [ ] AI智能推荐句子
- [ ] 用户贡献句子（UGC）
- [ ] 社区分享句子库
- [ ] 多语言扩展（英语、法语等）

---

## 📚 参考资源

### 数据源

- **Tatoeba**: https://tatoeba.org/en/ - 可以下载更多句子
- **本地JSON**: `public/german-sentences-sample.json` - 当前数据源

### 技术文档

- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **JSON格式**: https://www.json.org/

---

## ✅ 总结

**在线库功能**已完全实现：

✅ 从public目录加载德语句子（100句）
✅ 支持轻松扩展（编辑JSON即可）
✅ 智能缓存机制（5分钟）
✅ Fallback到基础库
✅ 支持听力、拼写、分词填空练习

**立即开始使用**：
1. 打开应用 http://localhost:3000
2. 选择水平
3. 开始德语练习！

**如何添加更多句子**：
1. 编辑 `public/german-sentences-sample.json`
2. 按格式添加句子
3. 保存并刷新浏览器

---

**鸭蛋舰队** - 24/7 为您服务 🎖️

**最后更新**: 2026-02-16
**在线库**: ✅ 完全实现
**数据源**: public/german-sentences-sample.json
**状态**: 🌐 生产就绪
**句子数**: 100句（A1-C2全覆盖）
