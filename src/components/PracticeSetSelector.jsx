import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const API_BASE = 'http://localhost:3001'

function PracticeSetSelector({ onSelectSet, onBack, language }) {
  const isEnglishTheme = language === 'en'
  const isEnglishText = false
  const strings = {
    title: isEnglishText ? 'Choose Source' : '选择音源',
    subtitle: isEnglishText ? 'Pick a podcast channel to practice' : '从播客频道中选择要练习的题库',
    back: isEnglishText ? 'Back' : '返回',
    sourceList: isEnglishText ? 'Sources' : '音源列表',
    refresh: isEnglishText ? 'Refresh' : '刷新',
    loading: isEnglishText ? 'Loading...' : '加载中...',
    noSets: isEnglishText ? 'No practice sets found. Run scripts/generate-subtitles.py first.' : '没有找到练习集。请先运行 `scripts/generate-subtitles.py` 生成练习集。',
    selectHint: isEnglishText ? 'Open this channel' : '选择进入该频道的练习集',
    channelSets: isEnglishText ? 'Practice sets' : '练习集',
    hideListened: isEnglishText ? 'Hide listened' : '隐藏已听',
    noSetsInChannel: isEnglishText ? 'No practice sets in this source.' : '该音源暂无练习集。',
    sentenceCount: isEnglishText ? 'Sentences' : '句子数',
    date: isEnglishText ? 'Date' : '日期',
    updated: isEnglishText ? 'Updated' : '更新',
    listened: isEnglishText ? 'Listened' : '已听完',
    unlistened: isEnglishText ? 'Unlistened' : '未听',
    favorites: isEnglishText ? 'Favorites' : '收藏',
    favoriteBtn: isEnglishText ? 'Star' : '收藏',
    deleteBtn: isEnglishText ? 'Delete' : '删除',
    start: isEnglishText ? 'Start' : '开始练习',
    errorLoad: isEnglishText ? 'Cannot reach backend. Run npm run server.' : '无法连接到后端服务，请先运行 npm run server',
    errorLoadSets: isEnglishText ? 'Failed to load sets.' : '加载练习集失败',
    errorFavorite: isEnglishText ? 'Failed to update favorite.' : '收藏操作失败',
    errorDelete: isEnglishText ? 'Failed to delete.' : '删除失败'
  }
  const [sources, setSources] = useState([])
  const [selectedSource, setSelectedSource] = useState(null)
  const [sets, setSets] = useState([])
  const [loadingSources, setLoadingSources] = useState(true)
  const [loadingSets, setLoadingSets] = useState(false)
  const [error, setError] = useState(null)
  const [hideListened, setHideListened] = useState(false)

  useEffect(() => {
    setSelectedSource(null)
    setSets([])
    loadSources()
  }, [language])

  const loadSources = async () => {
    setLoadingSources(true)
    setError(null)
    try {
      const url = new URL(`${API_BASE}/api/practice/sources`)
      if (language) {
        url.searchParams.set('lang', language)
      }
      const res = await fetch(url.toString())
      const data = await res.json()
      setSources(data.sources || [])
    } catch (err) {
      setError(strings.errorLoad)
    } finally {
      setLoadingSources(false)
    }
  }

  const loadSets = async (sourceName) => {
    setLoadingSets(true)
    setError(null)
    try {
      const url = new URL(`${API_BASE}/api/practice/sets`)
      if (sourceName) {
        url.searchParams.set('source', sourceName)
      }
      if (language) {
        url.searchParams.set('lang', language)
      }
      const res = await fetch(url.toString())
      const data = await res.json()
      const sorted = [...(data.sets || [])].sort((a, b) => {
        const at = a.practiceDate ? new Date(a.practiceDate).getTime() : new Date(a.modifiedTime).getTime()
        const bt = b.practiceDate ? new Date(b.practiceDate).getTime() : new Date(b.modifiedTime).getTime()
        return bt - at
      })
      setSets(sorted)
    } catch (err) {
      setError(strings.errorLoadSets)
    } finally {
      setLoadingSets(false)
    }
  }

  const handleSelectSource = (sourceName) => {
    setSelectedSource(sourceName)
    loadSets(sourceName)
  }

  const handleSelectSet = (setItem) => {
    onSelectSet(setItem)
  }

  const toggleFavoriteSet = async (setItem) => {
    try {
      await fetch(`${API_BASE}/api/practice/favorite-set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceId: setItem.practiceId, favorite: !setItem.favoriteSet })
      })
      await loadSets(selectedSource)
    } catch (err) {
      setError(strings.errorFavorite)
    }
  }

  const deletePracticeSet = async (setItem) => {
    const ok = confirm(`确定删除练习集: ${setItem.title} ?`)
    if (!ok) return
    try {
      await fetch(`${API_BASE}/api/practice/set`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceId: setItem.practiceId })
      })
      await loadSets(selectedSource)
    } catch (err) {
      setError(strings.errorDelete)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
      <div className="rounded-3xl p-6 mb-6 bg-[#111112] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2">{strings.title}</h2>
            <p className="text-white/60">{strings.subtitle}</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
          >
            {strings.back}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3">
          {error}
        </div>
      )}

      <div className="rounded-3xl p-5 mb-6 bg-[#111112] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">音源列表</h3>
          <button
            onClick={loadSources}
            className="text-xs text-white/60 hover:text-white"
          >
            {strings.refresh}
          </button>
        </div>
        {loadingSources ? (
          <div className="text-white/60">{strings.loading}</div>
        ) : sources.length === 0 ? (
          <div className="text-white/60">{strings.noSets}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sources.map((source) => (
              <motion.button
                key={source.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectSource(source.name)}
                className={`text-left p-5 rounded-2xl border transition-all ${
                  selectedSource === source.name
                    ? 'bg-gradient-to-br from-white/8 to-white/5 border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.35)]'
                    : 'bg-[#171718] border-white/10 hover:border-white/20 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white ${
                    isEnglishTheme
                      ? 'bg-gradient-to-br from-sky-500/30 to-blue-400/30'
                      : 'bg-gradient-to-br from-[#1DB954]/30 to-emerald-300/30'
                  }`}>
                    {source.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs text-white/60">{source.count} 套</div>
                </div>
                <div className="text-base font-semibold text-white line-clamp-2">
                  {source.name}
                </div>
                <div className="mt-2 text-xs text-white/50">
                  {strings.selectHint}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {selectedSource && (
        <div className="rounded-3xl p-5 bg-[#111112] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedSource} {strings.channelSets}
            </h3>
            <div className="flex items-center gap-4">
              <label className="text-xs text-white/60 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hideListened}
                  onChange={(e) => setHideListened(e.target.checked)}
                />
                {strings.hideListened}
              </label>
              <button
                onClick={() => loadSets(selectedSource)}
                className="text-xs text-white/60 hover:text-white"
              >
                {strings.refresh}
              </button>
            </div>
          </div>

          {loadingSets ? (
            <div className="text-white/60">{strings.loading}</div>
          ) : sets.length === 0 ? (
            <div className="text-white/60">{strings.noSetsInChannel}</div>
          ) : (
            <div className="space-y-3">
              {sets
                .filter(setItem => !hideListened || !setItem.listened)
                .map((setItem) => (
                <div
                  key={setItem.practiceId}
                  className="flex items-center justify-between p-4 bg-[#171718] rounded-2xl border border-white/10"
                >
                  <div>
                    <div className="text-base font-semibold text-white">
                      {setItem.title}
                    </div>
                    <div className="text-xs text-white/60">
                      {strings.sentenceCount}: {setItem.totalSentences}
                      {setItem.practiceDate ? ` ・ ${strings.date}: ${setItem.practiceDate}` : ''}
                      {` ・ ${strings.updated}: ${new Date(setItem.modifiedTime).toLocaleString()}`}
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      {setItem.listened ? strings.listened : strings.unlistened}
                      {setItem.favoriteCount > 0 ? ` ・ ${strings.favorites}: ${setItem.favoriteCount}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavoriteSet(setItem)}
                      className={`px-3 py-2 rounded-full border text-xs ${
                        setItem.favoriteSet ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' : 'bg-white/5 text-white/70 border-white/10'
                      }`}
                    >
                      {strings.favoriteBtn}
                    </button>
                    <button
                      onClick={() => deletePracticeSet(setItem)}
                      className="px-3 py-2 rounded-full border border-red-400/30 text-red-200 bg-red-500/10 text-xs"
                    >
                      {strings.deleteBtn}
                    </button>
                    <button
                      onClick={() => handleSelectSet(setItem)}
                      className={`px-4 py-2 text-black rounded-full transition-all text-xs font-semibold ${
                        isEnglishTheme ? 'bg-sky-400 hover:bg-blue-300' : 'bg-[#1DB954] hover:bg-emerald-300'
                      }`}
                    >
                      {strings.start}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PracticeSetSelector

