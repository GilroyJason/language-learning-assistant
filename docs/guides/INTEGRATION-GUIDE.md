# 🎧 德语播客自动学习系统 - 完整集成指南

## 📋 系统架构

```
gPodder下载音频
  ↓
Whisper生成字幕（带时间戳）
  ↓
解析SRT → 分割成句子
  ↓
生成JSON练习集
  ↓
前端加载 → 逐句练习
```

---

## 🚀 快速开始

### 1. 安装Whisper

```bash
pip install openai-whisper
```

### 2. 运行字幕生成脚本

```bash
cd D:\german-learning-assistant
python generate-subtitles.py
```

**输出**：
- `practice-sets/音频名/audio.mp3` - 原音频
- `practice-sets/音频名/audio.srt` - 字幕文件
- `practice-sets/音频名/audio_practice.json` - 练习集

### 3. JSON格式示例

```json
{
  "audioFile": "LGN_20250216.mp3",
  "totalSentences": 45,
  "sentences": [
    {
      "id": 1,
      "start": 0.0,
      "end": 5.42,
      "duration": 5.42,
      "german": "Guten Morgen, und herzlich willkommen zur Tagesschau.",
      "translation": "",
      "completed": false,
      "attempts": 0
    },
    {
      "id": 2,
      "start": 5.42,
      "end": 10.15,
      "duration": 4.73,
      "german": "Heute ist Freitag, der 14. Februar 2026.",
      "translation": "",
      "completed": false,
      "attempts": 0
    }
  ]
}
```

---

## 📊 每日工作流程

### 新音频发布（比如每天早上）

```bash
# 1. gPodder自动下载新音频（已配置）
# 2. 运行字幕生成
python generate-subtitles.py

# 3. 刷新浏览器
# 4. 选择最新的练习集
```

---

## 🎯 前端集成

### 组件结构

```jsx
<PracticeSetSelector>
  ↓ 显示所有练习集（按日期排序）
<PracticePlayer>
  ↓ 加载JSON练习集
  ↓ 逐句播放和练习
  ↓ 记录进度
```

### 功能特性

1. **音频分段播放**
   - 根据时间戳自动播放每句
   - 可以重播当前句
   - 自动跳到下一句

2. **听写练习**
   - 播放一句
   - 用户输入德语
   - 自动验证（或自我评估）
   - 记录完成状态

3. **进度追踪**
   - 已完成句子数
   - 练习历史
   - 统计数据

---

## 📁 文件结构

```
german-learning-assistant/
├── practice-sets/              # 练习集目录
│   ├── LGN_20250216/
│   │   ├── audio.mp3
│   │   ├── audio.srt
│   │   └── audio_practice.json
│   └── logo_20250216/
│       └── ...
├── generate-subtitles.py       # 字幕生成脚本
├── src/
│   └── components/
│       ├── PracticeSetSelector.jsx  # 练习集选择器
│       ├── PracticePlayer.jsx        # 练习播放器
│       └── SentencePractice.jsx      # 单句练习
```

---

## 🔧 高级功能

### 1. 自动翻译

集成DeepL API翻译字幕：
```python
# 集成到generate-subtitles.py
from deepl import Translator
translator = Translator("YOUR_API_KEY")
result = translator.translate_text(sentence['german'], target_lang="ZH")
```

### 2. 自动同步

设置Windows计划任务，每天自动：
- 更新gPodder
- 生成字幕
- 创建练习集

### 3. 云端同步

将练习集上传到数据库，多设备同步

---

## 📈 数据统计

- 总练习集数量
- 每个集的句子数
- 完成进度
- 学习时长统计

---

## 🎓 学习模式

### 模式1：听写模式
- 播放句子
- 用户输入
- 验证答案

### 模式2：跟读模式
- 播放句子
- 用户跟读
- AI评分发音（可选）

### 模式3：填空模式
- 显示部分文字
- 用户填空

---

**完全自动化，每天只需运行一次脚本！** 🎉
