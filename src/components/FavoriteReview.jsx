import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

const API_BASE = 'http://localhost:3001'

function FavoriteReview({ onHomeClick, language }) {
  const isEnglishText = false
  const strings = {
    loading: isEnglishText ? 'Loading favorites...' : '加载收藏中...',
    emptyTitle: isEnglishText ? 'No favorites yet' : '没有收藏句子',
    emptySub: isEnglishText ? 'Star a sentence during practice to review it here' : '在练习中点星标即可加入复习题库',
    back: isEnglishText ? 'Back' : '返回首页',
    review: isEnglishText ? 'Review' : '开始复习',
    random: isEnglishText ? 'Random' : '随机中',
    normal: isEnglishText ? 'Normal' : '顺序',
    remove: isEnglishText ? 'Remove' : '取消收藏',
    sentence: isEnglishText ? 'Sentence' : '句子',
    prompt: isEnglishText ? 'Dictate and rebuild the sentence' : '听写并拼出完整句子',
    correct: isEnglishText ? 'Correct, next one' : '正确，进入下一句',
    incorrect: isEnglishText ? 'Incorrect, try again' : '有错误，请再听一遍',
    prev: isEnglishText ? 'Previous' : '上一句',
    next: isEnglishText ? 'Next' : '下一句',
    play: isEnglishText ? 'Play' : '播放',
    submit: isEnglishText ? 'Submit' : '提交',
    answer: isEnglishText ? 'Answer' : '答案',
    removeThis: isEnglishText ? 'Remove favorite' : '取消收藏本句'
  }
  const [favorites, setFavorites] = useState([])
  const [mode, setMode] = useState('normal') // normal | random
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInputs, setUserInputs] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const inputRefs = useRef([])
  const audioRef = useRef(null)
  const stopHandlerRef = useRef(null)

  useEffect(() => {
    loadFavorites()
  }, [language])

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      const url = new URL(`${API_BASE}/api/practice/favorites`)
      if (language) {
        url.searchParams.set('lang', language)
      }
      const res = await fetch(url.toString())
      const data = await res.json()
      setFavorites(data.favorites || [])
      setCurrentIndex(0)
    } catch (error) {
      console.error('加载收藏失败', error)
    } finally {
      setIsLoading(false)
    }
  }

  const shuffledFavorites = useMemo(() => {
    if (mode !== 'random') return favorites
    const copy = [...favorites]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [favorites, mode])

  const currentFav = shuffledFavorites[currentIndex] || null
  const tokens = currentFav?.german ? currentFav.german.split(' ').map(token => ({
    text: token.replace(/[.,!?]/g, ''),
    hasPunctuation: /[.,!?]/.test(token)
  })) : []

  useEffect(() => {
    setUserInputs(new Array(tokens.length).fill(''))
    setCurrentWordIndex(0)
    setFeedback(null)
    setShowAnswers(false)
  }, [currentIndex, shuffledFavorites.length])

  useEffect(() => {
    if (currentIndex > shuffledFavorites.length - 1) {
      setCurrentIndex(Math.max(shuffledFavorites.length - 1, 0))
    }
  }, [shuffledFavorites.length, currentIndex])

  useEffect(() => {
    if (inputRefs.current[currentWordIndex]) {
      inputRefs.current[currentWordIndex].focus()
    }
  }, [currentWordIndex, currentIndex])

  const normalizeInput = (input) => {
    if (!input || typeof input !== 'string') {
      return { normalized: '', withReplacement: '' }
    }
    let normalized = input.trim().toLowerCase().replace(/[.,!?;:]/g, '')
    let withReplacement = normalized
      .replace(/ae/g, 'ä')
      .replace(/oe/g, 'ö')
      .replace(/ue/g, 'ü')
      .replace(/ss/g, 'ß')
      .replace(/Ae/g, 'Ä')
      .replace(/Oe/g, 'Ö')
      .replace(/Ue/g, 'Ü')
    return { normalized, withReplacement }
  }

  const checkWord = (index) => {
    const correctAnswer = tokens[index]?.text
    if (!correctAnswer) return false
    const userInput = userInputs[index] || ''
    const { normalized, withReplacement } = normalizeInput(userInput)
    return (
      normalized === correctAnswer.toLowerCase() ||
      withReplacement === correctAnswer.toLowerCase()
    )
  }

  const handleSubmit = () => {
    if (!currentFav) return
    const allCorrect = tokens.every((_, idx) => checkWord(idx))
    setFeedback(allCorrect ? 'correct' : 'incorrect')
    if (allCorrect) {
      setTimeout(() => goNext(), 800)
    } else {
      setTimeout(() => setFeedback(null), 1200)
    }
  }

  const playAudio = useCallback(() => {
    if (!currentFav || !audioRef.current) return
    if (stopHandlerRef.current) {
      audioRef.current.removeEventListener('timeupdate', stopHandlerRef.current)
      stopHandlerRef.current = null
    }
    const audio = audioRef.current
    const startTime = Math.max(0, (currentFav.start || 0) - 0.15)
    const endTime = (currentFav.end || audio.duration) + 0.15
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
  }, [currentFav])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement
      const isInInput = activeElement?.tagName === 'INPUT'

      if (e.ctrlKey && e.key === ';') {
        e.preventDefault()
        setShowAnswers(prev => !prev)
        return
      }

      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        playAudio()
        return
      }

      if (e.key === 'Enter' && !isInInput) {
        e.preventDefault()
        handleSubmit()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playAudio])

  const handleInputChange = (index, value) => {
    const next = [...userInputs]
    next[index] = value
    setUserInputs(next)
    setFeedback(null)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
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

  const goPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  const goNext = () => {
    if (currentIndex < shuffledFavorites.length - 1) setCurrentIndex(prev => prev + 1)
  }

  const removeCurrentFavorite = async () => {
    if (!currentFav) return
    await fetch(`${API_BASE}/api/practice/favorites`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ practiceId: currentFav.practiceId, sentenceId: currentFav.sentenceId })
    })
    const nextIndex = currentIndex
    await loadFavorites()
    setCurrentIndex(prev => {
      if (shuffledFavorites.length === 0) return 0
      return Math.min(nextIndex, shuffledFavorites.length - 1)
    })
  }

  if (isLoading) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">{strings.loading}</div>
      </div>
    )
  }

  if (!currentFav) {
    return (
      <div className="max-w-3xl mx-auto px-4">
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold mb-2">{strings.emptyTitle}</h2>
            <p className="text-gray-600">{strings.emptySub}</p>
            <button onClick={onHomeClick} className="mt-6 px-6 py-3 bg-german-red text-white rounded-lg">
              {strings.back}
            </button>
          </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 overflow-hidden select-none ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <audio
        ref={audioRef}
        src={currentFav.audioId ? `${API_BASE}/api/practice/audio/${encodeURIComponent(currentFav.audioId)}` : ''}
      />

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
              <p className="text-xl text-gray-200 font-medium">{strings.review}</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-400 px-3 py-1 rounded-full border border-dark-border">
                {currentIndex + 1} / {shuffledFavorites.length}
              </div>
              <button
                onClick={() => {
                  setMode(prev => (prev === 'normal' ? 'random' : 'normal'))
                  setCurrentIndex(0)
                }}
                className="px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-gray-300 text-sm"
              >
                {mode === 'random' ? strings.random : strings.normal}
              </button>
              <button
                onClick={removeCurrentFavorite}
                className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm"
              >
                {strings.remove}
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
        </div>
      </header>

      <main className="container mx-auto px-6 pt-32 pb-32 h-screen flex flex-col items-center justify-center overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-16 animate-slide-in-up">
            <div className={`inline-block ${darkMode ? 'bg-dark-card/50 border-dark-border' : 'bg-white/50 border-gray-200'} backdrop-blur-sm px-8 py-6 rounded-2xl border shadow-lg`}>
              <p className={`text-4xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {strings.sentence} {currentIndex + 1} / {shuffledFavorites.length}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{strings.prompt}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {tokens.map((token, index) => {
              const isCorrect = checkWord(index)
              const isCurrent = index === currentWordIndex
              const userInput = userInputs[index] || ''
              const hasInput = userInput.length > 0

              return (
                <div key={index} className="relative animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
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
                      `}
                      autoFocus={isCurrent}
                    />

                    {token.hasPunctuation && (
                      <span className="text-3xl text-gray-500 font-medium">.</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {feedback && (
            <div className={`text-center mb-8 ${feedback === 'correct' ? 'text-status-success' : 'text-status-error'}`}>
              {feedback === 'correct' ? strings.correct : strings.incorrect}
            </div>
          )}
        </div>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-black/90 border-dark-border' : 'bg-white/90 border-gray-200'} backdrop-blur-md border-t`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className={`p-3 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 ${darkMode ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
            >
              {strings.prev}
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={playAudio}
                className={`px-5 py-3 rounded-xl text-sm transition-all duration-200 border hover:scale-105 ${darkMode ? 'bg-dark-card hover:bg-dark-surface text-gray-300 border-dark-border hover:border-purple-500/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
              >
                Ctrl+P {strings.play}
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-3 bg-accent-purple-600 hover:bg-accent-purple-700 rounded-xl text-sm text-white transition-all duration-200 shadow-lg hover:shadow-glow hover:scale-105"
              >
                Enter {strings.submit}
              </button>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className={`px-5 py-3 rounded-xl text-sm transition-all duration-200 border hover:scale-105 ${darkMode ? 'bg-dark-card hover:bg-dark-surface text-gray-300 border-dark-border hover:border-purple-500/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
              >
                Ctrl+; {showAnswers ? (isEnglishText ? 'Hide' : '隐藏') : strings.answer}
              </button>
              <button
                onClick={removeCurrentFavorite}
                className={`px-5 py-3 rounded-xl text-sm transition-all duration-200 border hover:scale-105 ${darkMode ? 'bg-dark-card hover:bg-dark-surface text-red-300 border-dark-border hover:border-red-400/60' : 'bg-gray-100 hover:bg-gray-200 text-red-600 border-gray-200'}`}
              >
                {strings.removeThis}
              </button>
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex >= shuffledFavorites.length - 1}
              className={`p-3 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 ${darkMode ? 'hover:bg-dark-card' : 'hover:bg-gray-100'}`}
            >
              {strings.next}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FavoriteReview
