# 🚀 快速安装FFmpeg指南

## 方法1：使用包管理器（最简单）

### Windows (推荐)

```bash
# 使用 Chocolatey
choco install ffmpeg

# 或使用 Scoop
scoop install ffmpeg
```

### 验证安装
```bash
ffmpeg -version
```

---

## 方法2：手动下载（5分钟）

### 1. 下载
访问：https://github.com/BtbN/FFmpeg-Builds/releases
下载：`ffmpeg-master-latest-win64-gpl.zip`

### 2. 解压
解压到：`C:\ffmpeg`

### 3. 添加到PATH
1. 右键"此电脑" → 属性
2. 高级系统设置 → 环境变量
3. 系统变量 → Path → 新建
4. 输入：`C:\ffmpeg\bin`

### 4. 重启命令提示符
```bash
ffmpeg -version
```

---

## 方法3：使用conda（如果你有Anaconda）

```bash
conda install -c conda-forge ffmpeg
```

---

## ⚡ 临时方案（不安装FFmpeg）

如果不想安装FFmpeg，可以：

### 方案A：使用在线字幕工具
- 访问：https://www.happyscribe.com/
- 上传音频 → 生成字幕 → 下载SRT
- 手动放到 `practice-sets/` 目录

### 方案B：使用其他ASR服务
- Google Cloud Speech-to-Text
- Azure Speech Services
- AssemblyAI

---

## 📝 安装完成后

测试字幕生成：
```bash
cd D:\german-learning-assistant
python generate-subtitles.py
```

应该会看到：
```
Processing: [音频文件]
Loading Whisper model...
Transcribing audio...
Subtitle generated: [字幕文件]
Total segments: 45
```

---

**推荐使用方法1（Chocolatey），最快最简单！** 🚀
