import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// gPodder下载目录
const GPODDER_DOWNLOADS = 'C:\\Users\\ZHAO JUNJIE\\Documents\\gPodder\\Downloads'

// 备用：项目内的音频文件夹
const PROJECT_AUDIO_DIR = path.join(__dirname, 'public', 'audio-downloads')

// 练习集目录
const PRACTICE_SETS_DIR = path.join(__dirname, 'practice-sets')
const PRACTICE_STATE_FILE = path.join(PRACTICE_SETS_DIR, '.state.json')
const LANGUAGE_MAP_FILE = path.join(PRACTICE_SETS_DIR, '.language-map.json')

// 优先使用gPodder目录，如果不存在��创建项目目录
const AUDIO_DIR = fs.existsSync(GPODDER_DOWNLOADS) ? GPODDER_DOWNLOADS : PROJECT_AUDIO_DIR

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
  console.log('✅ 创建音频目录:', AUDIO_DIR)
}

if (!fs.existsSync(PRACTICE_SETS_DIR)) {
  fs.mkdirSync(PRACTICE_SETS_DIR, { recursive: true })
}

function loadPracticeState() {
  if (!fs.existsSync(PRACTICE_STATE_FILE)) {
    return { listened: {}, favorites: [], favoriteSets: {} }
  }
  try {
    const raw = fs.readFileSync(PRACTICE_STATE_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return {
      listened: data.listened || {},
      favorites: data.favorites || [],
      favoriteSets: data.favoriteSets || {}
    }
  } catch (error) {
    return { listened: {}, favorites: [], favoriteSets: {} }
  }
}

function savePracticeState(state) {
  fs.writeFileSync(PRACTICE_STATE_FILE, JSON.stringify(state, null, 2))
}

function loadLanguageMap() {
  if (!fs.existsSync(LANGUAGE_MAP_FILE)) {
    return { default: 'de' }
  }
  try {
    const raw = fs.readFileSync(LANGUAGE_MAP_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return typeof data === 'object' && data ? data : { default: 'de' }
  } catch (error) {
    return { default: 'de' }
  }
}

function saveLanguageMap(map) {
  fs.writeFileSync(LANGUAGE_MAP_FILE, JSON.stringify(map, null, 2))
}

function favoriteLanguage(favorite) {
  return favorite?.language || 'de'
}

function listGpodderSources() {
  if (!fs.existsSync(GPODDER_DOWNLOADS)) return []
  return fs.readdirSync(GPODDER_DOWNLOADS)
    .map(name => path.join(GPODDER_DOWNLOADS, name))
    .filter(p => fs.existsSync(p) && fs.statSync(p).isDirectory())
    .map(p => path.basename(p))
}

function listPracticeSetSources() {
  if (!fs.existsSync(PRACTICE_SETS_DIR)) return []
  const entries = fs.readdirSync(PRACTICE_SETS_DIR)
  const sources = new Set()
  const gpodderSources = new Set(listGpodderSources())
  entries.forEach(entry => {
    const entryPath = path.join(PRACTICE_SETS_DIR, entry)
    if (!fs.existsSync(entryPath) || !fs.statSync(entryPath).isDirectory()) return
    const files = fs.readdirSync(entryPath)
    const practiceJson = files.find(f => f.endsWith('_practice.json'))
    if (!practiceJson) return
    try {
      const raw = fs.readFileSync(path.join(entryPath, practiceJson), 'utf-8')
      const data = JSON.parse(raw)
      const source = data?.source || data?.title || entry
      if (gpodderSources.has(source)) {
        sources.add(source)
      }
    } catch (err) {
      // ignore bad json
    }
  })
  return Array.from(sources)
}

// 扫描音频文件和字幕（递归扫描所有子目录）
function scanDirectory(dir, podcastName = '') {
  if (!fs.existsSync(dir)) {
    return []
  }

  const files = fs.readdirSync(dir)
  const audioFiles = []

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase()
      if (['.mp3', '.mp4', '.m4a', '.wav', '.ogg', '.opus'].includes(ext)) {
        // 检查是否有对应的字幕文件
        const baseName = path.basename(file, ext)
        const transcriptExtensions = ['.txt', '.transcript', '.srt', '.vtt']
        let transcriptPath = null

        for (const transcriptExt of transcriptExtensions) {
          const possibleTranscript = path.join(dir, baseName + transcriptExt)
          if (fs.existsSync(possibleTranscript)) {
            transcriptPath = possibleTranscript
            break
          }
        }

        audioFiles.push({
          id: Buffer.from(filePath).toString('base64'),
          fileName: file,
          filePath: filePath,
          fileSize: stat.size,
          modifiedTime: stat.mtime,
          fileExtension: ext,
          hasTranscript: transcriptPath !== null,
          transcriptPath: transcriptPath,
          podcastName: podcastName
        })
      }
    } else if (stat.isDirectory()) {
      // 递归扫描子目录
      const subFiles = scanDirectory(filePath, file)
      audioFiles.push(...subFiles)
    }
  })

  return audioFiles.sort((a, b) => b.modifiedTime - a.modifiedTime)
}

