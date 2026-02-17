# 🎧 德语播客自动学习系统

## ✅ 已配置的功��

### 1. gPodder自动下载
- **订阅的播客**:
  - DW慢速新闻
  - Logo!儿童新闻
  - Easy German

- **下载设置**:
  - ✅ 自动下载新episode（需要手动配置）
  - ✅ 只保留最新10集
  - ✅ 自动删除已播放的
  - ✅ 30天后自动清理旧文件

### 2. 字幕自动下载
- **支持的字幕格式**: .txt, .transcript, .srt, .vtt
- **自动匹配**: 字幕文件名与音频文件名相同
- **下载位置**: 与音频文件在同一目录

### 3. 后端字幕支持
- **API端点**: `/api/audio/transcript/:id`
- **功能**: 读取并返回字幕文件内容
- **自动检测**: 扫描目录时自动查找字幕文件

---

## 🚀 使用方法

### 方法1: 手动运行更新脚本

```bash
# 运行完整更新（播客+字幕）
D:\german-learning-assistant\run-update-all.bat
```

这个脚本会：
1. 更新gPodder订阅
2. 下载新音频
3. 下载DW字幕

### 方法2: 设置Windows计划任务（自动运行）

```bash
# 以管理员身份运行
D:\german-learning-assistant\setup-scheduled-task.bat
```

配置：
- **运行时间**: 每天凌晨2点（可在任务计划程序中���改）
- **任务名称**: gPodder每日更新
- **执行内容**: 更新播客 + 下载字幕

---

## 📂 文件位置

### 音频文件
```
C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads\
├── Langsam Gesprochene Nachrichten _ Audios _ DW Deutsch lernen\
│   ├── LGN_20250216.mp3
│   └── LGN_20250216.txt  (字幕)
├── logo!-Nachrichten (AUDIO)\
│   └── ...
└── Easy German\
    └── ...
```

### 后端API
- **音频列表**: `GET http://localhost:3000/api/audio/files`
- **播放音频**: `GET http://localhost:3000/api/audio/play/:id`
- **获取字幕**: `GET http://localhost:3000/api/audio/transcript/:id`

---

## 🔧 gPodder配置

### 启用自动下载新episode

在gPodder中：
1. 右键点击播客
2. 选择"设置"
3. 勾选"下载新episode"
4. 点击"确定"

### 手动更新

- 在gPodder中: 点击 "播客" → "检查更新"
- 或使用命令行: `D:\gpodder\bin\gpo.exe update`

---

## 📝 脚本说明

### update-podcasts.bat
更新gPodder订阅的音频文件

### download-dw-transcripts.py
为DW音频下载对应的文字稿

### run-update-all.bat
完整更新流程（音频+字幕）

### setup-scheduled-task.bat
创建Windows计划任务

---

## 💡 前端使用

刷新浏览器 http://localhost:3003

音频列表会显示：
- 📁 文件名
- 📏 文件大小
- 📅 修改时间
- ✅ 有字幕标记

点击音频后，前端会：
1. 播放音频
2. 如果有字幕，显示在旁边
3. 支持边听边看

---

## 🎯 每日工作流程

1. **凌晨2点**: 自动运行更新脚本
   - 下载新音频
   - 下载字幕文件

2. **早上学习**:
   - 打开浏览器 http://localhost:3003
   - 选择最新音频
   - 查看字幕学习

3. **听完自动清理**:
   - 已播放的自动删除
   - 只保留最新10集
   - 30天后彻底删除

---

## 🔍 字幕文件命名

字幕文件必须与音频文件同名（除扩展名）：

```
✅ 正确:
  LGN_20250216.mp3
  LGN_20250216.txt

❌ 错误:
  LGN_20250216.mp3
  transcript.txt  (不会识别)
```

---

## 📊 系统状态检查

### 检查后端
```bash
curl http://localhost:3000/health
```

### 查看已下载文件
```bash
dir "C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads"
```

### 手动更新
```bash
cd D:\german-learning-assistant
python download-dw-transcripts.py
```

---

## ✅ 完成清单

- [x] gPodder配置（保留10集，自动清理）
- [x] 后端字幕支持（API端点）
- [x] 字幕下载脚本（DW自动下载）
- [x] 自动更新脚本（播客+字幕）
- [x] 计划任务配置（每天自动运行）
- [ ] 在gPodder中启用"下载新episode"（需要手动操作）
- [ ] 前端字幕显示界面（待开发）

---

## 🎓 下一步

1. **在gPodder中启用自动下载**:
   - 右键播客 → 设置 → 勾选"下载新episode"

2. **运行第一次更新**:
   ```bash
   D:\german-learning-assistant\run-update-all.bat
   ```

3. **刷新浏览器查看效果**:
   http://localhost:3003

---

**系统已就绪！** 🎉
