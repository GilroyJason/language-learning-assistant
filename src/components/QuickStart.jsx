import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function QuickStart({ onStartLearning, onStartReview, language }) {
  const isEnglishTheme = language === 'en'
  const isEnglishText = false
  const storagePrefix = language === 'en' ? 'english' : 'german'
  const strings = {
    welcome: isEnglishText ? 'Welcome back' : '欢迎回来',
    goal: isEnglishText ? 'Today goal: finish 1 set' : '今日目标：完成 1 套题库',
    streak: isEnglishText ? 'Streak' : '连续学习',
    setsDone: isEnglishText ? 'Completed' : '已完成',
    setsLeft: isEnglishText ? 'Remaining' : '剩余',
    setsUnit: isEnglishText ? 'sets' : '套题',
    startLearning: isEnglishText ? 'Start Learning' : '开始学习',
    startLearningSub: isEnglishText ? 'Pick a source and start dictation' : '选择音源并开始听写',
    startReview: isEnglishText ? 'Start Review' : '开始复习',
    startReviewSub: isEnglishText ? 'Practice from favorite sentences' : '从收藏句子题库开始复习',
    shortcuts: isEnglishText ? 'Shortcuts' : '快捷键',
    answer: isEnglishText ? 'Answer' : '答案',
    translation: isEnglishText ? 'Translation' : '翻译',
    play: isEnglishText ? 'Play' : '播放',
    submit: isEnglishText ? 'Submit' : '验证',
    nextWord: isEnglishText ? 'Next' : '下词',
    tips: isEnglishText ? 'Tips' : '学习建议',
    tip1: isEnglishText ? 'Listen once before typing' : '先听完整片段再拼句',
    tip2: isEnglishText ? 'Repeat hard sentences 2-3 times' : '难句重复听 2-3 次',
    tip3: isEnglishText ? 'Star to add into review' : '星标进入“开始复习”',
    tip4: isEnglishText ? 'Finish at least 1 set daily' : '每天完成至少 1 套题库',
    hintTitle: isEnglishText ? 'Hints' : '小提示',
    autoPlayLabel: isEnglishText ? 'Autoplay' : '自动播放',
    autoPlayDesc: isEnglishText ? 'Auto play on each sentence' : '每句切换自动播放',
    arrowLabel: isEnglishText ? 'Arrow keys' : '左右箭头',
    arrowDesc: isEnglishText ? 'Use arrows to move words' : 'move words',
    today: isEnglishText ? 'Today' : '今日成就',
    sentences: isEnglishText ? 'Dictated' : '听写句子',
    time: isEnglishText ? 'Study time' : '学习时长',
    minutes: isEnglishText ? 'min' : '分钟',
    tools: isEnglishText ? 'Tools' : '工具',
    updateSets: isEnglishText ? 'Update sets' : '更新题库',
    subscribe: isEnglishText ? 'Subscribe RSS' : '订阅RSS',
    translateStart: isEnglishText ? 'Start Translate' : '启动翻译',
    translateStop: isEnglishText ? 'Stop Translate' : '停止翻译',
    manageSources: isEnglishText ? 'Manage sources' : '管理音源',
    noSources: isEnglishText ? 'No sources found' : '暂无音源',
    unknown: isEnglishText ? 'Unknown sources' : '未知音源',
    mapTo: isEnglishText ? 'Map to' : '映射到',
    apply: isEnglishText ? 'Apply' : '应用',
    setDe: isEnglishText ? 'DE' : '德语',
    setEn: isEnglishText ? 'EN' : '英语',
    save: isEnglishText ? 'Save' : '保存设置',
    toolsHint: isEnglishText ? 'Runs local scripts via backend' : '通过后端执行本地脚本',
    days: isEnglishText ? 'days' : '天'
  }
  const [dailyGoal, setDailyGoal] = useState({
    sets: 1,
    completedSets: 0,
    sentences: 0,
    completed: 0,
    timeSpent: 0,
    date: new Date().toDateString()
  })
  const [scriptStatus, setScriptStatus] = useState({ running: false, message: '' })
  const [scriptLog, setScriptLog] = useState([])
  const pollRef = useRef(null)
  const [showMapping, setShowMapping] = useState(false)
  const [mappingSources, setMappingSources] = useState([])
  const [mappingMap, setMappingMap] = useState({})
  const [mappingDraft, setMappingDraft] = useState({})
  const [unknownSources, setUnknownSources] = useState([])
  const [gpodderSources, setGpodderSources] = useState([])
  const [assignTargets, setAssignTargets] = useState({})

  // 加载今日进度
  useEffect(() => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`${storagePrefix}-daily-progress`)
    const streakSaved = localStorage.getItem(`${storagePrefix}-streak`)

    if (saved) {
      const data = JSON.parse(saved)
      if (data.date === today) {
        setDailyGoal({
          sets: data.sets ?? 1,
          completedSets: data.completedSets ?? 0,
          sentences: data.sentences ?? 0,
          completed: data.completed ?? 0,
          timeSpent: data.timeSpent ?? 0,
          date: data.date
        })
      } else {
        // 检查是否连续学习
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const streak = streakSaved ? JSON.parse(streakSaved) : { count: 0, lastDate: null }

        if (streak.lastDate === yesterday.toDateString()) {
          streak.count += 1
        } else if (streak.lastDate !== today) {
          streak.count = 1
        }

        // 新的一天，重置进度
        const newDay = {
          sets: 1,
          completedSets: 0,
          sentences: 0,
          completed: 0,
          timeSpent: 0,
          date: today
        }
        setDailyGoal(newDay)
        localStorage.setItem(`${storagePrefix}-daily-progress`, JSON.stringify(newDay))
        localStorage.setItem(`${storagePrefix}-streak`, JSON.stringify({ ...streak, lastDate: today }))
      }
    }
  }, [storagePrefix])

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [])

  const todayProgress = dailyGoal.sets > 0
    ? (dailyGoal.completedSets / dailyGoal.sets) * 100
    : 0

  const runScript = async (name) => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    setScriptLog([])
    setScriptStatus({ running: true, message: isEnglishText ? 'Running...' : '正在执行...' })
    try {
      const res = await fetch('http://localhost:3001/api/scripts/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (!data.success || !data.runId) {
        setScriptStatus({ running: false, message: isEnglishText ? 'Failed. Check backend logs.' : '执行失败，请查看后端日志。' })
        return
      }
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`http://localhost:3001/api/scripts/status/${data.runId}`)
          const statusData = await statusRes.json()
          if (statusData.output || statusData.errorOutput) {
            const merged = [
              ...(statusData.output || []).map(line => `✔ ${line}`),
              ...(statusData.errorOutput || []).map(line => `✖ ${line}`)
            ]
            setScriptLog(merged.slice(-80))
          }
          if (statusData.status === 'success') {
            setScriptStatus({ running: false, message: isEnglishText ? 'Completed.' : '执行完成。' })
            clearInterval(pollRef.current)
            pollRef.current = null
          } else if (statusData.status === 'failed') {
            setScriptStatus({ running: false, message: isEnglishText ? 'Failed. Check logs.' : '执行失败，请查看日志。' })
            clearInterval(pollRef.current)
            pollRef.current = null
          }
        } catch (err) {
          setScriptStatus({ running: false, message: isEnglishText ? 'Failed. Check backend logs.' : '执行失败，请查看后端日志。' })
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      }, 1000)
    } catch (error) {
      setScriptStatus({ running: false, message: isEnglishText ? 'Failed to run.' : '调用失败。' })
    }
  }

  const loadMappingSources = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/language-map/sources')
      const data = await res.json()
      setMappingSources(data.sources || [])
      setMappingMap(data.map || {})
      setMappingDraft(data.map || {})
      const unknownRes = await fetch('http://localhost:3001/api/practice/unknown-sources')
      const unknownData = await unknownRes.json()
      setUnknownSources(unknownData.unknownSources || [])
      setGpodderSources(unknownData.gpodderSources || [])
    } catch (error) {
      setMappingSources([])
      setMappingMap({})
      setMappingDraft({})
      setUnknownSources([])
      setGpodderSources([])
    }
  }

  const updateSourceLanguage = (source, lang) => {
    setMappingDraft(prev => ({ ...prev, [source]: lang }))
  }

  const saveLanguageMap = async () => {
    setScriptStatus({ running: true, message: isEnglishText ? 'Saving...' : '正在保存...' })
    try {
      const res = await fetch('http://localhost:3001/api/language-map/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ map: mappingDraft })
      })
      const data = await res.json()
      if (data.map) {
        setMappingMap(data.map)
        setMappingDraft(data.map)
        setScriptStatus({ running: false, message: isEnglishText ? 'Saved.' : '已保存。' })
      } else {
        setScriptStatus({ running: false, message: isEnglishText ? 'Save failed.' : '保存失败。' })
      }
    } catch (error) {
      setScriptStatus({ running: false, message: isEnglishText ? 'Save failed.' : '保存失败。' })
    }
    setTimeout(() => {
      setScriptStatus(prev => (prev.running ? prev : { running: false, message: '' }))
    }, 3000)
  }

  const assignUnknownSource = async (fromSource) => {
    const toSource = assignTargets[fromSource]
    if (!toSource) return
    setScriptStatus({ running: true, message: isEnglishText ? 'Applying...' : '正在应用...' })
    try {
      const res = await fetch('http://localhost:3001/api/practice/assign-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromSource, toSource })
      })
      const data = await res.json()
      if (data.success) {
        setScriptStatus({ running: false, message: isEnglishText ? 'Applied.' : '已应用。' })
        await loadMappingSources()
      } else {
        setScriptStatus({ running: false, message: isEnglishText ? 'Apply failed.' : '应用失败。' })
      }
    } catch (error) {
      setScriptStatus({ running: false, message: isEnglishText ? 'Apply failed.' : '应用失败。' })
    }
    setTimeout(() => {
      setScriptStatus(prev => (prev.running ? prev : { running: false, message: '' }))
    }, 3000)
  }

  // 动画变体配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  }

  return (
    <motion.div
      className="w-full px-2 sm:px-4 relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 背景装饰 - Spotify 风格深色氛围 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full blur-3xl ${
            isEnglishTheme ? 'bg-sky-500/15' : 'bg-[#1DB954]/15'
          }`}
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-[-120px] w-[520px] h-[520px] bg-white/6 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto w-full">
        <div className="rounded-3xl bg-[#0f0f10] text-white border border-white/10 shadow-2xl p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧主区 */}
            <motion.div className="lg:col-span-6 space-y-4" variants={itemVariants}>
              <motion.div
                className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">{strings.welcome}</h1>
                    <p className="text-sm text-white/70">{strings.goal}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/60">{strings.streak}</div>
                    <div className="text-xl font-semibold text-white">
                      {localStorage.getItem(`${storagePrefix}-streak`) ? JSON.parse(localStorage.getItem(`${storagePrefix}-streak`)).count : 1} {strings.days}
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${
                      isEnglishTheme ? 'from-sky-400 to-blue-300' : 'from-[#1DB954] to-emerald-300'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(todayProgress, 100)}%` }}
                    transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4"
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                >
                  <div className="text-xs text-white/60">{strings.setsDone}</div>
                  <div className="text-3xl font-semibold">{dailyGoal.completedSets}</div>
                  <div className="mt-2 text-xs text-white/60">{strings.setsUnit}</div>
                </motion.div>
                <motion.div
                  className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4"
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                >
                  <div className="text-xs text-white/60">{strings.setsLeft}</div>
                  <div className="text-3xl font-semibold">{dailyGoal.sets - dailyGoal.completedSets}</div>
                  <div className="mt-2 text-xs text-white/60">{strings.setsUnit}</div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <motion.button
                  onClick={onStartLearning}
                  className={`rounded-2xl p-4 text-left text-black shadow-[0_14px_36px_rgba(29,185,84,0.35)] ${
                    isEnglishTheme
                      ? 'bg-gradient-to-r from-amber-400 to-orange-300 shadow-[0_14px_36px_rgba(251,146,60,0.35)]'
                      : 'bg-gradient-to-r from-[#1DB954] to-emerald-300'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{strings.startLearning}</div>
                      <div className="text-xs text-black/70 mt-1">{strings.startLearningSub}</div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.button>

                <motion.button
                  onClick={onStartReview}
                  className="rounded-2xl p-4 text-left bg-gradient-to-r from-sky-400 to-cyan-300 text-black shadow-[0_14px_36px_rgba(56,189,248,0.35)]"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{strings.startReview}</div>
                      <div className="text-xs text-black/70 mt-1">{strings.startReviewSub}</div>
                    </div>
                    <div className="text-2xl">→</div>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {/* 中间信息区 */}
            <motion.div className="lg:col-span-3 space-y-3" variants={itemVariants}>
              <motion.div
                className="rounded-2xl bg-white/5 border border-white/10 p-4"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <h3 className="text-sm font-semibold mb-3">{strings.shortcuts}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                    <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-2">
                      <span>{strings.answer}</span>
                      <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/15">Ctrl+;</kbd>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-2">
                      <span>{strings.translation}</span>
                      <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/15">Ctrl+'</kbd>
                    </div>
                  <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-2">
                    <span>{strings.play}</span>
                    <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/15">Ctrl+P</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-2">
                    <span>{strings.submit}</span>
                    <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/15">Ctrl+Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-2">
                    <span>{strings.nextWord}</span>
                    <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/15">Space</kbd>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="rounded-2xl bg-white/5 border border-white/10 p-4"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <h3 className="text-sm font-semibold mb-2">{strings.tips}</h3>
                <ul className="text-xs text-white/70 space-y-2">
                  <li>{strings.tip1}</li>
                  <li>{strings.tip2}</li>
                  <li>{strings.tip3}</li>
                  <li>{strings.tip4}</li>
                </ul>
              </motion.div>
            </motion.div>

            {/* 右侧卡片区 */}
            <motion.div className="lg:col-span-3 space-y-3" variants={itemVariants}>
              <motion.div
                className="rounded-2xl bg-white/5 border border-white/10 p-4"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <h3 className="text-sm font-semibold mb-2">{strings.hintTitle}</h3>
                <div className="text-xs text-white/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>{strings.autoPlayLabel}</span>
                    <span className="text-white/50">{strings.autoPlayDesc}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{strings.arrowLabel}</span>
                    <span className="text-white/50">{strings.arrowDesc}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="rounded-2xl bg-[#151516] border border-white/10 p-4"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <h3 className="text-sm font-semibold mb-2">{strings.today}</h3>
                <div className="text-xs text-white/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>{strings.sentences}</span>
                    <span className="text-white/50">{dailyGoal.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{strings.time}</span>
                    <span className="text-white/50">{Math.round(dailyGoal.timeSpent / 60)} {strings.minutes}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="rounded-2xl bg-white/5 border border-white/10 p-4"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">{strings.tools}</h3>
                  <span className="text-[11px] text-white/40">{strings.toolsHint}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={scriptStatus.running}
                    onClick={() => runScript(isEnglishTheme ? 'auto-daily-en' : 'auto-daily-de')}
                    className={`px-3 py-2 rounded-full text-black text-xs font-semibold disabled:opacity-50 ${
                      isEnglishTheme ? 'bg-sky-400' : 'bg-[#1DB954]'
                    }`}
                  >
                    {strings.updateSets}
                  </button>
                  <button
                    disabled={scriptStatus.running}
                    onClick={() => runScript(isEnglishTheme ? 'subscribe-en' : 'subscribe-de')}
                    className="px-3 py-2 rounded-full bg-white/10 text-white text-xs border border-white/10 disabled:opacity-50"
                  >
                    {strings.subscribe}
                  </button>
                  <button
                    disabled={scriptStatus.running}
                    onClick={() => runScript('start-translate')}
                    className="px-3 py-2 rounded-full bg-white/10 text-white text-xs border border-white/10 disabled:opacity-50"
                  >
                    {strings.translateStart}
                  </button>
                  <button
                    disabled={scriptStatus.running}
                    onClick={() => runScript('stop-translate')}
                    className="px-3 py-2 rounded-full bg-white/10 text-white text-xs border border-white/10 disabled:opacity-50"
                  >
                    {strings.translateStop}
                  </button>
                  <button
                    onClick={async () => {
                      const next = !showMapping
                      setShowMapping(next)
                      if (next) {
                        await loadMappingSources()
                      }
                    }}
                    className="px-3 py-2 rounded-full bg-white/5 text-white text-xs border border-white/10"
                  >
                    {strings.manageSources}
                  </button>
                </div>
                  {scriptStatus.message && (
                    <div className="mt-2 text-[11px] text-white/60">{scriptStatus.message}</div>
                  )}
                  {scriptLog.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-white/10 bg-black/40 p-2 text-[10px] text-white/70 space-y-1">
                      {scriptLog.map((line, idx) => (
                        <div key={`${line}-${idx}`} className="whitespace-pre-wrap break-words">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                {showMapping && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-white/50">
                        {mappingSources.length} {isEnglishText ? 'sources' : '个音源'}
                      </div>
                      <button
                        onClick={saveLanguageMap}
                        className="px-3 py-1 rounded-full bg-white text-black text-[10px]"
                      >
                        {strings.save}
                      </button>
                    </div>
                    {mappingSources.length === 0 && (
                      <div className="text-[11px] text-white/50">{strings.noSources}</div>
                    )}
                    {mappingSources.map(source => {
                      const lang = mappingDraft[source] || 'de'
                      return (
                        <div key={source} className="flex items-center justify-between gap-3 text-[11px] text-white/80 bg-[#141415] border border-white/10 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 aspect-square rounded-full shrink-0 ${
                            isEnglishTheme ? 'bg-sky-400/80' : 'bg-[#1DB954]/80'
                          }`}></div>
                            <div className="line-clamp-1 text-white/80">{source}</div>
                          </div>
                          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 min-w-[112px] justify-between">
                            <button
                              onClick={() => updateSourceLanguage(source, 'de')}
                              className={`px-3 py-1 rounded-full text-[10px] transition ${
                                lang === 'de' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                              }`}
                            >
                              {strings.setDe}
                            </button>
                            <button
                              onClick={() => updateSourceLanguage(source, 'en')}
                              className={`px-3 py-1 rounded-full text-[10px] transition ${
                                lang === 'en' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                              }`}
                            >
                              {strings.setEn}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {unknownSources.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-white/50 mb-2">{strings.unknown}</div>
                        <div className="space-y-2">
                          {unknownSources.map(source => (
                            <div key={source} className="flex items-center justify-between gap-2 text-[11px] text-white/80 bg-[#141415] border border-white/10 rounded-xl px-3 py-2">
                              <div className="line-clamp-1">{source}</div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={assignTargets[source] || ''}
                                  onChange={(e) => setAssignTargets(prev => ({ ...prev, [source]: e.target.value }))}
                                  className="bg-black text-white text-[10px] border border-white/10 rounded-full px-2 py-1"
                                >
                                  <option value="">{strings.mapTo}</option>
                                  {gpodderSources.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => assignUnknownSource(source)}
                                  className="px-2 py-1 rounded-full bg-white text-black text-[10px]"
                                >
                                  {strings.apply}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default QuickStart