function buildAudioIndex(dir) {
  const index = new Map()
  const files = scanDirectory(dir)
  files.forEach(file => {
    index.set(file.fileName, file.filePath)
  })
  return index
}

function scanPracticeSets() {
  if (!fs.existsSync(PRACTICE_SETS_DIR)) {
    return []
  }

  const languageMap = loadLanguageMap()
  const audioIndex = buildAudioIndex(AUDIO_DIR)
  const entries = fs.readdirSync(PRACTICE_SETS_DIR)
  const sets = []

  entries.forEach(entry => {
    const entryPath = path.join(PRACTICE_SETS_DIR, entry)
    const stat = fs.statSync(entryPath)
    if (!stat.isDirectory()) return

    const files = fs.readdirSync(entryPath)
    const practiceJson = files.find(f => f.endsWith('_practice.json'))
    if (!practiceJson) return

    const practicePath = path.join(entryPath, practiceJson)
    let practiceData = null
    try {
      const raw = fs.readFileSync(practicePath, 'utf-8')
      practiceData = JSON.parse(raw)
    } catch (err) {
      return
    }

    const audioFileName = practiceData?.audioFile || ''
    let audioPath = ''

    const localAudio = files.find(f => {
      const ext = path.extname(f).toLowerCase()
      return ['.mp3', '.mp4', '.m4a', '.wav', '.ogg', '.opus'].includes(ext)
    })

    if (localAudio) {
      audioPath = path.join(entryPath, localAudio)
    } else if (audioFileName && audioIndex.has(audioFileName)) {
      audioPath = audioIndex.get(audioFileName)
    }

    const source = practiceData?.source || practiceData?.title || (audioPath ? path.basename(path.dirname(audioPath)) : entry)
    const modifiedTime = fs.statSync(practicePath).mtime
    const title = practiceData?.title || (audioFileName ? path.parse(audioFileName).name : entry)
    const practiceDate = practiceData?.date || ''
    const mapLang = languageMap[source]
    const dataLang = practiceData?.language
    const language = mapLang || dataLang || languageMap.default || 'de'

    sets.push({
      practiceId: Buffer.from(practicePath).toString('base64'),
      audioId: audioPath ? Buffer.from(audioPath).toString('base64') : '',
      title,
      source,
      language,
      totalSentences: practiceData?.totalSentences || (practiceData?.sentences?.length || 0),
      modifiedTime,
      practiceDate
    })
  })

  return sets.sort((a, b) => b.modifiedTime - a.modifiedTime)
}

function listUnknownPracticeSources() {
  const gpodderSources = new Set(listGpodderSources())
  const sets = scanPracticeSets()
  const unknown = new Set()
  sets.forEach(setItem => {
    if (!gpodderSources.has(setItem.source)) {
      unknown.add(setItem.source)
    }
  })
  return Array.from(unknown)
}

