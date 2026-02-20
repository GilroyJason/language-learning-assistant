/**
 * SentenceBuilder - 增强版
 * 优化UI、添加动画、改善用户体验
 * 全屏学习模式，支持dark/light mode
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { progressTracker } from '../utils/progressTracker'

const API_BASE = 'http://localhost:3001'

function SentenceBuilderEnhanced({ practiceSet, onHomeClick, language }) {
  const isEnglishText = language === 'en'
  const storagePrefix = language === 'en' ? 'english' : 'german'
    const strings = {
      dictation: isEnglishText ? 'Dictation' : '听写练习',
      loading: isEnglishText ? 'Loading practice set...' : '正在加载练习集...',
      practiceTitle: isEnglishText ? 'Audio Dictation' : '音频听写练习',
      sentencePrompt: isEnglishText ? '请用英语完成这个句子' : '请用德语完成这个句子',
    correct: isEnglishText ? 'Great!' : '🎉 太棒了！',
    incorrect: isEnglishText ? 'Keep going!' : '💪 继续加油！',
    correctSub: isEnglishText ? 'All correct, next one' : '完全正确，准备下一题',
    incorrectSub: isEnglishText ? 'Some errors, try again' : '有些不对，再试试看',
    play: isEnglishText ? 'Play' : '播放',
    submit: isEnglishText ? 'Submit' : '提交',
    answer: isEnglishText ? 'Answer' : '答案',
    sentence: isEnglishText ? 'Sentence' : '句子',
    inputHint: isEnglishText ? 'Type' : '输入',
    prev: isEnglishText ? 'Previous' : '上一句',
    next: isEnglishText ? 'Next' : '下一句',
    space: isEnglishText ? 'Space' : '空格'
  }
  const [lessons, setLessons] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInputs, setUserInputs] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [showAnswers, setShowAnswers] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [favoriteSet, setFavoriteSet] = useState(new Set())
  const [favoriteError, setFavoriteError] = useState(null)
  const inputRefs = useRef([])
  const audioRef = useRef(null)
  const stopHandlerRef = useRef(null)

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  // 初始化练习集
  useEffect(() => {
    const loadSentences = async () => {
      if (!practiceSet?.practiceId) {
        setIsLoading(false)
        return
      }

      console.log('[SentenceBuilder] 开始加载练习集:', practiceSet.practiceId)
      setIsLoading(true)

      try {
        const response = await fetch(`${API_BASE}/api/practice/set/${encodeURIComponent(practiceSet.practiceId)}`)
        const data = await response.json()
        const sentences = data?.sentences || []
        console.log('[SentenceBuilder] 加载到句子数量:', sentences.length)

        if (!sentences || sentences.length === 0) {
          console.error('[SentenceBuilder] 练习集加载失败，没有句子')
          setIsLoading(false)
          return
        }

        const lessonData = sentences.map(sentence => {
          const sentenceText = sentence.german || sentence.text || sentence.english || ''
          return {
          id: `${practiceSet.practiceId}-${sentence.id}`,
          promptZh: strings.dictation,
          answerDeTokens: sentenceText.split(' ').map(token => {
            const cleanToken = token.replace(/[.,!?]/g, '')
            return {
              text: cleanToken,
              hasPunctuation: /[.,!?]/.test(token)
            }
          }),
          audioUrl: null,
          hints: sentenceText,
          originalSentence: sentence,
          start: sentence.start,
          end: sentence.end
        }
        })

        console.log('[SentenceBuilder] 课程数据准备完成，第一课:', lessonData[0])
        setLessons(lessonData)
        setUserInputs(new Array(lessonData[0]?.answerDeTokens.length || 0).fill(''))
        setIsLoading(false)
      } catch (error) {
        console.error('[SentenceBuilder] 加载练习集失败:', error)
        setIsLoading(false)
      }
    }

    loadSentences()
  }, [practiceSet])

  const refreshFavorites = async () => {
    if (!practiceSet?.practiceId) return
    try {
      const url = new URL(`${API_BASE}/api/practice/favorites`)
      if (language) {
        url.searchParams.set('lang', language)
      }
      const res = await fetch(url.toString())
      const data = await res.json()
      const set = new Set(
        (data.favorites || [])
          .filter(f => f.practiceId === practiceSet.practiceId)
          .map(f => String(f.sentenceId))
      )
      setFavoriteSet(set)
      setFavoriteError(null)
    } catch (error) {
      console.error('加载收藏失败', error)
      setFavoriteError('收藏同步失败，请确认后端已启动')
    }
  }

  useEffect(() => {
    refreshFavorites()
  }, [practiceSet, language])

  // 切换题目时重置状态
  useEffect(() => {
    if (lessons.length > 0) {
      setUserInputs(new Array(lessons[currentIndex]?.answerDeTokens.length || 0).fill(''))
      setCurrentWordIndex(0)
      setFeedback(null)
        setShowAnswers(false)
        setShowTranslation(false)
      setIsCompleted(false)
    }
  }, [currentIndex, lessons])

  // 聚焦当前输入框
  useEffect(() => {
    if (!isLoading && inputRefs.current[currentWordIndex]) {
      // 延迟聚焦，等待动画完成
      setTimeout(() => {
        inputRefs.current[currentWordIndex]?.focus()
      }, 100)
    }
  }, [currentWordIndex, currentIndex, isLoading])

  // 德语特殊字符替换
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

  // 标准化输入
  const normalizeInput = (input) => {
    if (!input || typeof input !== 'string') {
      return { normalized: '', withReplacement: '' }
    }
    let normalized = input.trim().toLowerCase().replace(/[.,!?;:]/g, '')
    let withReplacement = getGermanReplacement(normalized)
    return { normalized, withReplacement }
  }

  // 检查单词
  const checkWord = (index) => {
    const currentLesson = lessons[currentIndex]
    if (!currentLesson) return false

    const userInput = userInputs[index] || ''
    const correctAnswer = currentLesson.answerDeTokens[index]?.text

    if (!correctAnswer) return false

    const { normalized, withReplacement } = normalizeInput(userInput)

    const isCorrect = normalized === correctAnswer.toLowerCase() ||
                     withReplacement === correctAnswer.toLowerCase()

    return isCorrect
  }

  // 提交整句
  const handleSubmit = () => {
    const currentLesson = lessons[currentIndex]
    if (!currentLesson) return

    const allCorrect = currentLesson.answerDeTokens.every((_, index) => checkWord(index))

    if (allCorrect) {
      setFeedback('correct')
      setScore(prev => prev + 100)
      setIsCompleted(true)

      // 记录正确答案
      const sentenceId = `${practiceSet?.practiceId || 'practice'}-${currentLesson.id}`
      progressTracker.recordPractice(sentenceId, {
        courseId: practiceSet?.practiceId || 'practice',
        courseName: practiceSet?.title || '音频练习',
        level: practiceSet?.source || 'podcast',
        german: currentLesson.answerDeTokens.map(t => t.text).join(' '),
        chinese: ''
      }, true, 'builder')

      setTimeout(() => {
        if (currentIndex < lessons.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          markListened()
        }
      }, 1500)
    } else {
      setFeedback('incorrect')

      // 记录错误
      const sentenceId = `${practiceSet?.practiceId || 'practice'}-${currentLesson.id}`
      progressTracker.recordError(sentenceId, {
        courseId: practiceSet?.practiceId || 'practice',
        courseName: practiceSet?.title || '音频练习',
        level: practiceSet?.source || 'podcast',
        german: currentLesson.answerDeTokens.map(t => t.text).join(' '),
        chinese: ''
      }, 'builder')

      setTimeout(() => setFeedback(null), 2000)
    }
  }

  const markListened = async () => {
    if (!practiceSet?.practiceId) return
    try {
      await fetch(`${API_BASE}/api/practice/mark-listened`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceId: practiceSet.practiceId, listened: true })
      })
      const today = new Date().toDateString()
      const saved = localStorage.getItem(`${storagePrefix}-daily-progress`)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.date === today) {
          data.completedSets = (data.completedSets || 0) + 1
          localStorage.setItem(`${storagePrefix}-daily-progress`, JSON.stringify(data))
        }
      } else {
        const newDay = {
          sets: 1,
          completedSets: 1,
          sentences: 0,
          completed: 0,
          timeSpent: 0,
          date: today
        }
        localStorage.setItem(`${storagePrefix}-daily-progress`, JSON.stringify(newDay))
      }
    } catch (error) {
      console.error('标记已听失败', error)
    }
  }

  const toggleFavorite = async () => {
    if (!practiceSet?.practiceId) return
    const currentLesson = lessons[currentIndex]
    if (!currentLesson?.originalSentence) return

    const sentenceId = String(currentLesson.originalSentence.id)
    const sentenceText =
      currentLesson.originalSentence.german ||
      currentLesson.originalSentence.text ||
      currentLesson.originalSentence.english ||
      ''
    const isFavorite = favoriteSet.has(sentenceId)
    const nextSet = new Set(favoriteSet)

    try {
      if (isFavorite) {
        await fetch(`${API_BASE}/api/practice/favorites`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ practiceId: practiceSet.practiceId, sentenceId: sentenceId })
        })
        nextSet.delete(sentenceId)
      } else {
        await fetch(`${API_BASE}/api/practice/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              practiceId: practiceSet.practiceId,
              sentenceId: sentenceId,
              german: sentenceText,
              start: currentLesson.start,
              end: currentLesson.end,
              audioId: practiceSet.audioId || '',
              source: practiceSet.source || '',
              title: practiceSet.title || '',
            language: language || ''
          })
        })
        nextSet.add(sentenceId)
      }
      setFavoriteSet(nextSet)
      await refreshFavorites()
    } catch (error) {
      console.error('收藏操作失败', error)
      setFavoriteError('收藏保存失败')
    }
  }

  // 键盘事件处理
  const handleKeyDown = (e, index) => {
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault()
      e.stopPropagation()
      playAudio()
      return
    }

      if (e.ctrlKey && (e.key === ';' || e.key === '；' || e.code === 'Semicolon')) {
        e.preventDefault()
        e.stopPropagation()
        setShowAnswers(prev => !prev) // 切换显示/隐藏答案
        return
      }

      if (e.ctrlKey && (e.key === "'" || e.key === '’' || e.code === 'Quote')) {
        e.preventDefault()
        e.stopPropagation()
        setShowTranslation(prev => !prev)
        return
      }

    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
      return
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (index > 0) {
        setCurrentWordIndex(index - 1)
      }
      return
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (index < userInputs.length - 1) {
        setCurrentWordIndex(index + 1)
      }
      return
    }

    if ((e.key === ' ' || e.key === 'Tab') && !e.shiftKey) {
      e.preventDefault()
      if (index < userInputs.length - 1) {
        setCurrentWordIndex(index + 1)
      }
      return
    }

    if ((e.shiftKey && e.key === 'Tab') ||
        (e.key === 'Backspace' && !userInputs[index])) {
      e.preventDefault()
      if (index > 0) {
        setCurrentWordIndex(index - 1)
      }
    }
  }

  // 输入处理
  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs]
    newInputs[index] = value
    setUserInputs(newInputs)
    setFeedback(null)
  }

  // 播放音频片段
  const playAudio = useCallback(() => {
    const currentLesson = lessons[currentIndex]
    if (!currentLesson) return
    if (!audioRef.current) return

    if (stopHandlerRef.current) {
      audioRef.current.removeEventListener('timeupdate', stopHandlerRef.current)
      stopHandlerRef.current = null
    }

    const audio = audioRef.current
    const startTime = Math.max(0, (currentLesson.start || 0) - 0.15)
    const endTime = (currentLesson.end || audio.duration) + 0.15
    audio.currentTime = startTime
    audio.play()

    const stopAtEnd = () => {
      if (audio.currentTime >= endTime) {
        audio.pause()
        audio.removeEventListener('timeupdate', stopAtEnd)
        stopHandlerRef.current = null
      }
    }

    stopHandlerRef.current = stopAtEnd
    audio.addEventListener('timeupdate', stopAtEnd)
  }, [currentIndex, lessons])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 检查是否在输入框内
      const activeElement = document.activeElement
      const isInInput = activeElement?.tagName === 'INPUT'

      // Ctrl + ; 切换显示答案（全局）
      if (e.ctrlKey && (e.key === ';' || e.key === '；' || e.code === 'Semicolon')) {
        e.preventDefault()
        e.stopPropagation()
        setShowAnswers(prev => !prev)
        return
      }

      if (e.ctrlKey && (e.key === "'" || e.key === '’' || e.code === 'Quote')) {
        e.preventDefault()
        e.stopPropagation()
        setShowTranslation(prev => !prev)
        return
      }

      // Ctrl + P 播放音频（全局）
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        e.stopPropagation()
        playAudio()
        return
      }

      // Enter 提交（不在输入框内时）
      if (e.key === 'Enter' && !isInInput && !isCompleted) {
        e.preventDefault()
        handleSubmit()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isCompleted, playAudio])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    if (stopHandlerRef.current) {
      audioRef.current.removeEventListener('timeupdate', stopHandlerRef.current)
      stopHandlerRef.current = null
    }
    // 自动播放当前句子片段
    setTimeout(() => {
      playAudio()
    }, 200)
  }, [currentIndex, playAudio])

    const toggleShowAnswers = () => {
      setShowAnswers(!showAnswers)
    }

    const toggleShowTranslation = () => {
      setShowTranslation(!showTranslation)
    }

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const goNext = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const currentLesson = lessons[currentIndex]
  const progress = currentIndex + 1
  const total = lessons.length || 1
  const progressPercent = total > 0 ? (progress / total) * 100 : 0

  // 加载状态
  if (isLoading || !currentLesson) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
          <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-400 mb-2">
            {strings.loading}
          </p>
          <p className="text-sm text-gray-600">{practiceSet?.title || strings.practiceTitle}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 overflow-hidden select-none ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <audio
        ref={audioRef}
        src={practiceSet?.audioId ? `${API_BASE}/api/practice/audio/${encodeURIComponent(practiceSet.audioId)}` : ''}
      />
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-dark-border' : 'border-gray-200'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onHomeClick}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
              title="返回首页"
            >
              <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="flex-1 text-center px-8">
              <p className="text-xl text-gray-200 font-medium animate-fade-in">
                {practiceSet?.title || strings.practiceTitle}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {favoriteError && (
                <span className="text-xs text-red-400">{favoriteError}</span>
              )}
              <button
                onClick={toggleFavorite}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-all duration-200 hover:scale-110"
                title="收藏句子"
              >
                <svg className={`w-5 h-5 ${favoriteSet.has(String(currentLesson.originalSentence?.id)) ? 'text-yellow-400' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-all duration-200 hover:scale-110"
                title={darkMode ? "切换到浅色模式" : "切换到深色模式"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button onClick={playAudio} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-all duration-200 hover:scale-110">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>

          <div className={`mt-4 h-1 rounded-full overflow-hidden ${darkMode ? 'bg-dark-surface' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* 状态显示 */}
      <div className={`fixed top-24 right-6 flex items-center space-x-4 ${darkMode ? 'bg-dark-card/90 border-dark-border' : 'bg-white/90 border-gray-200'} backdrop-blur-sm px-6 py-3 rounded-xl border shadow-xl animate-slide-in-right`}>
        <div className={`font-bold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{score}</div>
        <div className={`w-px h-8 ${darkMode ? 'bg-dark-border' : 'bg-gray-200'}`}></div>
        <div className="flex items-center space-x-2">
          <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{progress}</span>
          <span className={`text-lg ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>/</span>
          <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{total}</span>
        </div>
        <div className={`w-px h-8 ${darkMode ? 'bg-dark-border' : 'bg-gray-200'}`}></div>
        <div className={`font-mono text-lg ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{formatTime(elapsedTime)}</div>
      </div>

      {/* 主内容 */}
      <main className="container mx-auto px-6 pt-32 pb-32 h-screen flex flex-col items-center justify-center overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          {/* 中文题干 */}
            <div className="text-center mb-20 animate-slide-in-up">
              <div className={`inline-block ${darkMode ? 'bg-dark-card/50 border-dark-border' : 'bg-white/50 border-gray-200'} backdrop-blur-sm px-8 py-6 rounded-2xl border`}>
                <p className={`text-4xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {strings.sentence} {currentIndex + 1} / {total}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{strings.sentencePrompt}</p>
                {showTranslation && (
                  <p className={`mt-3 text-base ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {currentLesson?.originalSentence?.chinese || currentLesson?.originalSentence?.translation || '暂无翻译'}
                  </p>
                )}
              </div>
            </div>

          {/* 分词输入 */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {currentLesson.answerDeTokens.map((token, index) => {
              const isCorrect = checkWord(index)
              const isCurrent = index === currentWordIndex
              const userInput = userInputs[index] || ''
              const hasInput = userInput.length > 0

              return (
                <div
                  key={index}
                  className={`
                    relative animate-scale-in
                    ${index === 0 ? 'animation-delay-0' : ''}
                    ${index === 1 ? 'animation-delay-100' : ''}
                    ${index === 2 ? 'animation-delay-200' : ''}
                    ${index === 3 ? 'animation-delay-300' : ''}
                    ${index === 4 ? 'animation-delay-400' : ''}
                    ${index === 5 ? 'animation-delay-500' : ''}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      value={showAnswers ? token.text : userInput}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`
                        px-6 py-4 text-2xl font-medium min-w-[140px] text-center
                        border-b-4 outline-none transition-all duration-300 bg-transparent
                        ${isCurrent
                          ? `border-accent-purple-500 bg-accent-purple-500/10 ${darkMode ? 'text-white' : 'text-gray-900'} shadow-glow animate-glow-pulse`
                          : hasInput
                            ? isCorrect
                              ? 'border-status-success bg-status-success/10 text-status-success'
                              : 'border-status-error bg-status-error/10 text-status-error'
                            : `${darkMode ? 'border-dark-border text-gray-500 hover:border-gray-600' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`
                        }
                        ${feedback === 'correct' ? 'border-status-success shadow-glow-success' : ''}
                        ${feedback === 'incorrect' && !isCorrect ? 'border-status-error shadow-glow-error animate-shake' : ''}
                      `}
                      autoFocus={isCurrent}
                    />

                    {token.hasPunctuation && (
                      <span className="text-3xl text-gray-500 font-medium">.</span>
                    )}
                  </div>

                  {/* 当前指示器 */}
                  {isCurrent && !userInput && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in">
                      <div className="flex items-center space-x-2 bg-dark-card/80 px-3 py-1 rounded-lg border border-dark-border">
                        <span className="text-xs text-gray-500">{strings.inputHint}</span>
                        <kbd className="px-2 py-1 text-xs bg-dark-surface text-gray-400 rounded border border-dark-border">{strings.space}</kbd>
                      </div>
                    </div>
                  )}

                  {/* 正确指示 */}
                  {hasInput && isCorrect && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-status-success rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 反馈消息 */}
          {feedback && (
            <div className={`text-center mb-8 animate-slide-in-up ${
              feedback === 'correct' ? 'text-status-success' : 'text-status-error'
            }`}>
              <div className={`inline-block px-8 py-4 rounded-xl ${
                feedback === 'correct' ? 'bg-status-success/10 border border-status-success/30' : 'bg-status-error/10 border border-status-error/30'
              }`}>
                <p className="text-3xl font-semibold mb-2">
                  {feedback === 'correct' ? strings.correct : strings.incorrect}
                </p>
                <p className="text-sm opacity-80">
                  {feedback === 'correct' ? strings.correctSub : strings.incorrectSub}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 底部控制栏 */}
      <footer className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-black/90 border-dark-border' : 'bg-white/90 border-gray-200'} backdrop-blur-md border-t`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className={`p-3 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 ${darkMode ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
            >
              <span className="text-xs text-white/70">{strings.prev}</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={playAudio}
                className={`px-5 py-3 rounded-xl text-sm transition-all duration-200 border hover:scale-105 ${darkMode ? 'bg-dark-card hover:bg-dark-surface text-gray-300 border-dark-border hover:border-purple-500/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
              >
                <span className="flex items-center space-x-2">
                  <kbd className={`px-2 py-1 rounded border text-xs ${darkMode ? 'bg-dark-surface text-gray-400 border-dark-border' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>Ctrl+P</kbd>
                  <span>{strings.play}</span>
                </span>
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-3 bg-accent-purple-600 hover:bg-accent-purple-700 rounded-xl text-sm text-white transition-all duration-200 shadow-lg hover:shadow-glow hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-accent-purple-700 text-white rounded text-xs">Enter</kbd>
                  <span>{strings.submit}</span>
                </span>
              </button>
                <button
                  onClick={toggleShowAnswers}
                  className={`px-5 py-3 rounded-xl text-sm transition-all duration-200 border hover:scale-105 ${darkMode ? 'bg-dark-card hover:bg-dark-surface text-gray-300 border-dark-border hover:border-purple-500/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
                >
                  <span className="flex items-center space-x-2">
                    <kbd className={`px-2 py-1 rounded border text-xs ${darkMode ? 'bg-dark-surface text-gray-400 border-dark-border' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>Ctrl+;</kbd>
                    <span>{showAnswers ? (isEnglishText ? 'Hide' : '隐藏') : strings.answer}</span>
                  </span>
                </button>
                <button
                  onClick={toggleShowTranslation}
                  className={`px-5 py-3 rounded-xl text-sm transition-all duration-200 border hover:scale-105 ${darkMode ? 'bg-dark-card hover:bg-dark-surface text-gray-300 border-dark-border hover:border-purple-500/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
                >
                  <span className="flex items-center space-x-2">
                    <kbd className={`px-2 py-1 rounded border text-xs ${darkMode ? 'bg-dark-surface text-gray-400 border-dark-border' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>Ctrl+'</kbd>
                    <span>{showTranslation ? (isEnglishText ? 'Hide' : '隐藏翻译') : (isEnglishText ? 'Translation' : '显示翻译')}</span>
                  </span>
                </button>
              </div>

            <button
              onClick={goNext}
              disabled={currentIndex >= lessons.length - 1}
              className={`p-3 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 ${darkMode ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
            >
              <span className="text-xs text-white/70">{strings.next}</span>
            </button>
          </div>

          <button className={`absolute bottom-4 right-4 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}>
            <svg className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}

export default SentenceBuilderEnhanced
