const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

// 启用CORS（允许前端访问）
app.use(cors())
app.use(express.json())

// gPodder下载目录（Windows默认位置）
const GPODDER_DOWNLOADS = path.join(
  process.env.USERPROFILE,
  'Documents',
  'gPodder',
  'Downloads'
)

// 递归扫描目录，获取所有音频文件
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList)
    } else {
      // 检查是否是音频文件
      const ext = path.extname(file).toLowerCase()
      if (['.mp3', '.mp4', '.m4a', '.wav', '.ogg', '.opus'].includes(ext)) {
        const stats = fs.statSync(filePath)
        
        // 从文件路径提取播客名称和episode信息
        const relativePath = path.relative(GPODDER_DOWNLOADS, filePath)
        const parts = relativePath.split(path.sep)
        const podcastName = parts[0]
        const episodeName = parts.slice(1).join(path.sep)

        fileList.push({
          id: Buffer.from(filePath).toString('base64'),
          podcastName,
          episodeName: episodeName,
          fileName: file,
          filePath: filePath,
          fileSize: stats.size,
          modifiedTime: stats.mtime,
          fileExtension: ext
        })
      }
    }
  })

  return fileList
}

// API: 获取gPodder下载的所有播客
app.get('/api/gpodder/podcasts', (req, res) => {
  try {
    // 检查gPodder目录是否存在
    if (!fs.existsSync(GPODDER_DOWNLOADS)) {
      return res.status(404).json({
        error: 'gPodder下载目录不存在',
        message: `请确认gPodder安装路径: ${GPODDER_DOWNLOADS}`,
        suggestion: '请先安装gPodder并订阅播客'
      })
    }

    // 扫描所有音频文件
    const audioFiles = scanDirectory(GPODDER_DOWNLOADS)

    // 按播客分组
    const podcasts = {}
    audioFiles.forEach(file => {
      if (!podcasts[file.podcastName]) {
        podcasts[file.podcastName] = {
          name: file.podcastName,
          episodes: [],
          totalCount: 0,
          totalSize: 0
        }
      }
      podcasts[file.podcastName].episodes.push(file)
      podcasts[file.podcastName].totalCount++
      podcasts[file.podcastName].totalSize += file.fileSize
    })

    // 转换为数组并排序（按修改时间）
    const podcastArray = Object.values(podcasts).map(podcast => ({
      ...podcast,
      episodes: podcast.episodes.sort((a, b) => b.modifiedTime - a.modifiedTime)
    }))

    res.json({
      success: true,
      podcasts: podcastArray,
      totalCount: audioFiles.length,
      totalSize: audioFiles.reduce((sum, f) => sum + f.fileSize, 0),
      gpodderPath: GPODDER_DOWNLOADS
    })
  } catch (error) {
    console.error('读取gPodder目录失败:', error)
    res.status(500).json({
      error: '读取失败',
      message: error.message
    })
  }
})

// API: 提供音频文件流
app.get('/api/gpodder/audio/:id', (req, res) => {
  try {
    const filePath = Buffer.from(req.params.id, 'base64').toString('utf-8')
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' })
    }

    res.sendFile(filePath)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    gpodderPath: GPODDER_DOWNLOADS,
    exists: fs.existsSync(GPODDER_DOWNLOADS)
  })
})

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   gPodder集成服务已启动                   ║
║   Port: ${PORT}                            ║
║   gPodder路径:                              ║
║   ${GPODDER_DOWNLOADS}   ║
╚═══════════════════════════════════════════╝
  `)
})