function assignPracticeSource(fromSource, toSource) {
  if (!fs.existsSync(PRACTICE_SETS_DIR)) return 0
  const entries = fs.readdirSync(PRACTICE_SETS_DIR)
  let updated = 0
  entries.forEach(entry => {
    const entryPath = path.join(PRACTICE_SETS_DIR, entry)
    if (!fs.existsSync(entryPath) || !fs.statSync(entryPath).isDirectory()) return
    const files = fs.readdirSync(entryPath)
    const practiceJson = files.find(f => f.endsWith('_practice.json'))
    if (!practiceJson) return
    const practicePath = path.join(entryPath, practiceJson)
    try {
      const raw = fs.readFileSync(practicePath, 'utf-8')
      const data = JSON.parse(raw)
      const currentSource = data?.source || data?.title || entry
      if (currentSource !== fromSource) return
      data.source = toSource
      if (!data.title || data.title === fromSource || data.title === entry) {
        const audioStem = data.audioFile ? path.parse(data.audioFile).name : entry
        data.title = `${toSource} ${audioStem}`
      }
      fs.writeFileSync(practicePath, JSON.stringify(data, null, 2))
      updated += 1
    } catch (err) {
      // ignore
    }
  })
  return updated
}

// API: 获取音频文件（优先gPodder）
app.get('/api/audio/files', (req, res) => {
  try {
    const files = scanDirectory(AUDIO_DIR)

    res.json({
      success: true,
      files: files,
      totalCount: files.length,
      audioDir: AUDIO_DIR,
      source: fs.existsSync(GPODDER_DOWNLOADS) ? 'gPodder' : '项目目录'
    })
  } catch (error) {
    console.error('读取音频文件失败:', error)
    res.status(500).json({
      error: '读取失败',
      message: error.message
    })
  }
})

