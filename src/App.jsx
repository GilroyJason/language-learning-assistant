import { useState } from 'react'
import Header from './components/Header'
import QuickStart from './components/QuickStart'
import PracticeSetSelector from './components/PracticeSetSelector'
import SentenceBuilderEnhanced from './components/SentenceBuilderEnhanced'
import FavoriteReview from './components/FavoriteReview'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [selectedSet, setSelectedSet] = useState(null)
  const [language, setLanguage] = useState('de')

  const handleHomeClick = () => {
    setCurrentView('home')
    setSelectedSet(null)
  }

  const handleStartLearning = () => {
    setCurrentView('select')
  }

  const handleSelectSet = (practiceSet) => {
    setSelectedSet(practiceSet)
    setCurrentView('practice')
  }

  const handleStartReview = () => {
    setCurrentView('review')
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      {currentView !== 'practice' && (
        <Header
          onHomeClick={handleHomeClick}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      <main className={currentView === 'practice' ? 'w-full h-screen' : 'w-full px-3 sm:px-6 py-6'}>
        {currentView === 'home' && (
          <div className="animate-slide-in">
            <QuickStart
              onStartLearning={handleStartLearning}
              onStartReview={handleStartReview}
              language={language}
            />
          </div>
        )}

        {currentView === 'select' && (
          <div className="animate-slide-in">
            <PracticeSetSelector
              onSelectSet={handleSelectSet}
              onBack={handleHomeClick}
              language={language}
            />
          </div>
        )}

        {currentView === 'practice' && selectedSet && (
          <SentenceBuilderEnhanced
            practiceSet={selectedSet}
            language={language}
            onHomeClick={() => setCurrentView('select')}
          />
        )}

        {currentView === 'review' && (
          <FavoriteReview onHomeClick={handleHomeClick} language={language} />
        )}
      </main>
    </div>
  )
}

export default App
