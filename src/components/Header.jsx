function Header({ onHomeClick, language, onLanguageChange }) {
  const isEnglishTheme = language === 'en'
  const isEnglishText = false
  return (
    <header className="bg-[#0b0b0c]/95 backdrop-blur sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full shadow-[0_6px_18px_rgba(29,185,84,0.35)] ${
                isEnglishTheme
                  ? 'bg-gradient-to-br from-amber-400 to-orange-300 shadow-[0_6px_18px_rgba(251,146,60,0.35)]'
                  : 'bg-gradient-to-br from-[#1DB954] to-emerald-300'
              }`}
            />
            <div>
              <div className="text-lg font-semibold text-white">
                {isEnglishText ? 'Language Learning Assistant' : '语言学习助手'}
              </div>
              <div className="text-xs text-white/60">Local Practice</div>
            </div>
          </button>

          <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            {isEnglishText ? 'Local Podcast Dictation' : '本地播客听写练习'}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="text-[11px] text-white/50">Language</div>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
            <button
              onClick={() => onLanguageChange('de')}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                language === 'de'
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              DE
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                language === 'en'
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