// API: 获取练习集来源
app.get('/api/practice/sources', (req, res) => {
  try {
    const { lang } = req.query
    const sets = scanPracticeSets()
    const sourcesMap = new Map()

    sets
      .filter(setItem => !lang || setItem.language === lang)
      .forEach(setItem => {
      const count = sourcesMap.get(setItem.source) || 0
      sourcesMap.set(setItem.source, count + 1)
    })

    const sources = Array.from(sourcesMap.entries()).map(([name, count]) => ({
      name,
      count
    }))

    res.json({ sources })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 获取练习集列表
app.get('/api/practice/sets', (req, res) => {
  try {
    const { source, lang } = req.query
    let sets = scanPracticeSets()
    if (source) {
      sets = sets.filter(s => s.source === source)
    }
    if (lang) {
      sets = sets.filter(s => s.language === lang)
    }
    const state = loadPracticeState()
    const listened = state.listened || {}
    const favorites = state.favorites || []
    const favoriteSets = state.favoriteSets || {}
    const favoriteCountMap = favorites
      .filter(item => !lang || favoriteLanguage(item) === lang)
      .reduce((acc, item) => {
      acc[item.practiceId] = (acc[item.practiceId] || 0) + 1
      return acc
    }, {})

    const enriched = sets.map(s => ({
      ...s,
      listened: Boolean(listened[s.practiceId]),
      favoriteCount: favoriteCountMap[s.practiceId] || 0,
      favoriteSet: Boolean(favoriteSets[s.practiceId])
    }))

    res.json({ sets: enriched })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 获取练习集内容
app.get('/api/practice/set/:id', (req, res) => {
  try {
    const practicePath = Buffer.from(req.params.id, 'base64').toString('utf-8')
    const normalized = path.normalize(practicePath)
    if (!normalized.startsWith(PRACTICE_SETS_DIR)) {
      return res.status(400).json({ error: 'invalid path' })
    }
    if (!fs.existsSync(normalized)) {
      return res.status(404).json({ error: '练习集不存在' })
    }
    const content = fs.readFileSync(normalized, 'utf-8')
    res.json(JSON.parse(content))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 提供练习集音频
app.get('/api/practice/audio/:id', (req, res) => {
  try {
    const audioPath = Buffer.from(req.params.id, 'base64').toString('utf-8')
    const normalized = path.normalize(audioPath)
    if (!normalized.startsWith(PRACTICE_SETS_DIR) && !normalized.startsWith(AUDIO_DIR)) {
      return res.status(400).json({ error: 'invalid path' })
    }
    if (!fs.existsSync(normalized)) {
      return res.status(404).json({ error: '音频不存在' })
    }
    res.sendFile(normalized)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 获取学习状态
app.get('/api/practice/state', (req, res) => {
  const state = loadPracticeState()
  res.json(state)
})

// API: 标记练习集已听
app.post('/api/practice/mark-listened', (req, res) => {
  try {
    const { practiceId, listened } = req.body || {}
    if (!practiceId) {
      return res.status(400).json({ error: 'practiceId required' })
    }
    const state = loadPracticeState()
    if (listened) {
      state.listened[practiceId] = new Date().toISOString()
    } else {
      delete state.listened[practiceId]
    }
    savePracticeState(state)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 获取收藏句子
app.get('/api/practice/favorites', (req, res) => {
  const state = loadPracticeState()
  const { lang } = req.query
  const list = state.favorites || []
  if (!lang) {
    return res.json({ favorites: list })
  }
  const filtered = list.filter(item => favoriteLanguage(item) === lang)
  return res.json({ favorites: filtered })
})

// API: 获取语言映射
app.get('/api/language-map', (req, res) => {
  const map = loadLanguageMap()
  res.json({ map })
})

// API: 自动生成语言映射
// API: 获取音源列表 + 语言映射
app.get('/api/language-map/sources', (req, res) => {
  try {
    const sources = Array.from(new Set([
      ...listGpodderSources(),
      ...listPracticeSetSources()
    ]))
    const map = loadLanguageMap()
    res.json({ sources, map })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 获取未知音源（练习集里出现但不在gPodder列表）
app.get('/api/practice/unknown-sources', (req, res) => {
  try {
    const unknownSources = listUnknownPracticeSources()
    const gpodderSources = listGpodderSources()
    res.json({ unknownSources, gpodderSources })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 将未知音源映射到真实音源
app.post('/api/practice/assign-source', (req, res) => {
  try {
    const { fromSource, toSource } = req.body || {}
    if (!fromSource || !toSource) {
      return res.status(400).json({ error: 'invalid payload' })
    }
    const updated = assignPracticeSource(fromSource, toSource)
    res.json({ success: true, updated })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 保存完整语言映射
app.post('/api/language-map/save', (req, res) => {
  try {
    const { map } = req.body || {}
    if (!map || typeof map !== 'object') {
      return res.status(400).json({ error: 'invalid payload' })
    }
    saveLanguageMap(map)
    res.json({ success: true, map })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 收藏句子
app.post('/api/practice/favorites', (req, res) => {
  try {
    const { practiceId, sentenceId, german, start, end, audioId, source, title, language } = req.body || {}
    if (!practiceId || sentenceId === undefined || !german) {
      return res.status(400).json({ error: 'invalid payload' })
    }

    const state = loadPracticeState()
    const exists = state.favorites.some(f =>
      f.practiceId === practiceId && f.sentenceId === sentenceId
    )
    if (!exists) {
      state.favorites.push({
        practiceId,
        sentenceId,
        german,
        start,
        end,
        audioId: audioId || '',
        source: source || '',
        title: title || '',
        language: language || '',
        createdAt: new Date().toISOString()
      })
      savePracticeState(state)
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 取消收藏句子
app.delete('/api/practice/favorites', (req, res) => {
  try {
    const { practiceId, sentenceId } = req.body || {}
    if (!practiceId || sentenceId === undefined) {
      return res.status(400).json({ error: 'invalid payload' })
    }
    const state = loadPracticeState()
    state.favorites = (state.favorites || []).filter(f =>
      !(f.practiceId === practiceId && f.sentenceId === sentenceId)
    )
    savePracticeState(state)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 收藏练习集
app.post('/api/practice/favorite-set', (req, res) => {
  try {
    const { practiceId, favorite } = req.body || {}
    if (!practiceId) {
      return res.status(400).json({ error: 'practiceId required' })
    }
    const state = loadPracticeState()
    if (favorite) {
      state.favoriteSets[practiceId] = true
    } else {
      delete state.favoriteSets[practiceId]
    }
    savePracticeState(state)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 删除练习集
app.delete('/api/practice/set', (req, res) => {
  try {
    const { practiceId } = req.body || {}
    if (!practiceId) {
      return res.status(400).json({ error: 'practiceId required' })
    }
    const practicePath = Buffer.from(practiceId, 'base64').toString('utf-8')
    const normalized = path.normalize(practicePath)
    if (!normalized.startsWith(PRACTICE_SETS_DIR)) {
      return res.status(400).json({ error: 'invalid path' })
    }
    if (!fs.existsSync(normalized)) {
      return res.status(404).json({ error: 'not found' })
    }
    const dir = fs.lstatSync(normalized).isDirectory() ? normalized : path.dirname(normalized)
    fs.rmSync(dir, { recursive: true, force: true })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 上传音频文件到项目
app.post('/api/audio/upload', express.raw({ type: '*/*', limit: '500mb' }), (req, res) => {
  // 这个端点用于未来扩展，现在先返回提示
  res.json({
    message: '请直接把音频文件放到以下目录:',
    directory: PROJECT_AUDIO_DIR
  })
})

// API: 提供音频文件流
app.get('/api/audio/play/:id', (req, res) => {
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

// API: 获取字幕文件
app.get('/api/audio/transcript/:id', (req, res) => {
  try {
    const filePath = Buffer.from(req.params.id, 'base64').toString('utf-8')

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '字幕文件不存在' })
    }

    const transcriptContent = fs.readFileSync(filePath, 'utf-8')

    res.json({
      success: true,
      content: transcriptContent
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    audioDir: AUDIO_DIR,
    source: fs.existsSync(GPODDER_DOWNLOADS) ? 'gPodder' : '项目目录',
    exists: fs.existsSync(AUDIO_DIR),
    filesCount: scanDirectory(AUDIO_DIR).length
  })
})

// API: 运行本地脚本（仅允许白名单）
app.post('/api/scripts/run', (req, res) => {
  try {
    const { name } = req.body || {}
    const allowed = {
      'auto-daily': path.join(__dirname, 'scripts', 'bat', 'auto-daily.bat'),
      'auto-daily-de': path.join(__dirname, 'scripts', 'bat', 'auto-daily-de.bat'),
      'auto-daily-en': path.join(__dirname, 'scripts', 'bat', 'auto-daily-en.bat'),
      'subscribe-now': path.join(__dirname, 'scripts', 'bat', 'subscribe-now.bat'),
      'subscribe-de': path.join(__dirname, 'scripts', 'bat', 'subscribe-german.bat'),
      'subscribe-en': path.join(__dirname, 'scripts', 'bat', 'subscribe-english.bat')
    }

    if (!name || !allowed[name]) {
      return res.status(400).json({ error: 'invalid script name' })
    }

    const scriptPath = allowed[name]
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: 'script not found' })
    }

    const child = spawn('cmd.exe', ['/c', scriptPath], {
      cwd: __dirname,
      windowsHide: true
    })

    let output = ''
    let errorOutput = ''
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    child.on('close', (code) => {
      res.json({
        success: code === 0,
        code,
        output,
        errorOutput
      })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  const files = scanDirectory(AUDIO_DIR)
  const sourceName = fs.existsSync(GPODDER_DOWNLOADS) ? 'gPodder' : '项目目录'

  console.log(`
╔═══════════════════════════════════════════╗
║   德语播客学习服务已启动                 ║
║   Port: ${PORT}                            ║
║   音频来源: ${sourceName}                        ║
║   音频目录:                                 ║
║   ${AUDIO_DIR}     ║
║                                           ║
║   已有音频文件: ${files.length} 个                    ║
╚═══════════════════════════════════════════╝

💡 使用方法:
   1. 在gPodder中订阅RSS并下载音频
   2. 刷新浏览器查看已下载的音频
   3. 选择音频开始学习
  `)
})

